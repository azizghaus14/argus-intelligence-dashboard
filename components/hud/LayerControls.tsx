"use client";

import { Plane, Activity, Satellite, Radio, Rotate3d, Crosshair, ShieldAlert, Home } from "lucide-react";
import { useUIStore } from "@/lib/store/uiStore";
import type { LayerId } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

const LAYERS: Array<{ id: LayerId; label: string; icon: typeof Plane }> = [
  { id: "flights", label: "Air Traffic", icon: Plane },
  { id: "military", label: "Military (ADS-B)", icon: ShieldAlert },
  { id: "quakes", label: "Seismic", icon: Activity },
  { id: "space", label: "Orbital", icon: Satellite },
  { id: "flashpoints", label: "Flashpoints", icon: Crosshair },
  { id: "events", label: "OSINT Feed", icon: Radio },
];

export default function LayerControls() {
  const { layers, toggleLayer, autoRotate, toggleRotate, resetView } = useUIStore();

  return (
    <div className="panel hud-frame p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="panel-title">Overlay Control</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={resetView}
            title="Reset to home view"
            className="flex items-center gap-1 rounded-lg bg-white/[0.05] px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-text-tertiary transition hover:bg-white/[0.09] hover:text-signal"
          >
            <Home className="h-3 w-3" /> Home
          </button>
          <button
            onClick={toggleRotate}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-[9px] uppercase tracking-wider transition",
              autoRotate
                ? "bg-signal/15 text-signal"
                : "bg-white/[0.05] text-text-tertiary hover:bg-white/[0.09] hover:text-text-secondary"
            )}
          >
            <Rotate3d className="h-3 w-3" /> {autoRotate ? "Orbit" : "Locked"}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {LAYERS.map(({ id, label, icon: Icon }) => {
          const on = layers[id];
          return (
            <button
              key={id}
              onClick={() => toggleLayer(id)}
              className={cn(
                "group flex items-center justify-between rounded-xl px-2.5 py-1.5 text-left transition",
                on ? "bg-white/[0.05]" : "opacity-45 hover:opacity-80"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon
                  className={cn("h-4 w-4 transition", on ? "text-signal" : "text-text-muted")}
                  strokeWidth={1.75}
                />
                <span
                  className={cn(
                    "font-mono text-[11px] uppercase tracking-wider",
                    on ? "text-text-secondary" : "text-text-tertiary"
                  )}
                >
                  {label}
                </span>
              </span>
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  on ? "bg-signal animate-pulse-dot" : "bg-text-muted/40"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
