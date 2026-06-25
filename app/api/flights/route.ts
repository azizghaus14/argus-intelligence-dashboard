import { NextResponse } from "next/server";
import { fetchWithTimeout } from "@/lib/server/fetchJson";
import type { FeedMeta, FeedResponse, Flight } from "@/lib/types";

export const dynamic = "force-dynamic";

// OpenSky REST API:
// https://openskynetwork.github.io/opensky-api/rest.html
const OPENSKY_STATES_URL = "https://opensky-network.org/api/states/all";
const OPENSKY_TOKEN_URL =
  "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";

const TOKEN_REFRESH_MARGIN_MS = 30_000;
const DEFAULT_AUTH_REFRESH_MS = 90_000;
const DEFAULT_ANON_REFRESH_MS = 15 * 60_000;
const DEFAULT_MAX_FLIGHTS = 2_500;

type OpenSkyStateVector = [
  string,
  string | null,
  string,
  number | null,
  number,
  number | null,
  number | null,
  number | null,
  boolean,
  number | null,
  number | null,
  number | null,
  number[] | null,
  number | null,
  string | null,
  boolean,
  number | null,
  number | null,
];

type OpenSkyResponse = {
  time?: number;
  states?: OpenSkyStateVector[] | null;
};

type OpenSkyResult = {
  flights: Flight[];
  upstreamTime?: number;
  fetchedAt: number;
  authenticated: boolean;
};

type CacheEntry = {
  at: number;
  value: OpenSkyResult;
};

type TokenCache = {
  token: string;
  expiresAt: number;
};

class OpenSkyError extends Error {
  status?: number;
  retryAfterSeconds?: number;

  constructor(message: string, status?: number, retryAfterSeconds?: number) {
    super(message);
    this.name = "OpenSkyError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const cache = new Map<string, CacheEntry>();
let tokenCache: TokenCache | null = null;
let rateLimitedUntil = 0;

function readMsEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 10_000 ? parsed : fallback;
}

function readNumberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function hasOAuthConfig(): boolean {
  return Boolean(
    process.env.OPENSKY_ACCESS_TOKEN ||
      (process.env.OPENSKY_CLIENT_ID && process.env.OPENSKY_CLIENT_SECRET)
  );
}

function refreshIntervalMs(): number {
  return readMsEnv(
    "OPENSKY_REFRESH_MS",
    hasOAuthConfig() ? DEFAULT_AUTH_REFRESH_MS : DEFAULT_ANON_REFRESH_MS
  );
}

function maxFlights(): number {
  return Math.floor(readNumberEnv("OPENSKY_MAX_FLIGHTS", DEFAULT_MAX_FLIGHTS));
}

function readBoundsFromEnv(): Record<string, string> | null {
  const raw = process.env.OPENSKY_BOUNDS;
  if (!raw) return null;
  const [lamin, lomin, lamax, lomax] = raw.split(",").map((v) => v.trim());
  if (!lamin || !lomin || !lamax || !lomax) return null;
  return { lamin, lomin, lamax, lomax };
}

function validateBounds(bounds: Record<string, string>): boolean {
  const nums = {
    lamin: Number(bounds.lamin),
    lomin: Number(bounds.lomin),
    lamax: Number(bounds.lamax),
    lomax: Number(bounds.lomax),
  };
  return (
    Number.isFinite(nums.lamin) &&
    Number.isFinite(nums.lomin) &&
    Number.isFinite(nums.lamax) &&
    Number.isFinite(nums.lomax) &&
    nums.lamin >= -90 &&
    nums.lamax <= 90 &&
    nums.lomin >= -180 &&
    nums.lomax <= 180 &&
    nums.lamin < nums.lamax &&
    nums.lomin < nums.lomax
  );
}

function buildOpenSkyUrl(request: Request): string {
  const requestUrl = new URL(request.url);
  const upstream = new URL(OPENSKY_STATES_URL);
  upstream.searchParams.set("extended", "1");

  const bounds = ["lamin", "lomin", "lamax", "lomax"].reduce<Record<string, string>>(
    (acc, key) => {
      const value = requestUrl.searchParams.get(key);
      if (value) acc[key] = value;
      return acc;
    },
    {}
  );
  const resolvedBounds =
    Object.keys(bounds).length > 0 ? bounds : readBoundsFromEnv();

  if (resolvedBounds) {
    if (!validateBounds(resolvedBounds)) {
      throw new OpenSkyError("invalid OpenSky bounding box", 400);
    }
    for (const [key, value] of Object.entries(resolvedBounds)) {
      upstream.searchParams.set(key, value);
    }
  }

  for (const icao of requestUrl.searchParams.getAll("icao24")) {
    if (icao.trim()) upstream.searchParams.append("icao24", icao.trim().toLowerCase());
  }

  return upstream.toString();
}

async function getOpenSkyHeaders(): Promise<Record<string, string>> {
  const staticToken = process.env.OPENSKY_ACCESS_TOKEN;
  if (staticToken) return { Authorization: `Bearer ${staticToken}` };

  const clientId = process.env.OPENSKY_CLIENT_ID;
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return {};

  if (tokenCache && Date.now() < tokenCache.expiresAt - TOKEN_REFRESH_MARGIN_MS) {
    return { Authorization: `Bearer ${tokenCache.token}` };
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetchWithTimeout(OPENSKY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    timeoutMs: 8_000,
  });

  if (!res.ok) throw new OpenSkyError(`opensky auth ${res.status}`, res.status);
  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!json.access_token) throw new OpenSkyError("opensky auth token missing");

  tokenCache = {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 1_800) * 1_000,
  };
  return { Authorization: `Bearer ${tokenCache.token}` };
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function positionSourceName(value: number | null): string {
  switch (value) {
    case 0:
      return "ADS-B";
    case 1:
      return "ASTERIX";
    case 2:
      return "MLAT";
    case 3:
      return "FLARM";
    default:
      return "UNKNOWN";
  }
}

function categoryName(value: number | null): string {
  switch (value) {
    case 2:
      return "LIGHT";
    case 3:
      return "SMALL";
    case 4:
      return "LARGE";
    case 5:
      return "HIGH VORTEX";
    case 6:
      return "HEAVY";
    case 7:
      return "HIGH PERFORMANCE";
    case 8:
      return "ROTORCRAFT";
    case 9:
      return "GLIDER";
    case 10:
      return "LIGHTER THAN AIR";
    case 11:
      return "SKYDIVER";
    case 12:
      return "ULTRALIGHT";
    case 14:
      return "UAV";
    case 15:
      return "SPACE";
    case 16:
      return "EMERGENCY VEHICLE";
    case 17:
      return "SERVICE VEHICLE";
    case 18:
      return "OBSTACLE";
    case 19:
      return "OBSTACLE CLUSTER";
    case 20:
      return "OBSTACLE LINE";
    default:
      return "AIRCRAFT";
  }
}

function isEmergencySquawk(squawk: string | null): boolean {
  return squawk === "7500" || squawk === "7600" || squawk === "7700";
}

function normalizeState(state: OpenSkyStateVector): Flight | null {
  const lng = num(state[5]);
  const lat = num(state[6]);
  if (lng == null || lat == null) return null;
  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) return null;

  const icao24 = String(state[0] ?? "").trim().toLowerCase();
  if (!icao24) return null;

  const timePosition = num(state[3]);
  const lastContact = num(state[4]);
  const baroAlt = num(state[7]);
  const geoAlt = num(state[13]);
  const onGround = Boolean(state[8]);
  const alt = onGround ? 0 : geoAlt ?? baroAlt ?? 0;
  const squawk = typeof state[14] === "string" ? state[14] : null;
  const positionSource = num(state[16]);
  const category = num(state[17]);
  const nowSeconds = Date.now() / 1_000;

  return {
    id: icao24,
    callsign: String(state[1] ?? "").trim() || icao24.toUpperCase(),
    origin: String(state[2] ?? "UNKNOWN"),
    lng,
    lat,
    alt,
    baroAlt,
    geoAlt,
    velocity: num(state[9]) ?? 0,
    heading: num(state[10]) ?? 0,
    verticalRate: num(state[11]),
    squawk,
    lastContact: lastContact ? lastContact * 1_000 : undefined,
    timePosition: timePosition ? timePosition * 1_000 : null,
    positionSource: positionSourceName(positionSource),
    category: categoryName(category),
    emergency: Boolean(state[15]) || isEmergencySquawk(squawk),
    stale: !lastContact || nowSeconds - lastContact > 120,
    onGround,
  };
}

function parseRetryAfter(res: Response): number | undefined {
  const raw =
    res.headers.get("x-rate-limit-retry-after-seconds") ??
    res.headers.get("retry-after");
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.ceil(parsed) : undefined;
}

async function fetchOpenSky(url: string, retryAuth = true): Promise<OpenSkyResult> {
  if (rateLimitedUntil > Date.now()) {
    throw new OpenSkyError(
      "opensky rate limit active",
      429,
      Math.ceil((rateLimitedUntil - Date.now()) / 1_000)
    );
  }

  const headers = await getOpenSkyHeaders();
  const authenticated = Boolean(headers.Authorization);
  const res = await fetchWithTimeout(url, {
    headers,
    timeoutMs: 9_000,
  });

  if (res.status === 401 && authenticated && retryAuth) {
    tokenCache = null;
    return fetchOpenSky(url, false);
  }

  if (!res.ok) {
    const retryAfterSeconds = res.status === 429 ? parseRetryAfter(res) : undefined;
    if (retryAfterSeconds) {
      rateLimitedUntil = Date.now() + retryAfterSeconds * 1_000;
    }
    throw new OpenSkyError(
      `opensky ${res.status}`,
      res.status,
      retryAfterSeconds
    );
  }

  const json = (await res.json()) as OpenSkyResponse;
  const states = Array.isArray(json.states) ? json.states : [];
  const flights = states
    .map(normalizeState)
    .filter((flight): flight is Flight => Boolean(flight))
    .sort((a, b) => (b.lastContact ?? 0) - (a.lastContact ?? 0))
    .slice(0, maxFlights());

  return {
    flights,
    upstreamTime: json.time ? json.time * 1_000 : undefined,
    fetchedAt: Date.now(),
    authenticated,
  };
}

async function load(url: string): Promise<{
  value: OpenSkyResult;
  cacheAgeMs: number;
  stale: boolean;
  status: NonNullable<FeedMeta["status"]>;
  error?: OpenSkyError;
}> {
  const ttlMs = refreshIntervalMs();
  const hit = cache.get(url);
  const age = hit ? Date.now() - hit.at : 0;

  if (hit && age < ttlMs) {
    return {
      value: hit.value,
      cacheAgeMs: age,
      stale: false,
      status: "cached",
    };
  }

  try {
    const value = await fetchOpenSky(url);
    cache.set(url, { at: Date.now(), value });
    return {
      value,
      cacheAgeMs: 0,
      stale: false,
      status: "live",
    };
  } catch (err) {
    if (hit) {
      return {
        value: hit.value,
        cacheAgeMs: age,
        stale: true,
        status: err instanceof OpenSkyError && err.status === 429 ? "rate-limited" : "stale",
        error: err instanceof OpenSkyError ? err : new OpenSkyError("opensky unavailable"),
      };
    }
    throw err;
  }
}

function sourceLabel(authenticated: boolean): string {
  return `OpenSky Network (${authenticated ? "OAuth" : "anonymous"})`;
}

function messageFor(status: FeedMeta["status"], error?: OpenSkyError): string | undefined {
  if (status === "rate-limited") {
    return "OpenSky quota is exhausted; serving cached tracks when available.";
  }
  if (status === "stale") {
    return error?.message ?? "OpenSky is unavailable; serving cached tracks.";
  }
  if (status === "cached") {
    return "Serving cached OpenSky tracks inside the quota-safe refresh window.";
  }
  return undefined;
}

// ── Keyless live fallback: community ADS-B (airplanes.live) ────────────────
// OpenSky killed keyless global /states/all, so this is the default real-time
// source. We sample a spread of busy global hubs (250 nm each) and merge.
// Keyless ADS-B is point+radius only, so we sample busy hubs worldwide.
// This is NOT truly global — set OPENSKY_CLIENT_ID/SECRET for full /states/all.
const ADSB_ANCHORS: Array<[number, number]> = [
  [51.47, -0.45], // London
  [50.03, 8.57], // Frankfurt
  [41.0, 28.8], // Istanbul
  [55.75, 37.6], // Moscow
  [40.41, -3.7], // Madrid
  [40.64, -73.78], // New York
  [25.79, -80.29], // Miami
  [33.64, -84.43], // Atlanta
  [41.98, -87.9], // Chicago
  [39.86, -104.67], // Denver
  [33.94, -118.41], // Los Angeles
  [43.68, -79.63], // Toronto
  [25.25, 55.36], // Dubai
  [28.56, 77.1], // Delhi
  [19.09, 72.87], // Mumbai
  [1.36, 103.99], // Singapore
  [13.69, 100.75], // Bangkok
  [22.31, 113.91], // Hong Kong
  [40.08, 116.58], // Beijing
  [35.55, 139.78], // Tokyo
  [-33.95, 151.18], // Sydney
  [-23.43, -46.47], // São Paulo
  [4.7, -74.14], // Bogotá
  [-26.13, 28.24], // Johannesburg
  [30.12, 31.4], // Cairo
  [6.58, 3.32], // Lagos
];
const ADSB_BASE = "https://api.airplanes.live/v2/point";
let adsbCache: { at: number; flights: Flight[] } | null = null;

function adsbToFlight(a: any): Flight | null {
  const lat = num(a.lat);
  const lng = num(a.lon);
  if (lat == null || lng == null) return null;
  const onGround = a.alt_baro === "ground";
  const altFt = onGround ? 0 : num(a.alt_geom) ?? num(a.alt_baro) ?? 0;
  const squawk = typeof a.squawk === "string" ? a.squawk : null;
  const emergency =
    (typeof a.emergency === "string" && a.emergency !== "none" && a.emergency !== "") ||
    isEmergencySquawk(squawk);
  return {
    id: String(a.hex ?? "").trim().toLowerCase() || String(Math.random()),
    callsign: String(a.flight ?? a.r ?? "").trim() || "—",
    origin: String(a.desc ?? a.t ?? "AIRCRAFT"),
    lng,
    lat,
    alt: (altFt as number) * 0.3048,
    baroAlt: typeof a.alt_baro === "number" ? a.alt_baro * 0.3048 : null,
    geoAlt: typeof a.alt_geom === "number" ? a.alt_geom * 0.3048 : null,
    velocity: (num(a.gs) ?? 0) * 0.514444,
    heading: num(a.track) ?? num(a.true_heading) ?? 0,
    verticalRate: a.baro_rate != null ? Number(a.baro_rate) * 0.00508 : null,
    squawk,
    lastContact: Date.now(),
    positionSource: "ADS-B",
    category: typeof a.t === "string" ? a.t : "AIRCRAFT",
    emergency,
    stale: false,
    onGround,
  };
}

async function loadAdsbLive(): Promise<FeedResponse<Flight>> {
  const ttl = 25_000;
  if (adsbCache && Date.now() - adsbCache.at < ttl) {
    return {
      data: adsbCache.flights,
      meta: {
        count: adsbCache.flights.length,
        fetchedAt: Date.now(),
        source: "airplanes.live (ADS-B)",
        live: true,
        status: "cached",
        authenticated: false,
        refreshIntervalMs: ttl,
      },
    };
  }
  const results = await Promise.all(
    ADSB_ANCHORS.map(async ([lat, lon], i) => {
      // Stagger to stay friendly with airplanes.live rate limits.
      await new Promise((r) => setTimeout(r, i * 90));
      try {
        const res = await fetchWithTimeout(`${ADSB_BASE}/${lat}/${lon}/250`, { timeoutMs: 8_000 });
        if (!res.ok) return [];
        const j = (await res.json()) as { ac?: any[] };
        return j.ac ?? [];
      } catch {
        return [];
      }
    })
  );
  const seen = new Set<string>();
  const flights: Flight[] = [];
  for (const ac of results.flat()) {
    const f = adsbToFlight(ac);
    if (f && !seen.has(f.id)) {
      seen.add(f.id);
      flights.push(f);
    }
  }
  if (flights.length === 0 && adsbCache) {
    return {
      data: adsbCache.flights,
      meta: { count: adsbCache.flights.length, fetchedAt: Date.now(), source: "airplanes.live (ADS-B)", live: true, status: "stale", authenticated: false },
    };
  }
  adsbCache = { at: Date.now(), flights };
  return {
    data: flights,
    meta: {
      count: flights.length,
      fetchedAt: Date.now(),
      source: "airplanes.live (ADS-B)",
      live: flights.length > 0,
      status: flights.length > 0 ? "live" : "offline",
      authenticated: false,
      refreshIntervalMs: ttl,
    },
  };
}

export async function GET(request: Request) {
  // Default to keyless live ADS-B; only use OpenSky when OAuth creds are present.
  if (!hasOAuthConfig()) {
    try {
      return NextResponse.json(await loadAdsbLive());
    } catch {
      return NextResponse.json({
        data: [],
        meta: { count: 0, fetchedAt: Date.now(), source: "airplanes.live (ADS-B)", live: false, status: "offline", authenticated: false },
      } as FeedResponse<Flight>);
    }
  }

  let url: string;
  try {
    url = buildOpenSkyUrl(request);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const result = await load(url);
    const meta: FeedMeta = {
      count: result.value.flights.length,
      fetchedAt: Date.now(),
      source: sourceLabel(result.value.authenticated),
      live: result.status === "live" || result.status === "cached",
      status: result.status,
      message: messageFor(result.status, result.error),
      upstreamTime: result.value.upstreamTime,
      cacheAgeMs: result.cacheAgeMs,
      refreshIntervalMs: refreshIntervalMs(),
      retryAfterSeconds: result.error?.retryAfterSeconds,
      authenticated: result.value.authenticated,
    };
    const body: FeedResponse<Flight> = {
      data: result.value.flights,
      meta,
    };
    return NextResponse.json(body);
  } catch {
    // OpenSky failed — fall back to keyless live ADS-B so flights still show.
    try {
      return NextResponse.json(await loadAdsbLive());
    } catch {
      return NextResponse.json({
        data: [],
        meta: { count: 0, fetchedAt: Date.now(), source: "airplanes.live (ADS-B)", live: false, status: "offline", authenticated: false },
      } as FeedResponse<Flight>);
    }
  }
}
