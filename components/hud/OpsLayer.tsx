"use client";

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

  return (
    <div
      className={cn(
        "transition-opacity duration-500",
        briefOpen ? "pointer-events-none opacity-0" : "opacity-100"
      )}
    >
      {/* Floating KPI blocks */}
      <div className="pointer-events-none absolute left-5 top-[60px] z-30 hidden xl:block">
        <div className="pointer-events-auto">
          <KpiDeck />
        </div>
      </div>

      {/* Left — layer filters */}
      <div className="pointer-events-none absolute left-5 top-[132px] z-30 hidden w-56 md:block">
        <div className="pointer-events-auto">
          <LayerControls />
        </div>
      </div>

      {/* Right — target readout */}
      <div className="pointer-events-none absolute right-5 top-[62px] z-30 hidden w-72 lg:block">
        <div className="pointer-events-auto">
          <DetailPanel />
        </div>
      </div>

      {/* Bottom — uniform module dock */}
      <div className="pointer-events-none absolute inset-x-4 bottom-[54px] z-30 h-[224px]">
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
