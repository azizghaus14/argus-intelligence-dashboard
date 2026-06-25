"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  X,
  Crosshair,
  AlertTriangle,
  Activity,
  Plane,
  Radio,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Eye,
  Target,
  Briefcase,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useUIStore } from "@/lib/store/uiStore";
import { useLiveBrief } from "@/lib/briefings/live";
import { useForecast } from "@/lib/analytics/useForecast";
import { useAiBrief } from "@/lib/hooks/useFeeds";
import { summarize, SEVERITY_META } from "@/lib/analytics/anomaly";
import { threatFill, severityClass, toneClass, statusClass, actionClass, THREAT_LEVELS } from "@/lib/briefings/style";
import { compact, timeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

function Section({
  no,
  title,
  meta,
  icon,
  children,
  className,
}: {
  no: string;
  title: string;
  meta?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel p-4", className)}>
      <div className="mb-3 flex items-baseline gap-2.5 border-b border-white/[0.06] pb-2">
        <span className="font-mono text-[11px] tracking-[0.2em] text-signal">§ {no}</span>
        <span className="flex items-center gap-1.5">
          {icon}
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-text-primary">{title}</h2>
        </span>
        {meta && <span className="ml-auto font-mono text-[9px] text-text-tertiary">{meta}</span>}
      </div>
      {children}
    </section>
  );
}

export default function BriefOverlay() {
  const briefOpen = useUIStore((s) => s.briefOpen);
  const setBriefOpen = useUIStore((s) => s.setBriefOpen);
  const anomalies = useUIStore((s) => s.anomalies);

  const brief = useLiveBrief();
  const fc = useForecast();
  const sent = fc.sentiment;
  const summary = summarize(anomalies);
  const ai = useAiBrief(briefOpen);
  const aiBrief = ai.data?.available ? ai.data.brief : null;
  const aiLoading = briefOpen && !ai.data && !ai.error;

  const avgMove = fc.assets.length
    ? fc.assets.reduce((s, a) => s + a.expectedChangePct, 0) / fc.assets.length
    : 0;
  const threatLevel = aiBrief?.threatLevel ?? brief.threatLevel;
  const conflicts = brief.developments.filter((d) => d.tag === "CONFLICT");

  // Deterministic fallback judgments (used when the AI brief is unavailable).
  const judgments = useMemo(() => {
    const out: { tone: "alert" | "warn" | "info"; text: string }[] = [];
    const emerg = anomalies.find((a) => a.kind === "EMERGENCY_SQUAWK");
    if (conflicts.length)
      out.push({ tone: "alert", text: `${conflicts.length} active conflict signal${conflicts.length > 1 ? "s" : ""} across the OSINT wire; threat assessed ${brief.threatLevel}.` });
    if (emerg) out.push({ tone: "alert", text: `Aviation emergency — ${emerg.callsign}: ${emerg.reason}.` });
    else if (summary.total)
      out.push({ tone: summary.critical ? "alert" : "warn", text: `${summary.total} flight anomalies flagged by SENTINEL (${summary.critical} critical).` });
    if (brief.topQuakes[0]) out.push({ tone: "info", text: `Largest quake M${brief.topQuakes[0].mag.toFixed(1)} near ${brief.topQuakes[0].place}.` });
    if (Math.abs(sent.index) > 0.12)
      out.push({ tone: sent.index < 0 ? "warn" : "info", text: `Crypto outlook ${sent.label.toLowerCase()} — news sentiment ${sent.index >= 0 ? "+" : ""}${sent.index.toFixed(2)}; 24h bias ${avgMove >= 0 ? "+" : ""}${avgMove.toFixed(2)}%.` });
    out.push({ tone: "info", text: `${compact(brief.stats.aircraft)} aircraft tracked; ${brief.regions[0]?.region ?? "—"} busiest airspace.` });
    return out.slice(0, 6);
  }, [anomalies, conflicts.length, brief, sent, summary, avgMove]);

  const topAnoms = anomalies.slice(0, 6);

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 transition-opacity duration-500",
        briefOpen ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <div className="absolute inset-0 bg-bg-base/60 backdrop-blur-[3px]" />

      <button
        onClick={() => setBriefOpen(false)}
        className="glass-chip absolute right-5 top-16 z-10 flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary transition hover:text-white"
      >
        <X className="h-3.5 w-3.5" /> Close
      </button>

      <div className="hud-scroll absolute inset-0 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-[72px]">
          {/* ── Masthead ── */}
          <div className="panel p-5">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <Image
                  src="/argus-logo.png"
                  alt="ARGUS"
                  width={150}
                  height={40}
                  priority
                  className="mb-2 h-8 w-auto max-w-[150px] object-contain"
                />
                <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-text-tertiary">
                  <span className="live-dot text-ok" /> Daily Intelligence Briefing
                  {aiBrief && (
                    <span className="ml-1 flex items-center gap-1 text-signal">
                      <Sparkles className="h-2.5 w-2.5" /> AI-SYNTHESIZED
                    </span>
                  )}
                </p>
                <p className="mt-1 font-mono text-[10px] text-text-secondary">
                  {aiBrief?.dateLabel ?? brief.dateLabel} · {ai.data?.available ? `GENERATED BY ${ai.data.meta.model.toUpperCase()}` : "AUTO-GENERATED FROM LIVE FEEDS"}
                </p>
              </div>
              <div className="text-right">
                <p className="stat-label">Prepared for</p>
                <p className="font-mono text-[11px] text-text-secondary">AZIZ · GLOBAL DESK</p>
              </div>
            </div>

            {aiBrief?.headline && (
              <p className="mb-2 font-display text-lg font-bold leading-snug text-text-primary">{aiBrief.headline}</p>
            )}

            <p className="stat-label mb-1">Global Threat Level · derived live</p>
            <div className="flex gap-1">
              {THREAT_LEVELS.map((lvl) => (
                <div
                  key={lvl}
                  className={cn(
                    "flex-1 rounded-md py-1 text-center font-mono text-[9px] font-bold uppercase tracking-wider transition",
                    lvl === threatLevel ? threatFill(lvl) : "bg-white/[0.04] text-text-muted"
                  )}
                >
                  {lvl}
                </div>
              ))}
            </div>
            <p className="mt-2 font-body text-[12.5px] leading-relaxed text-text-secondary">
              {aiBrief?.overview ?? brief.threatReason}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {brief.tickers.slice(0, 3).map((t) => (
                <div key={t.label} className="glass-tile px-2.5 py-1.5">
                  <p className="stat-label">{t.label}</p>
                  <p className={cn("font-mono text-sm font-bold tabular", toneClass(t.tone))}>{t.value}</p>
                  <p className="font-mono text-[8px] text-text-tertiary">{t.sub}</p>
                </div>
              ))}
              <div className="glass-tile px-2.5 py-1.5">
                <p className="stat-label">Anomalies</p>
                <p className="font-mono text-sm font-bold tabular text-warn">{summary.total}</p>
                <p className="font-mono text-[8px] text-text-tertiary">{summary.critical} critical</p>
              </div>
              <div className="glass-tile px-2.5 py-1.5">
                <p className="stat-label">Seismic 24h</p>
                <p className="font-mono text-sm font-bold tabular text-quake">{brief.stats.seismic24h}</p>
                <p className="font-mono text-[8px] text-text-tertiary">M{brief.stats.maxMag.toFixed(1)} peak</p>
              </div>
            </div>
          </div>

          {aiLoading && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] py-6 font-mono text-[11px] text-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin text-signal" /> Synthesizing today’s intelligence brief from live signals…
            </div>
          )}

          {ai.data && !ai.data.available && (
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 font-mono text-[10px] text-text-tertiary">
              <span className="text-warn">AI brief offline</span> — {ai.data.meta.reason}. Showing live-derived analysis. Add
              <span className="text-text-secondary"> ANTHROPIC_API_KEY</span> to <span className="text-text-secondary">.env</span> to enable daily AI synthesis.
            </div>
          )}

          {/* ── §01 Executive Summary (AI, else deterministic) ── */}
          <div className="mt-4">
            <Section no="01" title="Executive Summary" icon={<Crosshair className="h-3.5 w-3.5 text-signal" />} meta={aiBrief ? "AI · ranked signals" : "live-derived"}>
              {aiBrief ? (
                <div className="space-y-2">
                  {aiBrief.executiveSummary.map((s, i) => {
                    const c = severityClass(s.severity);
                    return (
                      <div key={i} className={cn("rounded-md border-l-2 bg-white/[0.02] py-2 pl-3 pr-2.5", c.border)}>
                        <div className="flex items-center gap-2">
                          <span className={cn("rounded px-1.5 py-0.5 font-mono text-[8px] font-bold", c.bg, c.text)}>{s.severity}</span>
                          <span className="font-display text-[13px] font-semibold text-text-primary">{s.title}</span>
                        </div>
                        <p className="mt-1 font-body text-[12px] leading-relaxed text-text-secondary">{s.analysis}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <ul className="space-y-2">
                  {judgments.map((j, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", j.tone === "alert" ? "bg-alert" : j.tone === "warn" ? "bg-warn" : "bg-signal")} />
                      <p className="font-body text-[12.5px] leading-relaxed text-text-secondary">{j.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>

          {/* ── AI analysis grid ── */}
          {aiBrief && (
            <>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <Section no="02" title="Market Analysis" icon={<Activity className="h-3.5 w-3.5 text-signal" />}>
                  <div className="space-y-1.5">
                    {aiBrief.marketAnalysis.map((m, i) => (
                      <div key={i} className="rounded-md bg-white/[0.02] px-2.5 py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-text-primary">{m.asset}</span>
                          <span className={cn("font-mono text-[9px] font-bold uppercase tracking-wider", statusClass(m.signal))}>{m.signal}</span>
                        </div>
                        <p className="mt-0.5 font-body text-[11.5px] leading-snug text-text-secondary">{m.view}</p>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section no="03" title="Business Signals" icon={<Briefcase className="h-3.5 w-3.5 text-signal" />} meta="analyst desks">
                  <div className="space-y-2">
                    {aiBrief.businessSignals.map((b, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                        <p className="font-body text-[11.5px] leading-snug text-text-secondary">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-signal">{b.source}</span> — {b.signal}
                        </p>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section no="04" title="Things to Watch" icon={<Eye className="h-3.5 w-3.5 text-warn" />} meta="upcoming catalysts">
                  <div className="space-y-2">
                    {aiBrief.thingsToWatch.map((t, i) => (
                      <div key={i} className="rounded-md bg-white/[0.02] px-2.5 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display text-[12px] font-semibold text-text-primary">{t.title}</span>
                          <span className="shrink-0 rounded bg-warn/15 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase text-warn">{t.horizon}</span>
                        </div>
                        <p className="mt-0.5 font-body text-[11.5px] leading-snug text-text-secondary">{t.detail}</p>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section no="05" title="Opportunity Matrix" icon={<Target className="h-3.5 w-3.5 text-ok" />} meta="actionable">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {aiBrief.opportunities.map((o, i) => {
                      const a = actionClass(o.action as never);
                      return (
                        <div key={i} className="rounded-md bg-white/[0.02] p-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display text-[12px] font-bold text-text-primary">{o.asset}</span>
                            <span className={cn("rounded px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase", a.bg, a.text)}>{o.action}</span>
                          </div>
                          <p className="mt-1 font-body text-[11px] leading-snug text-text-tertiary">{o.rationale}</p>
                        </div>
                      );
                    })}
                  </div>
                </Section>
              </div>

              {/* ── §06 Probability Matrix ── */}
              <div className="mt-4">
                <Section no="06" title="30-Day Probability Matrix" icon={<Sparkles className="h-3.5 w-3.5 text-signal" />}>
                  <div className="space-y-1">
                    {aiBrief.predictions.map((p, i) => {
                      const col = p.probability >= 66 ? "text-ok" : p.probability >= 40 ? "text-warn" : "text-alert";
                      return (
                        <div key={i} className="flex items-center gap-3 rounded-md bg-white/[0.02] px-2.5 py-1.5">
                          <span className="flex-1 font-body text-[11.5px] text-text-secondary">{p.statement}</span>
                          <span className={cn("shrink-0 font-mono text-[12px] font-bold tabular", col)}>{p.probability}%</span>
                        </div>
                      );
                    })}
                  </div>
                </Section>
              </div>
            </>
          )}

          {/* ── Live data layer ── */}
          <p className="mt-6 mb-2 flex items-center gap-2 px-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            <span className="live-dot text-ok" /> Live Telemetry
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <Section no="07" title="SENTINEL Threat Board" icon={<ShieldAlert className="h-3.5 w-3.5 text-alert" />} meta={`${summary.total} flagged`}>
              <div className="mb-2 grid grid-cols-3 gap-2">
                <div className="glass-tile px-2 py-1.5 text-center">
                  <p className="stat-label">Critical</p>
                  <p className="font-mono text-lg font-bold tabular text-alert">{summary.critical}</p>
                </div>
                <div className="glass-tile px-2 py-1.5 text-center">
                  <p className="stat-label">High</p>
                  <p className="font-mono text-lg font-bold tabular text-quake">{summary.high}</p>
                </div>
                <div className="glass-tile px-2 py-1.5 text-center">
                  <p className="stat-label">24h Bias</p>
                  <p className={cn("font-mono text-lg font-bold tabular", avgMove >= 0 ? "text-ok" : "text-alert")}>
                    {avgMove >= 0 ? "+" : ""}
                    {avgMove.toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                {topAnoms.map((a) => {
                  const m = SEVERITY_META[a.severity];
                  return (
                    <div key={a.id} className="flex items-center gap-2 rounded-md bg-white/[0.03] px-2 py-1.5">
                      <span className="w-8 shrink-0 rounded text-center font-mono text-[11px] font-bold tabular" style={{ color: m.color, backgroundColor: m.bg }}>
                        {a.score}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-text-primary">{a.callsign}</span>
                      <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: m.color }}>{a.category}</span>
                      <span className="ml-auto truncate pl-2 font-mono text-[9px] text-text-tertiary">{a.reason}</span>
                    </div>
                  );
                })}
                {topAnoms.length === 0 && <p className="py-3 text-center font-mono text-[10px] text-text-tertiary">No anomalies in current frame.</p>}
              </div>
            </Section>

            <Section no="08" title="Significant Seismic" icon={<Activity className="h-3.5 w-3.5 text-quake" />} meta="USGS · M4.5+">
              <div className="space-y-1">
                {brief.topQuakes.map((q) => (
                  <div key={q.id} className="flex items-center gap-2 rounded-md bg-white/[0.03] px-2 py-1.5">
                    <span className={cn("w-9 shrink-0 rounded px-1 py-0.5 text-center font-mono text-[10px] font-bold tabular", q.mag >= 6 ? "bg-alert/20 text-alert" : q.mag >= 5 ? "bg-quake/20 text-quake" : "bg-warn/15 text-warn")}>
                      {q.mag.toFixed(1)}
                    </span>
                    <span className="flex-1 truncate font-mono text-[10px] text-text-secondary">{q.place}</span>
                    <span className="shrink-0 font-mono text-[8px] tabular text-text-tertiary">{timeAgo(q.time)}</span>
                  </div>
                ))}
                {brief.topQuakes.length === 0 && <p className="py-3 text-center font-mono text-[10px] text-text-tertiary">No M4.5+ events in window.</p>}
              </div>
            </Section>
          </div>

          <div className="mt-4">
            <Section no="09" title="Global Air Traffic" icon={<Plane className="h-3.5 w-3.5 text-signal" />} meta={`${compact(brief.stats.aircraft)} tracked`}>
              <div className="space-y-2">
                {brief.regions.map((r) => {
                  const max = Math.max(...brief.regions.map((x) => x.count), 1);
                  return (
                    <div key={r.region} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 font-mono text-[10px] text-text-secondary">{r.region}</span>
                      <div className="h-3 flex-1 rounded-sm bg-white/[0.04]">
                        <div className="h-full rounded-sm bg-signal/70" style={{ width: `${Math.max(4, (r.count / max) * 100)}%` }} />
                      </div>
                      <span className="w-14 shrink-0 text-right font-mono text-[10px] tabular text-text-primary">{r.count.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>

          <div className="mt-4">
            <Section no="10" title="Live Developments" icon={<Radio className="h-3.5 w-3.5 text-warn" />} meta={`${brief.developments.length} signals · OSINT`}>
              <div className="grid gap-2 md:grid-cols-2">
                {brief.developments.slice(0, 16).map((d) => {
                  const s = severityClass(d.severity);
                  return (
                    <a key={d.id} href={d.link} target="_blank" rel="noopener noreferrer" className={cn("block rounded-md border-l-2 bg-white/[0.02] py-1.5 pl-2.5 pr-2 transition hover:bg-white/[0.05]", s.border)}>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("rounded px-1 font-mono text-[8px] font-bold", s.bg, s.text)}>{d.tag}</span>
                        <span className="font-mono text-[9px] text-signal">{d.source}</span>
                        <span className="ml-auto font-mono text-[8px] text-text-muted">{timeAgo(d.published)}</span>
                      </div>
                      <p className="mt-0.5 font-body text-[11px] leading-snug text-text-secondary">{d.title}</p>
                    </a>
                  );
                })}
              </div>
            </Section>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 font-mono text-[9px] text-text-muted">
            <span className="flex items-center gap-1 text-text-tertiary">
              <AlertTriangle className="h-3 w-3" /> SOURCES
            </span>
            {brief.sources.map((s) => (
              <span key={s}>· {s}</span>
            ))}
            {ai.data?.available && <span>· {ai.data.meta.model}</span>}
            <span className="ml-auto">Generated {new Date((aiBrief?.generatedAt ?? brief.generatedAt)).toISOString().slice(11, 19)}Z · live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
