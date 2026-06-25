"use client";

import { useUIStore } from "@/lib/store/uiStore";
import { useForecast } from "@/lib/analytics/useForecast";
import { useLiveBrief } from "@/lib/briefings/live";
import { summarize } from "@/lib/analytics/anomaly";
import { threatFill } from "@/lib/briefings/style";
import { cn } from "@/lib/utils/cn";

function Block({
  label,
  value,
  sub,
  accent,
  valueClass,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  valueClass?: string;
}) {
  return (
    <div className="panel min-w-[112px] px-3 py-2">
      <p className="stat-label truncate">{label}</p>
      <p
        className={cn("mt-0.5 font-mono text-lg font-bold leading-none tabular", valueClass)}
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
      {sub && <p className="mt-1 truncate font-mono text-[8px] text-text-tertiary">{sub}</p>}
    </div>
  );
}

export default function KpiDeck() {
  const anomalies = useUIStore((s) => s.anomalies);
  const summary = summarize(anomalies);
  const top = anomalies[0];
  const fc = useForecast();
  const sent = fc.sentiment;
  const brief = useLiveBrief();

  const sentColor = sent.index > 0.12 ? "#4ED7A8" : sent.index < -0.12 ? "#F2607A" : "#9AA7B8";
  const avgMove = fc.assets.length
    ? fc.assets.reduce((s, a) => s + a.expectedChangePct, 0) / fc.assets.length
    : 0;

  return (
    <div className="flex flex-wrap gap-2">
      <div className={cn("panel flex flex-col justify-center px-3 py-2", "min-w-[120px]")}>
        <p className="stat-label">Global Threat</p>
        <span
          className={cn(
            "mt-1 w-fit rounded-md px-2 py-0.5 font-mono text-[11px] font-bold tracking-wide",
            threatFill(brief.threatLevel)
          )}
        >
          {brief.threatLevel}
        </span>
      </div>
      <Block
        label="Active Anomalies"
        value={summary.total}
        sub={top ? `top: ${top.callsign}` : `${summary.critical} crit · ${summary.high} high`}
        accent={summary.critical ? "#F2607A" : summary.total ? "#F2B45C" : "#4ED7A8"}
      />
      <Block
        label="News Sentiment"
        value={`${sent.index >= 0 ? "+" : ""}${sent.index.toFixed(2)}`}
        sub={`${sent.label} · ${sent.sampleSize} sig`}
        accent={sentColor}
      />
      <Block
        label="24h Forecast Bias"
        value={`${avgMove >= 0 ? "+" : ""}${avgMove.toFixed(2)}%`}
        sub={avgMove >= 0 ? "risk-on tilt" : "risk-off tilt"}
        accent={avgMove >= 0 ? "#4ED7A8" : "#F2607A"}
      />
    </div>
  );
}
