"use client";

import dynamic from "next/dynamic";
import { useUIStore } from "@/lib/store/uiStore";

const CesiumGlobe = dynamic(() => import("./CesiumGlobe"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-signal animate-pulse">
        Initializing orbital uplink…
      </span>
    </div>
  ),
});

export default function GlobeStage() {
  const stylized = useUIStore((s) => s.globeMode) === "stylized";

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Deep navy space: soft radial lift behind the globe + restrained stars. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#04070E",
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.45) 0 0.7px, transparent 0.9px), radial-gradient(circle, rgba(165,195,230,0.3) 0 0.6px, transparent 0.85px)",
          backgroundSize: "173px 173px, 271px 271px",
          backgroundPosition: "19px 31px, 83px 117px",
        }}
      />
      {/* Outer atmosphere halo — sits BEHIND the transparent globe canvas, so
          the globe occludes the centre and the glow only spills into the space
          around the planet, lighting the surroundings. Stylized view only. */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: stylized ? 1 : 0,
          // Very faint ambient blue lift around the planet — soft enough that it
          // never reads as a ring/outline at the globe's edge, just keeps the
          // surrounding space from being dead black.
          background:
            "radial-gradient(circle 82vh at 50% 56%, rgba(46,100,184,0.22) 24%, rgba(30,72,144,0.11) 54%, rgba(18,46,96,0.04) 80%, transparent 100%)",
        }}
      />

      {/* the planet (transparent canvas) */}
      <CesiumGlobe />

      {/* Subtle always-on vignette (kept light for the satellite view). */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-700"
        style={{
          opacity: stylized ? 0 : 1,
          background:
            "radial-gradient(ellipse 84% 84% at 50% 50%, transparent 62%, rgba(2,4,10,0.5) 100%)",
        }}
      />
    </div>
  );
}
