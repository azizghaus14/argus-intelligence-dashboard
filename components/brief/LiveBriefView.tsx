"use client";

import { useLiveBrief } from "@/lib/briefings/live";
import { threatFill, severityClass, toneClass, THREAT_LEVELS } from "@/lib/briefings/style";
import { timeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export default function LiveBriefView() {
  const b = useLiveBrief();
  const maxRegion = Math.max(...b.regions.map((r) => r.count), 1);

  return (
    <main className="min-w-0 space-y-3 animate-fade-in">
      {/* masthead */}
      <div className="panel hud-frame p-4">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.28em] text-text-tertiary">
              <span className="live-dot text-ok" /> Real-Time Intelligence Briefing
            </p>
            <h1 className="font-display text-2xl font-bold tracking-[0.06em] text-text-primary">
              GLOBAL <span className="text-signal">SIGNAL</span>
              <span className="ml-2 align-middle font-mono text-[10px] font-medium text-ok">/ LIVE</span>
            </h1>
            <p className="mt-1 font-mono text-[10px] text-text-secondary">
              {b.dateLabel} · AUTO-GENERATED FROM LIVE FEEDS · {b.live ? "FEEDS ONLINE" : "DEGRADED"}
            </p>
          </div>
          <div className="text-right">
            <p className="stat-label">Prepared for</p>
            <p className="font-mono text-[11px] text-text-secondary">AZIZ · GLOBAL DESK</p>
          </div>
        </div>

        <p className="stat-label mb-1">Global Threat Level · derived live</p>
        <div className="flex gap-1">
          {THREAT_LEVELS.map((lvl) => (
            <div
              key={lvl}
              className={cn(
                "flex-1 rounded-sm py-1 text-center font-mono text-[9px] font-bold uppercase tracking-wider transition",
                lvl === b.threatLevel ? threatFill(lvl) : "bg-bg-elev text-text-muted"
              )}
            >
              {lvl}
            </div>
          ))}
        </div>
        <p className="mt-2 font-body text-[12px] leading-relaxed text-text-secondary">{b.threatReason}</p>
      </div>

      {/* tickers + stats */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {b.tickers.map((t) => (
          <div key={t.label} className="panel p-2.5">
            <p className="stat-label">{t.label}</p>
            <p className={cn("font-mono text-lg font-bold tabular", toneClass(t.tone))}>{t.value}</p>
            <p className="font-mono text-[9px] text-text-tertiary">{t.sub}</p>
          </div>
        ))}
      </div>

      {/* developments */}
      <div className="panel p-4">
        <div className="mb-3 flex items-baseline gap-3 border-b border-border-subtle pb-2">
          <span className="font-mono text-[11px] tracking-[0.2em] text-signal">§ 01</span>
          <h2 className="font-display text-base font-semibold uppercase tracking-[0.12em] text-text-primary">
            Live Developments
          </h2>
          <span className="font-mono text-[10px] text-text-tertiary">{b.developments.length} signals · OSINT wire</span>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {b.developments.slice(0, 24).map((d) => {
            const s = severityClass(d.severity);
            return (
              <a
                key={d.id}
                href={d.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("rounded-sm border-l-2 bg-bg-elev/50 py-2 pl-3 pr-2 transition hover:bg-bg-hover", s.border)}
              >
                <div className="flex items-center gap-1.5">
                  <span className={cn("rounded-sm px-1 font-mono text-[8px] font-bold", s.bg, s.text)}>{d.tag}</span>
                  <span className="font-mono text-[9px] text-signal">{d.source}</span>
                  <span className="ml-auto font-mono text-[8px] text-text-muted">{timeAgo(d.published)}</span>
                </div>
                <p className="mt-1 font-body text-[11px] leading-snug text-text-secondary">{d.title}</p>
              </a>
            );
          })}
          {b.developments.length === 0 && (
            <p className="col-span-2 py-6 text-center font-mono text-[10px] text-text-tertiary">Acquiring live OSINT feeds…</p>
          )}
        </div>
      </div>

      {/* seismic + regions */}
      <div className="grid gap-3 xl:grid-cols-2">
        <div className="panel p-4">
          <div className="mb-3 flex items-baseline gap-3 border-b border-border-subtle pb-2">
            <span className="font-mono text-[11px] tracking-[0.2em] text-signal">§ 02</span>
            <h2 className="font-display text-base font-semibold uppercase tracking-[0.12em] text-text-primary">
              Significant Seismic
            </h2>
            <span className="font-mono text-[10px] text-text-tertiary">live · USGS · M4.5+</span>
          </div>
          <div className="space-y-1">
            {b.topQuakes.map((q) => (
              <div key={q.id} className="flex items-center gap-2 rounded-sm bg-bg-elev/40 px-2 py-1.5">
                <span
                  className={cn(
                    "w-9 shrink-0 rounded-sm px-1 py-0.5 text-center font-mono text-[10px] font-bold tabular",
                    q.mag >= 6 ? "bg-alert/20 text-alert" : q.mag >= 5 ? "bg-quake/20 text-quake" : "bg-warn/15 text-warn"
                  )}
                >
                  {q.mag.toFixed(1)}
                </span>
                <span className="flex-1 truncate font-mono text-[10px] text-text-secondary">{q.place}</span>
                <span className="shrink-0 font-mono text-[9px] tabular text-text-tertiary">{timeAgo(q.time)}</span>
              </div>
            ))}
            {b.topQuakes.length === 0 && (
              <p className="py-4 text-center font-mono text-[10px] text-text-tertiary">No M4.5+ events in window.</p>
            )}
          </div>
        </div>

        <div className="panel p-4">
          <div className="mb-3 flex items-baseline gap-3 border-b border-border-subtle pb-2">
            <span className="font-mono text-[11px] tracking-[0.2em] text-signal">§ 03</span>
            <h2 className="font-display text-base font-semibold uppercase tracking-[0.12em] text-text-primary">
              Air Traffic
            </h2>
            <span className="font-mono text-[10px] text-text-tertiary">{b.stats.aircraft.toLocaleString()} tracked · OpenSky</span>
          </div>
          <div className="space-y-2">
            {b.regions.map((r) => (
              <div key={r.region} className="flex items-center gap-2">
                <span className="w-28 shrink-0 font-mono text-[10px] text-text-secondary">{r.region}</span>
                <div className="h-3.5 flex-1 rounded-sm bg-bg-base/60">
                  <div
                    className="h-full rounded-sm bg-signal"
                    style={{ width: `${Math.max(4, (r.count / maxRegion) * 100)}%` }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right font-mono text-[10px] tabular text-text-primary">
                  {r.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border-subtle pt-3">
            <div>
              <p className="stat-label">Seismic 24h</p>
              <p className="font-mono text-sm font-bold tabular text-text-primary">{b.stats.seismic24h}</p>
            </div>
            <div>
              <p className="stat-label">Peak Mag</p>
              <p className="font-mono text-sm font-bold tabular text-warn">M{b.stats.maxMag.toFixed(1)}</p>
            </div>
            <div>
              <p className="stat-label">OSINT</p>
              <p className="font-mono text-sm font-bold tabular text-text-primary">{b.stats.osint}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="panel hud-frame border-signal/30 p-4">
        <p className="panel-title mb-2">⟁ Generation Note</p>
        <p className="font-body text-[11px] leading-relaxed text-text-secondary">
          This briefing is assembled automatically from live open-source feeds at load time — threat level is
          derived from real-time conflict-keyword density in the OSINT wire and global seismic activity. It is not the
          static historical archive; switch editions in the rail to review past Dark Signal briefs.
        </p>
        <p className="mt-3 border-t border-border-subtle pt-2 font-mono text-[8px] uppercase tracking-wider text-text-muted">
          Sources: {b.sources.join(" · ")} · Generated {b.dateLabel} · Open source
        </p>
      </div>
    </main>
  );
}
