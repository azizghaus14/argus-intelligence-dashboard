"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLiveBrief } from "@/lib/briefings/live";
import { threatFill, severityClass, THREAT_LEVELS } from "@/lib/briefings/style";
import { toneClass } from "@/lib/briefings/style";
import { timeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import RadialGauge from "./RadialGauge";

export default function LiveBriefPanel() {
  const brief = useLiveBrief();
  const threatFrac = (THREAT_LEVELS.indexOf(brief.threatLevel) + 1) / THREAT_LEVELS.length;

  return (
    <div className="panel hud-frame flex min-h-0 flex-1 flex-col p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="live-dot text-ok" />
          <span className="panel-title">Live Brief · {brief.dateLabel}</span>
        </span>
        <Link href="/brief" className="flex items-center gap-0.5 font-mono text-[9px] uppercase tracking-wider text-signal hover:text-white">
          Full <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* threat */}
      <div className="mb-2 flex items-center gap-2 rounded-xl bg-white/[0.04] p-2">
        <RadialGauge id="threat" value={threatFrac} center={brief.threatLevel.slice(0, 4)} label="Threat" size={84} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="stat-label">Global Threat</span>
            <span className={cn("rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold", threatFill(brief.threatLevel))}>
              {brief.threatLevel}
            </span>
          </div>
          <p className="font-mono text-[8px] leading-relaxed text-text-tertiary">{brief.threatReason}</p>
        </div>
      </div>

      {/* live tickers */}
      <div className="mb-2 grid grid-cols-3 gap-1">
        {brief.tickers.slice(0, 3).map((t) => (
          <div key={t.label} className="glass-tile px-1.5 py-1">
            <p className="stat-label">{t.label}</p>
            <p className={cn("font-mono text-[11px] font-bold tabular", toneClass(t.tone))}>{t.value}</p>
            <p className="font-mono text-[7px] text-text-tertiary">{t.sub}</p>
          </div>
        ))}
      </div>

      {/* developments */}
      <p className="stat-label mb-1">Developments · OSINT</p>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {brief.developments.slice(0, 12).map((d) => {
          const s = severityClass(d.severity);
          return (
            <a
              key={d.id}
              href={d.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-sm px-1.5 py-1 transition hover:bg-bg-hover"
            >
              <div className="flex items-center gap-1.5">
                <span className={cn("rounded-sm px-1 font-mono text-[7px] font-bold", s.bg, s.text)}>{d.tag}</span>
                <span className="font-mono text-[8px] text-signal">{d.source}</span>
                <span className="ml-auto font-mono text-[7px] text-text-muted">{timeAgo(d.published)}</span>
              </div>
              <p className="mt-0.5 line-clamp-2 font-body text-[10px] leading-snug text-text-secondary">{d.title}</p>
            </a>
          );
        })}
        {brief.developments.length === 0 && (
          <p className="py-3 text-center font-mono text-[9px] text-text-tertiary">Acquiring live feeds…</p>
        )}
      </div>
    </div>
  );
}
