"use client";

import { useMemo } from "react";
import { useQuakes, useFlights, useEvents, useMarkets } from "@/lib/hooks/useFeeds";
import type { ThreatLevel, Tone } from "./types";
import type { Quake } from "@/lib/types";

export interface LiveDevelopment {
  id: string;
  title: string;
  source: string;
  link: string;
  published: number;
  tag: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export interface LiveTicker {
  label: string;
  value: string;
  sub: string;
  tone: Tone;
}

export interface LiveBrief {
  generatedAt: number;
  dateLabel: string;
  threatLevel: ThreatLevel;
  threatReason: string;
  tickers: LiveTicker[];
  stats: { aircraft: number; seismic24h: number; maxMag: number; osint: number };
  developments: LiveDevelopment[];
  topQuakes: Quake[];
  regions: { region: string; count: number }[];
  live: boolean;
  sources: string[];
}

const CONFLICT = /\b(war|strike|missile|attack|invad|nuclear|conflict|killed|clash|troops|airstrike|militant|offensive|ceasefire|hostage|coup|siege)\b/i;
const DISASTER = /\b(earthquake|quake|flood|wildfire|hurricane|cyclone|typhoon|eruption|tsunami|storm|evacuat|magnitude)\b/i;
const MARKETS = /\b(market|stocks?|inflation|fed|rate|oil|crude|gold|crypto|bitcoin|recession|tariff|economy|gdp|currency)\b/i;
const TECH = /\b(ai|chip|semiconductor|cyber|hack|data breach|satellite|launch|spacex|nvidia|openai)\b/i;

function classify(title: string): { tag: string; severity: LiveDevelopment["severity"] } {
  if (CONFLICT.test(title)) return { tag: "CONFLICT", severity: "CRITICAL" };
  if (DISASTER.test(title)) return { tag: "DISASTER", severity: "HIGH" };
  if (MARKETS.test(title)) return { tag: "MARKETS", severity: "MEDIUM" };
  if (TECH.test(title)) return { tag: "TECH", severity: "LOW" };
  return { tag: "WORLD", severity: "LOW" };
}

function fmtDateUTC(d: Date): string {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${String(d.getUTCDate()).padStart(2, "0")} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function tickerTone(change: number): Tone {
  if (change > 0.2) return "up";
  if (change < -0.2) return "down";
  return "flat";
}

export function useLiveBrief(): LiveBrief {
  const quakes = useQuakes(true);
  const flights = useFlights(true);
  const events = useEvents();
  const markets = useMarkets();

  return useMemo(() => {
    const qs = quakes.data?.data ?? [];
    const fs = flights.data?.data ?? [];
    const ns = events.data?.data ?? [];
    const ms = markets.data?.data ?? [];

    const maxMag = qs.reduce((m, q) => Math.max(m, q.mag), 0);
    const bigQuakes = qs.filter((q) => q.mag >= 6).length;
    const majorQuakes = qs.filter((q) => q.mag >= 5).length;

    const developments: LiveDevelopment[] = ns.slice(0, 40).map((n) => {
      const c = classify(n.title);
      return { id: n.id, title: n.title, source: n.source, link: n.link, published: n.published, ...c };
    });
    const conflictHits = developments.filter((d) => d.tag === "CONFLICT").length;

    // Threat score from real-time signals.
    const score = bigQuakes * 3 + conflictHits + (maxMag >= 7 ? 5 : 0) + (majorQuakes >= 3 ? 2 : 0);
    let threatLevel: ThreatLevel = "LOW";
    if (score >= 12) threatLevel = "SEVERE";
    else if (score >= 8) threatLevel = "HIGH";
    else if (score >= 5) threatLevel = "ELEVATED";
    else if (score >= 2) threatLevel = "WATCH";

    const drivers: string[] = [];
    if (conflictHits) drivers.push(`${conflictHits} conflict signals in OSINT wire`);
    if (bigQuakes) drivers.push(`${bigQuakes} major seismic events (M6+)`);
    else if (majorQuakes) drivers.push(`${majorQuakes} significant quakes (M5+)`);
    if (maxMag >= 5) drivers.push(`peak magnitude M${maxMag.toFixed(1)}`);
    const threatReason = drivers.length ? drivers.join(" · ") : "Nominal global signal across all feeds.";

    const tickers: LiveTicker[] = ms.map((m) => ({
      label: m.label,
      value:
        m.value >= 1000
          ? `$${Math.round(m.value).toLocaleString()}`
          : `$${m.value.toFixed(2)}`,
      sub: `${m.change >= 0 ? "+" : ""}${m.change.toFixed(1)}% 24H`,
      tone: tickerTone(m.change),
    }));
    tickers.push({ label: "AIRCRAFT", value: fs.length.toLocaleString(), sub: "tracked now", tone: "flat" });
    tickers.push({ label: "SEISMIC", value: `${qs.length}`, sub: "events 24H", tone: qs.length ? "warn" : "flat" });

    const regionBuckets = { Americas: 0, "Europe/Africa": 0, "Asia/Pacific": 0 } as Record<string, number>;
    for (const f of fs) {
      if (f.lng < -30) regionBuckets["Americas"]++;
      else if (f.lng < 60) regionBuckets["Europe/Africa"]++;
      else regionBuckets["Asia/Pacific"]++;
    }
    const regions = Object.entries(regionBuckets)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);

    const topQuakes = [...qs].filter((q) => q.mag >= 4.5).sort((a, b) => b.mag - a.mag).slice(0, 8);

    const live = !!(
      flights.data?.meta.live ||
      quakes.data?.meta.live ||
      events.data?.meta.live ||
      markets.data?.meta.live
    );

    return {
      generatedAt: Date.now(),
      dateLabel: fmtDateUTC(new Date()),
      threatLevel,
      threatReason,
      tickers,
      stats: { aircraft: fs.length, seismic24h: qs.length, maxMag, osint: ns.length },
      developments,
      topQuakes,
      regions,
      live,
      sources: ["OpenSky", "USGS", "CoinGecko", "wheretheiss", "BBC", "Al Jazeera", "CNN", "NPR"],
    };
  }, [quakes.data, flights.data, events.data, markets.data]);
}
