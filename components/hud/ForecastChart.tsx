"use client";

import { useMemo } from "react";
import type { AssetForecast } from "@/lib/analytics/forecast";

const W = 300;
const H = 84;
const PAD = 4;

// History line + forecast confidence cone, sharing one time/price scale.
export default function ForecastChart({ a }: { a: AssetForecast }) {
  const up = a.expectedChangePct >= 0;
  const color = up ? "#34D399" : "#FF5C7A";

  const { histPath, midPath, bandPath, nowX } = useMemo(() => {
    const hist = a.history.slice(-72);
    if (hist.length === 0) return { histPath: "", midPath: "", bandPath: "", nowX: 0 };

    const t0 = hist[0][0];
    const tEnd = a.forecast[a.forecast.length - 1].t;
    const tSpan = tEnd - t0 || 1;

    const ys = [
      ...hist.map((p) => p[1]),
      ...a.forecast.map((f) => f.lo),
      ...a.forecast.map((f) => f.hi),
    ];
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const ySpan = yMax - yMin || 1;

    const sx = (t: number) => PAD + ((t - t0) / tSpan) * (W - 2 * PAD);
    const sy = (v: number) => PAD + (1 - (v - yMin) / ySpan) * (H - 2 * PAD);

    const histPath = hist.map((p, i) => `${i ? "L" : "M"}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(" ");

    const spot = hist[hist.length - 1][1];
    const spotT = hist[hist.length - 1][0];
    const midPath =
      `M${sx(spotT).toFixed(1)},${sy(spot).toFixed(1)} ` +
      a.forecast.map((f) => `L${sx(f.t).toFixed(1)},${sy(f.mid).toFixed(1)}`).join(" ");

    const top = a.forecast.map((f) => `${sx(f.t).toFixed(1)},${sy(f.hi).toFixed(1)}`);
    const bot = [...a.forecast].reverse().map((f) => `${sx(f.t).toFixed(1)},${sy(f.lo).toFixed(1)}`);
    const bandPath = `M${sx(spotT).toFixed(1)},${sy(spot).toFixed(1)} L${top.join(" L")} L${bot.join(" L")} Z`;

    return { histPath, midPath, bandPath, nowX: sx(spotT) };
  }, [a]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[84px] w-full" preserveAspectRatio="none">
      <path d={bandPath} fill={color} opacity={0.13} />
      <line x1={nowX} y1={PAD} x2={nowX} y2={H - PAD} stroke="#3A4453" strokeWidth="0.7" strokeDasharray="2 2" />
      <path d={histPath} fill="none" stroke="#7DA2C9" strokeWidth="1.3" />
      <path d={midPath} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 2.5" />
    </svg>
  );
}
