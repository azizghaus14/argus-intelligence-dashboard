import { NextResponse } from "next/server";
import { fetchWithTimeout, cachedJson } from "@/lib/server/fetchJson";
import type { Quake, FeedResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

// USGS — public, no key. Past 24h, all magnitudes.
const USGS_URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

async function load(): Promise<Quake[]> {
  const res = await fetchWithTimeout(USGS_URL, { timeoutMs: 8000 });
  if (!res.ok) throw new Error(`usgs ${res.status}`);
  const json = (await res.json()) as {
    features: Array<{
      id: string;
      properties: { mag: number; place: string; time: number; url: string };
      geometry: { coordinates: [number, number, number] };
    }>;
  };
  return json.features
    .filter((f) => f.properties.mag != null)
    .map((f) => ({
      id: f.id,
      mag: f.properties.mag,
      place: f.properties.place ?? "Unknown",
      lng: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      depth: f.geometry.coordinates[2],
      time: f.properties.time,
      url: f.properties.url,
    }))
    .sort((a, b) => b.time - a.time);
}

export async function GET() {
  try {
    const { value, fresh } = await cachedJson("quakes", 60_000, load);
    const body: FeedResponse<Quake> = {
      data: value,
      meta: {
        count: value.length,
        fetchedAt: Date.now(),
        source: "USGS",
        live: fresh,
      },
    };
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      {
        data: [],
        meta: { count: 0, fetchedAt: Date.now(), source: "USGS (unavailable)", live: false },
      } as FeedResponse<Quake>,
      { status: 200 }
    );
  }
}
