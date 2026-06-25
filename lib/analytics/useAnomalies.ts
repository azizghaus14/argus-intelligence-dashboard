"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFlights } from "@/lib/hooks/useFeeds";
import { useUIStore } from "@/lib/store/uiStore";
import {
  detectFlightAnomalies,
  makeCirclingAnomaly,
  headingDelta,
  haversineKm,
  summarize,
  type Anomaly,
} from "./anomaly";
import type { Flight } from "@/lib/types";

interface Sample {
  t: number;
  lat: number;
  lng: number;
  heading: number;
}

const MAX_SAMPLES = 8;
const MAX_AGE_MS = 4 * 60_000; // keep ~4 min of history per aircraft
const TURN_THRESHOLD = 250; // cumulative degrees to flag a circle
const NET_KM_THRESHOLD = 9; // ...while staying within this radius

// Layers temporal loitering/circling detection on top of the snapshot
// detectors. Keeps a rolling per-aircraft track across SWR refreshes, then
// publishes the merged anomaly set to the global store (for the globe).
export function useAnomalies(): { anomalies: Anomaly[]; summary: ReturnType<typeof summarize> } {
  const { data } = useFlights(true);
  const setAnomalies = useUIStore((s) => s.setAnomalies);
  const tracks = useRef<Map<string, Sample[]>>(new Map());

  const flights = useMemo<Flight[]>(() => data?.data ?? [], [data]);

  const anomalies = useMemo(() => {
    const now = Date.now();

    // 1) Update rolling tracks.
    const seen = new Set<string>();
    for (const f of flights) {
      if (f.onGround || f.stale) continue;
      seen.add(f.id);
      const prev = tracks.current.get(f.id) ?? [];
      const last = prev[prev.length - 1];
      // Only append when the aircraft has actually moved/updated.
      if (!last || now - last.t > 8_000) {
        prev.push({ t: now, lat: f.lat, lng: f.lng, heading: f.heading });
      }
      const trimmed = prev.filter((s) => now - s.t <= MAX_AGE_MS).slice(-MAX_SAMPLES);
      tracks.current.set(f.id, trimmed);
    }
    // Drop tracks for aircraft no longer in view.
    for (const id of tracks.current.keys()) if (!seen.has(id)) tracks.current.delete(id);

    // 2) Snapshot detectors.
    const snapshot = detectFlightAnomalies(flights);
    const flagged = new Set(snapshot.map((a) => a.flightId));

    // 3) Temporal: circling / loitering.
    const temporal: Anomaly[] = [];
    for (const f of flights) {
      if (flagged.has(f.id)) continue; // emergency/outlier already dominates
      const samples = tracks.current.get(f.id);
      if (!samples || samples.length < 4) continue;
      const spanMs = samples[samples.length - 1].t - samples[0].t;
      if (spanMs < 60_000) continue;

      let totalTurn = 0;
      for (let i = 1; i < samples.length; i++) {
        totalTurn += Math.abs(headingDelta(samples[i - 1].heading, samples[i].heading));
      }
      const a = samples[0];
      const b = samples[samples.length - 1];
      const netKm = haversineKm(a.lat, a.lng, b.lat, b.lng);

      if (totalTurn > TURN_THRESHOLD && netKm < NET_KM_THRESHOLD) {
        const cs = (f.callsign || f.id).trim() || f.id;
        temporal.push(makeCirclingAnomaly(f, cs, totalTurn, netKm));
      }
    }

    return [...snapshot, ...temporal].sort((x, y) => y.score - x.score);
  }, [flights]);

  // Publish to the store so the globe can flag anomalies.
  useEffect(() => {
    setAnomalies(anomalies);
  }, [anomalies, setAnomalies]);

  return { anomalies, summary: summarize(anomalies) };
}
