import HeaderBar from "@/components/hud/HeaderBar";
import BriefingView from "@/components/brief/BriefingView";

export default function BriefPage() {
  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-bg-base">
      <HeaderBar />
      <div className="relative min-h-0 flex-1">
        <div className="aurora pointer-events-none absolute inset-0 opacity-70" />
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative h-full">
          <BriefingView />
        </div>
      </div>
    </main>
  );
}
