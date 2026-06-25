"use client";

import { X, Plane, Crosshair } from "lucide-react";
import { useUIStore } from "@/lib/store/uiStore";

export default function DetailPanel() {
  const { selection, setSelection } = useUIStore();
  if (!selection) {
    return (
      <div className="panel hud-frame p-3">
        <span className="panel-title">Target Readout</span>
        <p className="mt-3 font-mono text-[10px] leading-relaxed text-text-tertiary">
          MONITORING LIVE LAYERS.
          <br />
          AWAITING TARGET DESIGNATION.
        </p>
      </div>
    );
  }

  const isFlight = selection.kind === "flights" || selection.kind === "military";

  return (
    <div className="panel hud-frame animate-fade-in p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="panel-title">{isFlight ? "Tracking Target" : "Target Lock"}</span>
        <button
          type="button"
          aria-label="Close target details"
          title="Close target details"
          onClick={() => setSelection(null)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-text-tertiary transition hover:bg-white/[0.09] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* header graphic */}
      <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.04] p-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-signal/12 text-signal">
          {isFlight ? (
            <Plane className="h-5 w-5 text-signal" />
          ) : (
            <Crosshair className="h-5 w-5 text-alert" />
          )}
        </div>
        <div className="min-w-0">
          <div className="font-display text-sm font-semibold text-signal">{selection.title}</div>
          {isFlight && (
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse-dot" />
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-ok">Following · Live</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1 border-t border-white/5 pt-2">
        {selection.lines.map((l, i) => {
          const [k, ...rest] = l.split(/\s{2,}/);
          const v = rest.join(" ");
          return (
            <div key={i} className="flex justify-between gap-2 font-mono text-[10px] tabular">
              <span className="text-text-tertiary">{v ? k : ""}</span>
              <span className="text-right text-text-primary">{v || k}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 border-t border-white/5 pt-2 font-mono text-[9px] text-text-tertiary">
        COORD {selection.lat.toFixed(4)}, {selection.lng.toFixed(4)}
      </div>
    </div>
  );
}
