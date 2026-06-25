import { NextResponse } from "next/server";
import { fetchWithTimeout, cachedJson } from "@/lib/server/fetchJson";
import type { SpaceAsset, FeedResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

// wheretheiss.at — public, no key, HTTPS. ISS + named satellites.
const SATS: Array<{ id: string; name: string }> = [
  { id: "25544", name: "ISS (ZARYA)" },
  { id: "20580", name: "HUBBLE HST" },
  { id: "48274", name: "TIANGONG (CSS)" },
];

async function one(id: string, name: string): Promise<SpaceAsset | null> {
  try {
    const res = await fetchWithTimeout(
      `https://api.wheretheiss.at/v1/satellites/${id}`,
      { timeoutMs: 6000 }
    );
    if (!res.ok) return null;
    const j = (await res.json()) as {
      latitude: number;
      longitude: number;
      altitude: number;
    };
    return { id, name, lat: j.latitude, lng: j.longitude, alt: j.altitude };
  } catch {
    return null;
  }
}

// Fallback: Open Notify gives ISS lat/lng (no altitude) over HTTP.
async function issFallback(): Promise<SpaceAsset | null> {
  try {
    const res = await fetchWithTimeout("http://api.open-notify.org/iss-now.json", {
      timeoutMs: 6000,
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { iss_position: { latitude: string; longitude: string } };
    return {
      id: "25544",
      name: "ISS (ZARYA)",
      lat: parseFloat(j.iss_position.latitude),
      lng: parseFloat(j.iss_position.longitude),
      alt: 420, // nominal ISS orbit
    };
  } catch {
    return null;
  }
}

async function load(): Promise<SpaceAsset[]> {
  const results = await Promise.all(SATS.map((s) => one(s.id, s.name)));
  let assets = results.filter((r): r is SpaceAsset => r !== null);
  if (assets.length === 0) {
    const iss = await issFallback();
    if (iss) assets = [iss];
  }
  if (assets.length === 0) throw new Error("no sats");
  return assets;
}

export async function GET() {
  try {
    const { value, fresh } = await cachedJson("space", 5_000, load);
    const body: FeedResponse<SpaceAsset> = {
      data: value,
      meta: { count: value.length, fetchedAt: Date.now(), source: "wheretheiss.at", live: fresh },
    };
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      {
        data: [],
        meta: { count: 0, fetchedAt: Date.now(), source: "orbital (unavailable)", live: false },
      } as FeedResponse<SpaceAsset>,
      { status: 200 }
    );
  }
}
