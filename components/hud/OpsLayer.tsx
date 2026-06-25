"use client";

import { useState } from "react";
import { Layers, X } from "lucide-react";
import { useUIStore } from "@/lib/store/uiStore";
import KpiDeck from "./KpiDeck";
import LayerControls from "./LayerControls";
import DetailPanel from "./DetailPanel";
import BottomDock from "./BottomDock";
import EventTicker from "./EventTicker";
import { cn } from "@/lib/utils/cn";

// The live-ops HUD. Stays mounted (so the anomaly tracker keeps running) but
// fades out when the Daily Brief overlay takes over.
export default function OpsLayer() {
  const briefOpen = useUIStore((s) => s.briefOpen);
  const selection = useUIStore((s) => s.selection);
  const [layersOpen, setLayersOpen] = useState(false);

  return (
    <div
      className={cn(
        "transition-opacity duration-500",
        briefOpen ? "pointer-events-none opacity-0" : "opacity-100"
      )}
    >
      {/* Floating KPI blocks (desktop) */}
      <div className="pointer-events-none absolute left-5 top-[60px] z-30 hidden xl:block">
        <div className="pointer-events-auto">
          <KpiDeck />
        </div>
      </div>

      {/* Left — layer filters (tablet/desktop) */}
      <div className="pointer-events-none absolute left-5 top-[132px] z-30 hidden w-56 md:block">
        <div className="pointer-events-auto">
          <LayerControls />
        </div>
      </div>

      {/* Right — target readout (desktop) */}
      <div className="pointer-events-none absolute right-5 top-[62px] z-30 hidden w-72 lg:block">
        <div className="pointer-events-auto">
          <DetailPanel />
        </div>
      </div>

      {/* Mobile/tablet — target readout appears as a top card only when locked */}
      {selection && (
        <div className="pointer-events-auto absolute inset-x-2 top-[58px] z-40 animate-fade-in lg:hidden">
          <DetailPanel />
        </div>
      )}

      {/* Mobile — layers toggle (FAB) + slide-in sheet */}
      <button
        onClick={() => setLayersOpen(true)}
        className="glass-chip pointer-events-auto absolute bottom-[264px] left-3 z-40 flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-text-secondary transition hover:text-signal md:hidden"
      >
        <Layers className="h-3.5 w-3.5" /> Layers
      </button>
      {layersOpen && (
        <div className="pointer-events-auto fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-bg-base/60 backdrop-blur-[2px]" onClick={() => setLayersOpen(false)} />
          <div className="absolute left-3 top-[58px] w-60 animate-fade-in">
            <LayerControls />
            <button
              onClick={() => setLayersOpen(false)}
              className="glass-chip mt-2 flex w-full items-center justify-center gap-1.5 py-2 font-mono text-[10px] uppercase tracking-wider text-text-secondary"
            >
              <X className="h-3.5 w-3.5" /> Close
            </button>
          </div>
        </div>
      )}

      {/* Bottom — module dock (swipeable on mobile, fills the row on desktop) */}
      <div className="pointer-events-none absolute inset-x-2 bottom-[44px] z-30 h-[210px] sm:inset-x-4 sm:bottom-[54px] sm:h-[224px]">
        <div className="pointer-events-auto h-full">
          <BottomDock />
        </div>
      </div>

      {/* Headline ticker */}
      <div className="absolute inset-x-0 bottom-0 z-30">
        <EventTicker />
      </div>
    </div>
  );
}
