"use client";

import type { Edition } from "@/lib/briefings/types";
import {
  toneClass,
  severityClass,
  actionClass,
  statusClass,
  THREAT_LEVELS,
  threatFill,
} from "@/lib/briefings/style";
import { cn } from "@/lib/utils/cn";

function SectionTitle({ n, title, sub }: { n: string; title: string; sub?: string }) {
  return (
    <div className="mb-3 flex items-baseline gap-3 border-b border-border-subtle pb-2">
      <span className="font-mono text-[11px] tracking-[0.2em] text-signal">§ {n}</span>
      <h2 className="font-display text-base font-semibold uppercase tracking-[0.12em] text-text-primary">
        {title}
      </h2>
      {sub && <span className="font-mono text-[10px] text-text-tertiary">{sub}</span>}
    </div>
  );
}

export function ThreatBar({ ed }: { ed: Edition }) {
  return (
    <div className="panel hud-frame p-4">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-text-tertiary">
            Daily Intelligence Briefing
          </p>
          <h1 className="font-display text-2xl font-bold tracking-[0.06em] text-text-primary">
            DARK <span className="text-signal">SIGNAL</span>
          </h1>
          <p className="mt-1 font-mono text-[10px] text-text-secondary">
            {ed.dateLabel} · EDITION {ed.editionNo} · {ed.subtitle.toUpperCase()}
          </p>
          {ed.operation && (
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-alert">
              {ed.operation}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="stat-label">Prepared for</p>
          <p className="font-mono text-[11px] text-text-secondary">AZIZ · {ed.location}</p>
        </div>
      </div>

      <p className="stat-label mb-1">Global Threat Level</p>
      <div className="flex gap-1">
        {THREAT_LEVELS.map((lvl) => {
          const active = lvl === ed.threatLevel;
          return (
            <div
              key={lvl}
              className={cn(
                "flex-1 rounded-sm py-1 text-center font-mono text-[9px] font-bold uppercase tracking-wider transition",
                active ? threatFill(lvl) : "bg-bg-elev text-text-muted"
              )}
            >
              {lvl}
            </div>
          );
        })}
      </div>

      <p className="mt-3 font-body text-[12px] leading-relaxed text-text-secondary">
        {ed.headline}
      </p>
    </div>
  );
}

export function TickerStrip({ ed }: { ed: Edition }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {ed.tickers.map((t) => (
        <div key={t.label} className="panel p-2.5">
          <p className="stat-label">{t.label}</p>
          <p className={cn("font-mono text-lg font-bold tabular", toneClass(t.tone))}>{t.value}</p>
          {t.sub && <p className="font-mono text-[9px] text-text-tertiary">{t.sub}</p>}
        </div>
      ))}
    </div>
  );
}

export function ExecSummary({ ed }: { ed: Edition }) {
  return (
    <div className="panel p-4">
      <SectionTitle n="01" title="Executive Summary" sub={`${ed.summary.length} signals`} />
      <div className="space-y-2.5">
        {ed.summary.map((it, i) => {
          const s = severityClass(it.severity);
          return (
            <div key={i} className={cn("rounded-sm border-l-2 bg-bg-elev/50 py-2 pl-3 pr-2", s.border)}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-[13px] font-semibold text-text-primary">
                  {it.rank ? `${it.rank}. ` : ""}
                  {it.title}
                </h3>
                <span className={cn("shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[8px] font-bold", s.bg, s.text)}>
                  {it.severity}
                </span>
              </div>
              <p className="mt-1 font-body text-[11px] leading-relaxed text-text-secondary">{it.body}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {it.tags?.map((tg) => (
                  <span key={tg} className="rounded-sm border border-border-subtle px-1.5 font-mono text-[8px] tracking-wider text-text-tertiary">
                    {tg}
                  </span>
                ))}
                {it.confidence && (
                  <span className="font-mono text-[8px] text-text-muted">CONF: {it.confidence}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GeopoliticsPanel({ ed, onSelect }: { ed: Edition; onSelect?: (id: string) => void }) {
  return (
    <div className="panel p-4">
      <SectionTitle n="02" title="Geopolitics" sub="Active flashpoints" />
      <div className="grid gap-2.5 md:grid-cols-2">
        {ed.geopolitics.map((f) => {
          const s = severityClass(f.severity);
          return (
            <button
              key={f.id}
              onClick={() => onSelect?.(f.id)}
              className={cn(
                "rounded-sm border-l-2 bg-bg-elev/50 py-2 pl-3 pr-2 text-left transition hover:bg-bg-hover",
                s.border
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-[12px] font-semibold uppercase tracking-wide text-text-primary">
                  {f.title}
                </h3>
                <span className={cn("shrink-0 font-mono text-[8px] font-bold", s.text)}>{f.status}</span>
              </div>
              <p className="font-mono text-[8px] uppercase tracking-wider text-text-muted">{f.region}</p>
              <p className="mt-1 font-body text-[10px] leading-relaxed text-text-secondary">{f.body}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MarketsTable({ ed }: { ed: Edition }) {
  return (
    <div className="panel p-4">
      <SectionTitle n="03" title="Markets" sub="Snapshot + signals" />
      <div className="space-y-px">
        {ed.markets.map((m) => (
          <div key={m.asset} className="grid grid-cols-12 items-center gap-2 rounded-sm bg-bg-elev/40 px-2 py-1.5">
            <span className="col-span-3 font-mono text-[11px] text-text-secondary">{m.asset}</span>
            <span className={cn("col-span-2 font-mono text-[12px] font-bold tabular", toneClass(m.tone))}>{m.price}</span>
            <span className={cn("col-span-2 font-mono text-[9px] tabular", toneClass(m.tone))}>{m.change}</span>
            <span className="col-span-3 truncate font-body text-[10px] text-text-tertiary">{m.signal}</span>
            <span className="col-span-2 text-right font-mono text-[9px] text-signal">{m.keyLevel}</span>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <p className="stat-label mb-1.5">Central Bank Posture</p>
        <div className="space-y-px">
          {ed.centralBanks.map((c) => (
            <div key={c.name} className="grid grid-cols-12 items-center gap-2 rounded-sm bg-bg-elev/40 px-2 py-1.5">
              <span className="col-span-3 font-mono text-[10px] text-text-secondary">{c.name}</span>
              <span className={cn("col-span-2 rounded-sm px-1 text-center font-mono text-[8px] font-bold", toneClass(c.tone))}>
                {c.stance}
              </span>
              <span className="col-span-2 font-mono text-[10px] tabular text-text-primary">{c.rate}</span>
              <span className="col-span-5 truncate font-body text-[9px] text-text-tertiary">{c.note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RegionalDesks({ ed }: { ed: Edition }) {
  return (
    <div className="panel p-4">
      <SectionTitle n="04" title="Regional Desks" sub="Pakistan · Malaysia" />
      <div className="grid gap-3 md:grid-cols-2">
        {ed.regional.map((r) => (
          <div key={r.country} className="rounded-sm border border-border-subtle bg-bg-elev/40 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-base">{r.flag}</span>
              <span className="font-display text-[13px] font-semibold uppercase tracking-wide text-text-primary">
                {r.country}
              </span>
              {r.tag && (
                <span className="ml-auto rounded-sm bg-signal/10 px-1.5 font-mono text-[8px] uppercase tracking-wider text-signal">
                  {r.tag}
                </span>
              )}
            </div>
            <div className="mb-2 grid grid-cols-2 gap-1.5">
              {r.metrics.map((m) => (
                <div key={m.label} className="rounded-sm bg-bg-base/60 px-2 py-1">
                  <p className="stat-label">{m.label}</p>
                  <p className={cn("font-mono text-[12px] font-bold tabular", toneClass(m.tone ?? "flat"))}>{m.value}</p>
                  {m.sub && <p className="font-mono text-[8px] text-text-tertiary">{m.sub}</p>}
                </div>
              ))}
            </div>
            <ul className="space-y-1">
              {r.analysis.map((a, i) => (
                <li key={i} className="flex gap-1.5 font-body text-[10px] leading-relaxed text-text-secondary">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-sm bg-signal" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WeakSignals({ ed }: { ed: Edition }) {
  return (
    <div className="panel p-4">
      <SectionTitle n="05" title="Weak Signals" sub="Emerging risks" />
      <div className="space-y-2">
        {ed.weakSignals.map((w, i) => {
          const s = severityClass(w.risk);
          return (
            <div key={i} className={cn("rounded-sm border-l-2 bg-bg-elev/40 py-2 pl-3 pr-2", s.border)}>
              <div className="flex items-center gap-2">
                <span className={cn("text-[10px]", s.text)}>▲</span>
                <h3 className="font-display text-[12px] font-semibold text-text-primary">{w.title}</h3>
                <span className={cn("ml-auto font-mono text-[8px] font-bold", s.text)}>{w.risk} RISK</span>
              </div>
              <p className="mt-1 font-body text-[10px] leading-relaxed text-text-secondary">{w.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OpportunityMatrix({ ed }: { ed: Edition }) {
  return (
    <div className="panel p-4">
      <SectionTitle n="06" title="Opportunity Matrix" sub="Pre-consensus · not yet consensus" />
      <div className="grid gap-2.5 md:grid-cols-2">
        {ed.opportunities.map((o, i) => {
          const a = actionClass(o.action);
          return (
            <div key={i} className="rounded-sm border border-border-subtle bg-bg-elev/40 p-2.5">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h3 className="font-display text-[12px] font-semibold text-text-primary">{o.asset}</h3>
                <span className={cn("shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[8px] font-bold", a.bg, a.text)}>
                  {o.action}
                </span>
              </div>
              <p className="font-mono text-[8px] uppercase tracking-wider text-text-muted">
                {o.horizon}
                {o.confidence ? ` · CONF ${o.confidence}` : ""}
              </p>
              <p className="mt-1 font-body text-[10px] leading-relaxed text-text-secondary">{o.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PredictionsTable({ ed }: { ed: Edition }) {
  return (
    <div className="panel p-4">
      <SectionTitle n="07" title="Predictions" sub="Probability matrix" />
      <div className="space-y-px">
        <div className="grid grid-cols-12 gap-2 px-2 pb-1">
          <span className="col-span-2 stat-label">Horizon</span>
          <span className="col-span-2 stat-label">Event</span>
          <span className="col-span-5 stat-label">Prediction</span>
          <span className="col-span-2 stat-label">Conf</span>
          <span className="col-span-1 stat-label">Status</span>
        </div>
        {ed.predictions.map((p, i) => (
          <div key={i} className="grid grid-cols-12 items-center gap-2 rounded-sm bg-bg-elev/40 px-2 py-1.5">
            <span className="col-span-2 font-mono text-[9px] tracking-wider text-signal">{p.horizon}</span>
            <span className="col-span-2 font-mono text-[10px] text-text-primary">{p.event}</span>
            <span className="col-span-5 font-body text-[10px] text-text-secondary">{p.prediction}</span>
            <span className="col-span-2 font-mono text-[9px] font-bold text-text-secondary">{p.confidence}</span>
            <span className={cn("col-span-1 font-mono text-[8px] font-bold", statusClass(p.status))}>{p.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalystNote({ ed }: { ed: Edition }) {
  if (!ed.analystNote) return null;
  return (
    <div className="panel hud-frame border-signal/30 p-4">
      <p className="panel-title mb-2">⟁ Analyst — Final Assessment · {ed.dateLabel}</p>
      <p className="font-body text-[11px] leading-relaxed text-text-secondary">{ed.analystNote}</p>
      <p className="mt-3 border-t border-border-subtle pt-2 font-mono text-[8px] uppercase tracking-wider text-text-muted">
        Sources: {ed.sources.join(" · ")} · Private use only · Not investment advice
      </p>
    </div>
  );
}
