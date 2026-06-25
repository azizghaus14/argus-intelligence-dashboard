"use client";

import Image from "next/image";
import Clock from "./Clock";
import SearchBox from "./SearchBox";
import { useUIStore } from "@/lib/store/uiStore";
import { cn } from "@/lib/utils/cn";

function NavTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition",
        active ? "bg-signal/12 text-signal" : "text-text-tertiary hover:text-text-secondary"
      )}
    >
      {label}
    </button>
  );
}

export default function TopBar() {
  const briefOpen = useUIStore((s) => s.briefOpen);
  const setBriefOpen = useUIStore((s) => s.setBriefOpen);
  return (
    <>
      {/* logo — separated, top-left */}
      <div className="pointer-events-auto absolute left-5 top-4 z-50 flex items-center">
        <Image
          src="/argus-logo.png"
          alt="Argus OSINT Dashboard"
          width={150}
          height={40}
          priority
          className="h-7 w-auto max-w-[132px] object-contain"
        />
      </div>

      {/* short centered nav pill */}
      <div className="pointer-events-auto absolute left-1/2 top-4 z-50 -translate-x-1/2">
        <nav className="glass-chip flex items-center gap-1 p-1">
          <NavTab label="Live Ops" active={!briefOpen} onClick={() => setBriefOpen(false)} />
          <NavTab label="Daily Brief" active={briefOpen} onClick={() => setBriefOpen(true)} />
        </nav>
      </div>

      {/* right cluster — search + live status */}
      <div className="pointer-events-auto absolute right-5 top-4 z-50 flex items-center gap-2">
        <div className="w-[180px]">
          <SearchBox />
        </div>
        <div className="glass-chip flex items-center gap-2 px-3 py-1.5">
          <span className="live-dot text-ok" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ok">Live</span>
          <span className="h-3 w-px bg-white/10" />
          <Clock />
        </div>
      </div>
    </>
  );
}
