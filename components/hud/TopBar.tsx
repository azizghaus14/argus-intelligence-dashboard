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
        "whitespace-nowrap rounded-lg px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] transition sm:px-3.5 sm:py-1.5 sm:text-[10px] sm:tracking-[0.18em]",
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
      <div className="pointer-events-auto absolute left-3 top-3.5 z-50 flex items-center sm:left-5 sm:top-4">
        <Image
          src="/argus-logo.png"
          alt="Argus OSINT Dashboard"
          width={150}
          height={40}
          priority
          className="h-6 w-auto max-w-[92px] object-contain sm:h-7 sm:max-w-[140px]"
        />
      </div>

      {/* short centered nav pill */}
      <div className="pointer-events-auto absolute left-1/2 top-3 z-50 -translate-x-1/2 sm:top-4">
        <nav className="glass-chip flex items-center gap-0.5 p-0.5 sm:gap-1 sm:p-1">
          <NavTab label="Live Ops" active={!briefOpen} onClick={() => setBriefOpen(false)} />
          <NavTab label="Daily Brief" active={briefOpen} onClick={() => setBriefOpen(true)} />
        </nav>
      </div>

      {/* right cluster — search (md+) + live status */}
      <div className="pointer-events-auto absolute right-3 top-3.5 z-50 flex items-center gap-1.5 sm:right-5 sm:top-4 sm:gap-2">
        <div className="hidden w-[180px] md:block">
          <SearchBox />
        </div>
        <div className="glass-chip flex items-center gap-2 px-2.5 py-1.5 sm:px-3">
          <span className="live-dot text-ok" />
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ok sm:text-[10px]">Live</span>
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          <span className="hidden sm:block">
            <Clock />
          </span>
        </div>
      </div>
    </>
  );
}
