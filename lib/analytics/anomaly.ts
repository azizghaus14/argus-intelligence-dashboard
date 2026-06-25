// ARGUS SENTINEL — anomaly detection engine.
//
// Transparent, explainable statistical detectors over the live flight feed.
// Every anomaly carries a 0–100 score, a severity bucket, and a plain-English
// reason so the model is auditable (no black box). Snapshot detectors run on a
// single frame; temporal detectors (circling/loitering) are layered on in the
// useAnomalies hook, which keeps a short rolling history per aircraft.

import type { Flight } from "@/lib/types";

export type AnomalySeverity = "critical" | "high" | "medium" | "low";

export interface Anomaly {
  id: string;
  domain: "air"; // sea / space / signals land here in later phases
  kind: string; // machine code, e.g. "EMERGENCY_SQUAWK"
  category: string; // human label, e.g. "Emergency Squawk"
  title: string; // target designation (callsign / icao24)
  reason: string; // plain-English explanation of the trigger
  score: number; // 0..100 anomaly score
  severity: AnomalySeverity;
  lat: number;
  lng: number;
  flightId: string;
  callsign: string;
}

/* ---------- robust statistics (median / MAD are outlier-resistant) ---------- */

export function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Median absolute deviation, scaled (×1.4826) to approximate σ for normal data.
export function mad(xs: number[], med = median(xs)): number {
  if (xs.length === 0) return 0;
  const dev = xs.map((x) => Math.abs(x - med));
  return median(dev) * 1.4826;
}

export function robustZ(x: number, med: number, sigma: number): number {
  if (sigma <= 1e-6) return 0;
  return (x - med) / sigma;
}

export function severityOf(score: number): AnomalySeverity {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 45) return "medium";
  return "low";
}

/* ---------- emergency transponder codes ---------- */

const EMERGENCY: Record<string, { label: string; reason: string; score: number }> = {
  "7500": { label: "Unlawful Interference", reason: "Squawk 7500 — possible hijack / unlawful interference", score: 100 },
  "7600": { label: "Radio Failure", reason: "Squawk 7600 — lost communications", score: 86 },
  "7700": { label: "General Emergency", reason: "Squawk 7700 — general emergency declared", score: 96 },
};

function mk(
  f: Flight,
  cs: string,
  kind: string,
  category: string,
  reason: string,
  score: number
): Anomaly {
  const s = Math.round(Math.max(0, Math.min(100, score)));
  return {
    id: `${kind}:${f.id}`,
    domain: "air",
    kind,
    category,
    reason,
    title: cs,
    score: s,
    severity: severityOf(s),
    lat: f.lat,
    lng: f.lng,
    flightId: f.id,
    callsign: cs,
  };
}

/* ---------- snapshot detectors (single live frame) ---------- */

export function detectFlightAnomalies(flights: Flight[]): Anomaly[] {
  const out: Anomaly[] = [];
  const air = flights.filter((f) => !f.onGround && !f.stale && f.velocity > 0);

  // Robust fleet baselines for outlier scoring.
  const speeds = air.map((f) => f.velocity);
  const sMed = median(speeds);
  const sSig = mad(speeds, sMed);

  for (const f of flights) {
    const cs = (f.callsign || f.id).trim() || f.id;
    const sq = (f.squawk || "").trim();

    // 1) Emergency squawk — dominant signal, supersedes everything else.
    // Only trust the real 7500/7600/7700 codes; the upstream `emergency`
    // boolean is unreliable (frequently set on normal-squawk traffic).
    if (EMERGENCY[sq]) {
      const e = EMERGENCY[sq];
      out.push(mk(f, cs, "EMERGENCY_SQUAWK", e.label, e.reason, e.score));
      continue;
    }
    if (f.onGround || f.stale) continue;

    // 2) Velocity outlier — robust z-score against the airborne fleet.
    const z = robustZ(f.velocity, sMed, sSig);
    if (z > 4 && f.velocity > 330) {
      const kt = Math.round(f.velocity * 1.94384);
      out.push(
        mk(
          f,
          cs,
          "SPEED_OUTLIER",
          "Velocity Outlier",
          `Ground speed ${kt} kt — ${z.toFixed(1)}σ above fleet median`,
          Math.min(80, 46 + (z - 4) * 8)
        )
      );
    }

    // 3) Extreme vertical maneuver.
    const vr = f.verticalRate ?? 0;
    if (Math.abs(vr) > 30) {
      const fpm = Math.round(Math.abs(vr) * 196.85);
      const dir = vr < 0 ? "descent" : "climb";
      out.push(
        mk(
          f,
          cs,
          "VERTICAL_RATE",
          "Extreme Maneuver",
          `Rapid ${dir} ${fpm.toLocaleString()} fpm`,
          Math.min(74, 42 + (Math.abs(vr) - 30) * 1.2)
        )
      );
    }
  }
  return out;
}

/* ---------- temporal helpers (used by useAnomalies) ---------- */

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Smallest signed angle between two headings, in [-180, 180].
export function headingDelta(a: number, b: number): number {
  let d = ((b - a + 540) % 360) - 180;
  if (d === -180) d = 180;
  return d;
}

export function makeCirclingAnomaly(
  f: Flight,
  cs: string,
  totalTurnDeg: number,
  netKm: number
): Anomaly {
  const score = Math.min(82, 48 + (totalTurnDeg - 250) / 10);
  return mk(
    f,
    cs,
    "LOITERING",
    "Loitering / Circling",
    `Sustained turn ${Math.round(totalTurnDeg)}° with ${netKm.toFixed(
      1
    )} km net displacement`,
    score
  );
}

/* ---------- ui helpers ---------- */

export const SEVERITY_META: Record<AnomalySeverity, { label: string; color: string; bg: string }> = {
  critical: { label: "CRIT", color: "#FF3B5C", bg: "rgba(255,59,92,0.16)" },
  high: { label: "HIGH", color: "#F97316", bg: "rgba(249,115,22,0.15)" },
  medium: { label: "MED", color: "#F5C842", bg: "rgba(245,200,66,0.14)" },
  low: { label: "LOW", color: "#22D3EE", bg: "rgba(34,211,238,0.12)" },
};

export function summarize(anoms: Anomaly[]) {
  return {
    total: anoms.length,
    critical: anoms.filter((a) => a.severity === "critical").length,
    high: anoms.filter((a) => a.severity === "high").length,
    medium: anoms.filter((a) => a.severity === "medium").length,
    low: anoms.filter((a) => a.severity === "low").length,
  };
}
