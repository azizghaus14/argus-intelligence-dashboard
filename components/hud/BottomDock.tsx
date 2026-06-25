"use client";

import { useMemo } from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Plane, Radio } from "lucide-react";
import { useAnomalies } from "@/lib/analytics/useAnomalies";
import { useForecast } from "@/lib/analytics/useForecast";
import { useFlights, useQuakes, useEvents } from "@/lib/hooks/useFeeds";
import { useUIStore } from "@/lib/store/uiStore";
import { SEVERITY_META, type Anomaly } from "@/lib/analytics/anomaly";
import ForecastChart from "./ForecastChart";
import type { Flight } from "@/lib/types";
import { compact, timeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

function fmtPrice(v: number): string {
  if (v >= 1000) return `$${Math.round(v).toLocaleString()}`;
  return `$${v.toFixed(2)}`;
}

/* Uniform dock module — identical header + scroll body, equal width. */
function Module({
  title,
  icon,
  meta,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="panel flex h-full shrink-0 snap-start flex-col min-w-[82vw] sm:min-w-[46vw] md:min-w-[38vw] lg:min-w-0 lg:flex-1">
      <div className="flex items-center justify-between border-b border-white/[0.05] px-3 py-2">
        <span className="flex min-w-0 items-center gap-1.5 panel-title">
          {icon}
          <span className="truncate">{title}</span>
        </span>
        {meta && <span className="ml-2 shrink-0 font-mono text-[8px] text-text-tertiary">{meta}</span>}
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">{children}</div>
    </div>
  );
}

function AnomalyRow({ a }: { a: Anomaly }) {
  const setSelection = useUIStore((s) => s.setSelection);
  const requestFlyTo = useUIStore((s) => s.requestFlyTo);
  const m = SEVERITY_META[a.severity];
  return (
    <button
      onClick={() => {
        setSelection({
          kind: "flights",
          id: a.flightId,
          title: a.callsign,
          lines: [`ANOMALY  ${a.category}`, `SCORE  ${a.score}/100`, a.reason],
          lat: a.lat,
          lng: a.lng,
        });
        requestFlyTo(a.lat, a.lng, a.callsign);
      }}
      className="flex w-full items-stretch gap-2 rounded-md bg-white/[0.03] px-2 py-1.5 text-left transition hover:bg-white/[0.07]"
    >
      <span className="w-[3px] shrink-0 rounded-full" style={{ backgroundColor: m.color }} />
      <span className="flex w-8 shrink-0 flex-col items-center justify-center rounded" style={{ backgroundColor: m.bg }}>
        <span className="font-mono text-[12px] font-bold leading-none tabular" style={{ color: m.color }}>
          {a.score}
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] font-semibold text-text-primary">{a.callsign}</span>
          <span className="truncate font-mono text-[8px] uppercase tracking-wider" style={{ color: m.color }}>
            {a.category}
          </span>
        </div>
        <p className="truncate font-mono text-[9px] text-text-secondary">{a.reason}</p>
      </div>
    </button>
  );
}

function FlightRow({ f }: { f: Flight }) {
  const setSelection = useUIStore((s) => s.setSelection);
  const requestFlyTo = useUIStore((s) => s.requestFlyTo);
  return (
    <button
      onClick={() => {
        setSelection({
          kind: "flights",
          id: f.id,
          title: f.callsign,
          lines: [
            `ICAO24  ${f.id.toUpperCase()}`,
            `ORIGIN  ${f.origin}`,
            `ALT  ${Math.round(f.alt)} m`,
            `SPD  ${Math.round(f.velocity * 3.6)} km/h`,
          ],
          lat: f.lat,
          lng: f.lng,
        });
        requestFlyTo(f.lat, f.lng, f.callsign);
      }}
      className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition hover:bg-white/[0.06]"
    >
      <Plane className="h-3 w-3 shrink-0 text-signal" />
      <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-text-secondary">{f.callsign}</span>
      <span className="shrink-0 font-mono text-[9px] tabular text-text-primary">
        {Math.round(f.velocity * 3.6)}
        <span className="text-text-muted"> km/h</span>
      </span>
    </button>
  );
}

export default function BottomDock() {
  const { anomalies, summary } = useAnomalies();
  const fc = useForecast();
  const sent = fc.sentiment;
  const sentColor = sent.index > 0.12 ? "#4ED7A8" : sent.index < -0.12 ? "#F2607A" : "#9AA7B8";

  const flightsQ = useFlights(true);
  const flights = flightsQ.data?.data ?? [];
  const airborne = flights.filter((f) => !f.onGround).length;
  const fastest = useMemo(
    () => [...flights].filter((f) => !f.onGround).sort((a, b) => b.velocity - a.velocity).slice(0, 8),
    [flights]
  );

  const quakesQ = useQuakes(true);
  const quakes = (quakesQ.data?.data ?? []).slice(0, 10);
  const setSelection = useUIStore((s) => s.setSelection);

  const eventsQ = useEvents();
  const news = (eventsQ.data?.data ?? []).slice(0, 10);

  return (
    <div className="hud-scroll-x flex h-full snap-x snap-mandatory gap-3 overflow-x-auto pb-1 lg:snap-none lg:overflow-x-visible">
      {/* Threat anomalies */}
      <Module
        title="Threat Anomalies"
        icon={<AlertTriangle className="h-3 w-3 text-warn" />}
        meta={`${summary.total} flagged · ${summary.critical} crit`}
      >
        {anomalies.slice(0, 30).map((a) => (
          <AnomalyRow key={a.id} a={a} />
        ))}
        {anomalies.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <span className="font-mono text-[11px] text-text-secondary">All clear</span>
            <span className="font-mono text-[8px] text-text-muted">No anomalies in frame.</span>
          </div>
        )}
      </Module>

      {/* Crypto forecast */}
      <Module
        title="Crypto Forecast"
        icon={<Activity className="h-3 w-3 text-signal" />}
        meta={
          <span className="font-bold" style={{ color: sentColor }}>
            {sent.label.toUpperCase()} {sent.index >= 0 ? "+" : ""}
            {sent.index.toFixed(2)}
          </span>
        }
      >
        {fc.assets.map((a) => {
          const up = a.expectedChangePct >= 0;
          return (
            <div key={a.label} className="glass-tile p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-[13px] font-bold text-text-primary">{a.label}</span>
                  <span className="font-mono text-[9px] text-text-secondary">{fmtPrice(a.spot)}</span>
                </div>
                <span className={cn("flex items-center gap-0.5 font-mono text-[11px] font-bold tabular", up ? "text-ok" : "text-alert")}>
                  {up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  {up ? "+" : ""}
                  {a.expectedChangePct.toFixed(2)}%
                </span>
              </div>
              <div className="mt-1">
                <ForecastChart a={a} />
              </div>
              <p className="mt-1 truncate font-mono text-[8px] text-text-tertiary">{a.drivers.join("  ·  ")}</p>
            </div>
          );
        })}
        {fc.assets.length === 0 && (
          <p className="py-4 text-center font-mono text-[9px] text-text-tertiary">
            {fc.loading ? "Loading price history…" : "Forecast unavailable."}
          </p>
        )}
      </Module>

      {/* Air traffic */}
      <Module
        title="Air Traffic"
        icon={<Plane className="h-3 w-3 text-signal" />}
        meta={`${compact(flightsQ.data?.meta.count ?? 0)} tracked`}
      >
        <div className="mb-1 grid grid-cols-3 gap-1">
          <div className="glass-tile px-1.5 py-1 text-center">
            <p className="stat-label">Air</p>
            <p className="font-mono text-[12px] font-bold tabular text-signal">{compact(airborne)}</p>
          </div>
          <div className="glass-tile px-1.5 py-1 text-center">
            <p className="stat-label">Anom</p>
            <p className="font-mono text-[12px] font-bold tabular text-warn">{summary.total}</p>
          </div>
          <div className="glass-tile px-1.5 py-1 text-center">
            <p className="stat-label">Crit</p>
            <p className={cn("font-mono text-[12px] font-bold tabular", summary.critical ? "text-alert" : "text-ok")}>
              {summary.critical}
            </p>
          </div>
        </div>
        {fastest.map((f) => (
          <FlightRow key={f.id} f={f} />
        ))}
      </Module>

      {/* Seismic */}
      <Module
        title="Seismic · 24h"
        icon={<Activity className="h-3 w-3 text-quake" />}
        meta={`${quakesQ.data?.meta.count ?? 0} evt`}
      >
        {quakes.map((q) => (
          <button
            key={q.id}
            onClick={() =>
              setSelection({
                kind: "quakes",
                id: q.id,
                title: `M${q.mag.toFixed(1)} EVENT`,
                lines: [`LOC ${q.place}`, `MAG ${q.mag.toFixed(1)}`, `DEPTH ${q.depth.toFixed(0)} km`, `TIME ${timeAgo(q.time)}`],
                lat: q.lat,
                lng: q.lng,
              })
            }
            className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition hover:bg-white/[0.06]"
          >
            <span
              className={cn(
                "w-8 shrink-0 rounded px-1 py-0.5 text-center font-mono text-[10px] font-bold tabular",
                q.mag >= 5 ? "bg-alert/20 text-alert" : q.mag >= 3 ? "bg-quake/20 text-quake" : "bg-warn/15 text-warn"
              )}
            >
              {q.mag.toFixed(1)}
            </span>
            <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-text-secondary">{q.place}</span>
            <span className="shrink-0 font-mono text-[8px] tabular text-text-tertiary">{timeAgo(q.time)}</span>
          </button>
        ))}
        {quakes.length === 0 && <p className="py-4 text-center font-mono text-[9px] text-text-tertiary">Awaiting feed…</p>}
      </Module>

      {/* OSINT wire */}
      <Module
        title="OSINT Wire"
        icon={<Radio className="h-3 w-3 text-warn" />}
        meta={`${news.length} signals`}
      >
        {news.map((n) => (
          <a
            key={n.id}
            href={n.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md px-1.5 py-1 transition hover:bg-white/[0.06]"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[8px] text-signal">{n.source}</span>
              <span className="ml-auto font-mono text-[7px] text-text-muted">{timeAgo(n.published)}</span>
            </div>
            <p className="line-clamp-2 font-body text-[10px] leading-snug text-text-secondary">{n.title}</p>
          </a>
        ))}
        {news.length === 0 && <p className="py-4 text-center font-mono text-[9px] text-text-tertiary">Acquiring feeds…</p>}
      </Module>
    </div>
  );
}
