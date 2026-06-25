"use client";

import { useQuakes } from "@/lib/hooks/useFeeds";
import { useUIStore } from "@/lib/store/uiStore";
import { timeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export default function SeismicPanel() {
  const { layers, setSelection } = useUIStore();
  const { data } = useQuakes(layers.quakes);
  const quakes = (data?.data ?? []).slice(0, 14);

  return (
    <div className="panel hud-frame flex min-h-0 flex-1 flex-col p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="panel-title">Seismic Activity · 24h</span>
        <span className="font-mono text-[9px] text-text-tertiary">{data?.meta.count ?? 0} EVT</span>
      </div>
      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
        {quakes.map((q) => (
          <button
            key={q.id}
            onClick={() =>
              setSelection({
                kind: "quakes",
                id: q.id,
                title: `M${q.mag.toFixed(1)} EVENT`,
                lines: [`LOC ${q.place}`, `MAG ${q.mag.toFixed(1)}`, `DEPTH ${q.depth.toFixed(0)} km`, `TIME ${timeAgo(q.time)}`],
                lat: q.lat,
                lng: q.lng,
              })
            }
            className="flex w-full items-center gap-2 rounded-sm px-1.5 py-1 text-left transition hover:bg-bg-hover"
          >
            <span
              className={cn(
                "w-9 shrink-0 rounded-sm px-1 py-0.5 text-center font-mono text-[10px] font-bold tabular",
                q.mag >= 5 ? "bg-alert/20 text-alert" : q.mag >= 3 ? "bg-quake/20 text-quake" : "bg-warn/15 text-warn"
              )}
            >
              {q.mag.toFixed(1)}
            </span>
            <span className="flex-1 truncate font-mono text-[10px] text-text-secondary">{q.place}</span>
            <span className="shrink-0 font-mono text-[9px] tabular text-text-tertiary">{timeAgo(q.time)}</span>
          </button>
        ))}
        {quakes.length === 0 && (
          <p className="py-4 text-center font-mono text-[10px] text-text-tertiary">Awaiting feed…</p>
        )}
      </div>
    </div>
  );
}
