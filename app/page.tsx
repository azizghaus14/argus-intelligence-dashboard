import GlobeStage from "@/components/globe/GlobeStage";
import FocusOverlay from "@/components/hud/FocusOverlay";
import RevealOverlay from "@/components/hud/RevealOverlay";
import TopBar from "@/components/hud/TopBar";
import OpsLayer from "@/components/hud/OpsLayer";
import BriefOverlay from "@/components/brief/BriefOverlay";

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-bg-base">
      {/* Full-bleed cinematic globe */}
      <div className="absolute inset-0">
        <GlobeStage />
      </div>

      {/* very subtle scanline texture */}
      <div className="scanlines pointer-events-none absolute inset-0 z-20 opacity-[0.12]" />

      <FocusOverlay />
      <RevealOverlay />

      {/* Top — separated logo · short nav pill · search + status */}
      <TopBar />

      {/* Live-ops HUD (fades out under the brief) */}
      <OpsLayer />

      {/* Daily Brief overlay (fades in over the globe) */}
      <BriefOverlay />
    </main>
  );
}
