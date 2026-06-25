"use client";

import { AlertTriangle, Plane, RadioTower } from "lucide-react";
import { useFlights } from "@/lib/hooks/useFeeds";
import { useUIStore } from "@/lib/store/uiStore";
import { compact, timeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { FeedMeta, Flight } from "@/lib/types";

function statusTone(status: FeedMeta["status"]): string {
  switch (status) {
    case "live":
      return "text-ok";
    case "cached":
      return "text-signal";
    case "rate-limited":
      return "text-warn";
    case "stale":
    case "offline":
      return "text-alert";
    default:
      return "text-text-tertiary";
  }
}

function statusLabel(meta?: FeedMeta): string {
  if (!meta?.status) return "ACQUIRING";
  if (meta.status === "rate-limited" && meta.retryAfterSeconds) {
    const minutes = Math.ceil(meta.retryAfterSeconds / 60);
    return `LIMIT ${minutes}M`;
  }
  return meta.status.replace("-", " ").toUpperCase();
}

function flightLines(f: Flight): string[] {
  const lines = [
    `ICAO24   ${f.id.toUpperCase()}`,
    `ORIGIN   ${f.origin}`,
    `SRC      ${f.positionSource ?? "UNKNOWN"}`,
    `CLASS    ${f.category ?? "AIRCRAFT"}`,
    `ALT      ${Math.round(f.alt)} m`,
    `SPD      ${Math.round(f.velocity * 3.6)} km/h`,
    `HDG      ${Math.round(f.heading)} deg`,
  ];
  if (f.verticalRate != null) lines.push(`V/S      ${Math.round(f.verticalRate)} m/s`);
  if (f.squawk) lines.push(`SQUAWK   ${f.squawk}`);
  if (f.lastContact) lines.push(`CONTACT  ${timeAgo(f.lastContact)}`);
  return lines;
}

export default function AirTrafficPanel() {
  const { layers, setSelection } = useUIStore();
  const { data, isLoading } = useFlights(layers.flights);
  const flights = data?.data ?? [];
  const meta = data?.meta;
  const airborne = flights.filter((f) => !f.onGround).length;
  const emergency = flights.filter((f) => f.emergency).length;
  const stale = flights.filter((f) => f.stale).length;
  const fastest = [...flights]
    .filter((f) => !f.onGround)
    .sort((a, b) => b.velocity - a.velocity)
    .slice(0, 6);

  return (
    <div className="panel hud-frame flex max-h-[238px] flex-col p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="panel-title">Air Traffic · OpenSky</span>
        <span className={cn("font-mono text-[9px] font-bold", statusTone(meta?.status))}>
          {isLoading ? "ACQUIRING" : statusLabel(meta)}
        </span>
      </div>

      <div className="mb-2 grid grid-cols-3 gap-1">
        <div className="glass-tile px-1.5 py-1">
          <p className="stat-label">Tracked</p>
          <p className="font-mono text-[12px] font-bold tabular text-text-primary">
            {compact(meta?.count ?? 0)}
          </p>
        </div>
        <div className="glass-tile px-1.5 py-1">
          <p className="stat-label">Airborne</p>
          <p className="font-mono text-[12px] font-bold tabular text-signal">
            {compact(airborne)}
          </p>
        </div>
        <div className="glass-tile px-1.5 py-1">
          <p className="stat-label">Alerts</p>
          <p className={cn("font-mono text-[12px] font-bold tabular", emergency ? "text-alert" : "text-ok")}>
            {emergency}
          </p>
        </div>
      </div>

      {meta?.message && (
        <div className="mb-2 flex items-start gap-1.5 glass-tile px-2 py-1.5">
          {meta.status === "rate-limited" ? (
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-warn" />
          ) : (
            <RadioTower className="mt-0.5 h-3 w-3 shrink-0 text-signal" />
          )}
          <p className="line-clamp-2 font-mono text-[8px] leading-relaxed text-text-tertiary">
            {meta.message}
          </p>
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
        {fastest.map((f) => (
          <button
            key={f.id}
            onClick={() =>
              setSelection({
                kind: "flights",
                id: f.id,
                title: f.callsign,
                lines: flightLines(f),
                lat: f.lat,
                lng: f.lng,
              })
            }
            className="flex w-full items-center gap-2 rounded-sm px-1.5 py-1 text-left transition hover:bg-bg-hover"
          >
            <Plane className={cn("h-3 w-3 shrink-0", f.emergency ? "text-alert" : "text-signal")} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-mono text-[10px] text-text-secondary">
                {f.callsign}
              </span>
              <span className="block truncate font-mono text-[8px] text-text-tertiary">
                {f.origin} · {f.category ?? "AIRCRAFT"}
              </span>
            </span>
            <span className="shrink-0 text-right font-mono text-[9px] tabular text-text-primary">
              {Math.round(f.velocity * 3.6)}
              <span className="text-text-muted"> km/h</span>
            </span>
          </button>
        ))}
        {fastest.length === 0 && (
          <p className="py-3 text-center font-mono text-[10px] text-text-tertiary">
            {stale ? "Cached tracks are stale." : "Awaiting OpenSky tracks..."}
          </p>
        )}
      </div>
    </div>
  );
}
