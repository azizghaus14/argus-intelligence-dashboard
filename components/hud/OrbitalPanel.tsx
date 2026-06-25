"use client";

import { useSpace } from "@/lib/hooks/useFeeds";
import { useUIStore } from "@/lib/store/uiStore";
import { fmtUTC } from "@/lib/utils/format";

export default function OrbitalPanel() {
  const { layers, setSelection } = useUIStore();
  const { data } = useSpace(layers.space);
  const sats = data?.data ?? [];

  return (
    <div className="panel hud-frame p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="panel-title">Orbital Assets</span>
        <span className="font-mono text-[9px] text-space">{sats.length} TRK</span>
      </div>
      <div className="space-y-1">
        {sats.map((s) => (
          <button
            key={s.id}
            onClick={() =>
              setSelection({
                kind: "space",
                id: s.id,
                title: s.name,
                lines: [`NORAD ${s.id}`, `ALT ${s.alt.toFixed(0)} km`, `LAT/LNG ${s.lat.toFixed(2)}, ${s.lng.toFixed(2)}`, `UPDATED ${fmtUTC()}`],
                lat: s.lat,
                lng: s.lng,
              })
            }
            className="flex w-full items-center justify-between rounded-sm px-1.5 py-1 text-left transition hover:bg-bg-hover"
          >
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-space animate-pulse-dot" />
              <span className="font-mono text-[10px] text-text-secondary">{s.name}</span>
            </span>
            <span className="font-mono text-[9px] tabular text-text-tertiary">{s.alt.toFixed(0)} km</span>
          </button>
        ))}
        {sats.length === 0 && (
          <p className="py-3 text-center font-mono text-[10px] text-text-tertiary">Awaiting telemetry…</p>
        )}
      </div>
    </div>
  );
}
