import { NextResponse } from "next/server";
import { fetchWithTimeout, cachedJson } from "@/lib/server/fetchJson";
import type { Flight, FeedResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

// ADS-B Exchange military aircraft (unfiltered / military feed) via RapidAPI.
// Paid / key-gated: https://rapidapi.com/adsbx/api/adsbexchange-com1
// Keyless-first: with no key set, this returns an empty, non-live feed and the
// UI simply shows the layer as offline. With a key, military traffic populates.
const RAPIDAPI_HOST = "adsbexchange-com1.p.rapidapi.com";

async function load(): Promise<Flight[]> {
  const key = process.env.ADSBX_RAPIDAPI_KEY;
  if (!key) throw new Error("no key");

  // Global military aircraft endpoint.
  const res = await fetchWithTimeout(`https://${RAPIDAPI_HOST}/v2/mil/`, {
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": RAPIDAPI_HOST,
    },
    timeoutMs: 9000,
  });
  if (!res.ok) throw new Error(`adsbx ${res.status}`);
  const json = (await res.json()) as { ac?: any[] };
  const ac = json.ac ?? [];
  return ac
    .filter((a) => a.lat != null && a.lon != null)
    .map((a) => ({
      id: String(a.hex ?? a.icao ?? Math.random()),
      callsign: String(a.flight ?? a.r ?? "MIL").trim() || "MIL",
      origin: String(a.t ?? a.desc ?? "MILITARY"),
      lng: a.lon,
      lat: a.lat,
      alt: typeof a.alt_baro === "number" ? a.alt_baro * 0.3048 : 0,
      velocity: typeof a.gs === "number" ? a.gs * 0.514444 : 0,
      heading: a.track ?? 0,
      onGround: a.alt_baro === "ground",
    }));
}

export async function GET() {
  try {
    const { value, fresh } = await cachedJson("adsb-mil", 20_000, load);
    const body: FeedResponse<Flight> = {
      data: value,
      meta: { count: value.length, fetchedAt: Date.now(), source: "ADS-B Exchange (MIL)", live: fresh },
    };
    return NextResponse.json(body);
  } catch {
    const body: FeedResponse<Flight> = {
      data: [],
      meta: { count: 0, fetchedAt: Date.now(), source: "ADS-B Exchange (offline — set ADSBX_RAPIDAPI_KEY)", live: false },
    };
    return NextResponse.json(body, { status: 200 });
  }
}
