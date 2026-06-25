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
          // Blue surrounding glow (faint teal tint), smooth falloff — centred
          // low to wrap the oblique globe and bleed into the space around it.
          background:
            "radial-gradient(circle 72vh at 50% 56%, rgba(60,132,232,0.58) 28%, rgba(40,96,180,0.28) 56%, rgba(24,60,118,0.10) 80%, transparent 100%)",
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
