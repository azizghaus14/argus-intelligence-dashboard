"use client";

import { useEvents } from "@/lib/hooks/useFeeds";
import { timeAgo } from "@/lib/utils/format";

export default function EventTicker() {
  const { data } = useEvents();
  const items = data?.data ?? [];

  return (
    <div className="relative flex items-center gap-3 border-t border-white/10 bg-gradient-to-t from-white/[0.05] to-transparent px-3 py-2 backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-alert/40 to-transparent" />
      <span className="glass-chip flex shrink-0 items-center gap-1.5 px-2.5 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-alert animate-pulse-dot" />
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-alert">Live Wire</span>
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div className="flex w-max animate-[scroll_90s_linear_infinite] gap-8 whitespace-nowrap hover:[animation-play-state:paused]">
          {[...items, ...items].map((n, i) => (
            <a
              key={`${n.id}-${i}`}
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 font-mono text-[11px]"
            >
              <span className="text-signal">{n.source}</span>
              <span className="text-text-secondary group-hover:text-text-primary">{n.title}</span>
              <span className="text-text-muted">· {timeAgo(n.published)}</span>
            </a>
          ))}
          {items.length === 0 && (
            <span className="font-mono text-[11px] text-text-tertiary">Acquiring OSINT feeds…</span>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
