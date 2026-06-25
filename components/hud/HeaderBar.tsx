"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Clock from "./Clock";
import SearchBox from "./SearchBox";
import { useFlights, useQuakes, useSpace, useEvents } from "@/lib/hooks/useFeeds";
import { useUIStore } from "@/lib/store/uiStore";
import { compact } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

function Stat({ label, value, live }: { label: string; value: string; live: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="stat-label">{label}</span>
      <span className="flex items-center gap-1.5 font-mono text-sm tabular text-text-primary">
        <span
          className={`h-1 w-1 rounded-full ${live ? "bg-ok animate-pulse-dot" : "bg-text-muted"}`}
        />
        {value}
      </span>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "rounded-[10px] border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition",
        active
          ? "border-signal/45 bg-signal/10 text-signal"
          : "border-white/10 bg-white/[0.03] text-text-tertiary hover:bg-white/[0.07] hover:text-text-secondary"
      )}
    >
      {label}
    </Link>
  );
}

export default function HeaderBar({ floating = false }: { floating?: boolean }) {
  const { layers } = useUIStore();
  const flights = useFlights(layers.flights);
  const quakes = useQuakes(layers.quakes);
  const space = useSpace(layers.space);
  const events = useEvents();

  return (
    <header
      className={cn(
        "relative z-40 flex items-center justify-between px-3 py-2.5 sm:px-5",
        floating
          ? "panel hud-frame rounded-2xl"
          : "border-b border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent backdrop-blur-2xl"
      )}
    >
      {!floating && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-signal/40 to-transparent" />
      )}
      <div className="flex items-center gap-5">
        <div className="flex h-9 items-center">
          <Image
            src="/argus-logo.png"
            alt="Argus OSINT Dashboard"
            width={150}
            height={40}
            priority
            className="h-8 w-auto max-w-[132px] object-contain sm:max-w-[150px]"
          />
        </div>
        <nav className="hidden items-center gap-1.5 md:flex">
          <NavLink href="/" label="Live Ops" />
          <NavLink href="/brief" label="Daily Brief" />
        </nav>
      </div>

      {/* center: search */}
      <div className="mx-2 flex min-w-0 flex-1 justify-center sm:mx-4">
        <SearchBox />
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-5">
        <div className="hidden items-center gap-5 xl:flex">
          <Stat label="Aircraft" value={compact(flights.data?.meta.count ?? 0)} live={!!flights.data?.meta.live} />
          <Stat label="Seismic" value={compact(quakes.data?.meta.count ?? 0)} live={!!quakes.data?.meta.live} />
          <Stat label="Orbital" value={compact(space.data?.meta.count ?? 0)} live={!!space.data?.meta.live} />
        </div>
        <div className="hidden items-center gap-1.5 lg:flex">
          <span className="live-dot text-ok" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ok">Live</span>
        </div>
        <Clock />
      </div>
    </header>
  );
}
