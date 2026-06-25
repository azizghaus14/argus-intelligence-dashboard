"use client";

import { useState } from "react";
import { EDITIONS } from "@/lib/briefings/data";
import { threatFill } from "@/lib/briefings/style";
import { cn } from "@/lib/utils/cn";
import LiveBriefView from "./LiveBriefView";
import {
  ThreatBar,
  TickerStrip,
  ExecSummary,
  GeopoliticsPanel,
  MarketsTable,
  RegionalDesks,
  WeakSignals,
  OpportunityMatrix,
  PredictionsTable,
  AnalystNote,
} from "./Sections";

const LIVE_ID = "__live__";

export default function BriefingView() {
  const [activeId, setActiveId] = useState(LIVE_ID);
  const isLive = activeId === LIVE_ID;
  const ed = EDITIONS.find((e) => e.id === activeId) ?? EDITIONS[0];

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="scanlines pointer-events-none fixed inset-0 z-50 opacity-40" />
      <div className="mx-auto grid max-w-[1500px] gap-3 p-3 lg:grid-cols-[200px_1fr]">
        {/* Archive rail */}
        <aside className="lg:sticky lg:top-3 lg:h-fit">
          <div className="panel hud-frame p-3">
            <p className="panel-title mb-2">Editions</p>
            <div className="flex flex-col gap-1.5">
              {/* LIVE — generated from current feeds */}
              <button
                onClick={() => setActiveId(LIVE_ID)}
                className={cn(
                  "rounded-sm border px-2 py-1.5 text-left transition",
                  isLive ? "border-ok/50 bg-ok/10" : "border-border-subtle hover:bg-bg-hover"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-ok">
                    <span className="live-dot text-ok" /> LIVE // TODAY
                  </span>
                </div>
                <p className="font-mono text-[8px] uppercase tracking-wider text-text-tertiary">
                  AUTO-GENERATED · REALTIME
                </p>
                <p className="mt-0.5 truncate font-body text-[9px] text-text-muted">
                  Current-day signal intelligence
                </p>
              </button>

              <p className="mt-1 font-mono text-[8px] uppercase tracking-wider text-text-muted">Archive</p>

              {EDITIONS.map((e) => {
                const active = e.id === activeId;
                return (
                  <button
                    key={e.id}
                    onClick={() => setActiveId(e.id)}
                    className={cn(
                      "rounded-sm border px-2 py-1.5 text-left transition",
                      active
                        ? "border-signal/50 bg-signal/10"
                        : "border-border-subtle hover:bg-bg-hover"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold tabular text-text-primary">
                        {e.dateLabel}
                      </span>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          threatFill(e.threatLevel).split(" ")[0]
                        )}
                      />
                    </div>
                    <p className="font-mono text-[8px] uppercase tracking-wider text-text-tertiary">
                      ED {e.editionNo} · {e.threatLevel}
                    </p>
                    <p className="mt-0.5 truncate font-body text-[9px] text-text-muted">
                      {e.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 border-t border-border-subtle pt-2 font-mono text-[8px] leading-relaxed text-text-muted">
              {EDITIONS.length} EDITIONS ARCHIVED
              <br />
              CLASSIFICATION: PRIVATE
            </p>
          </div>
        </aside>

        {/* Brief body */}
        {isLive ? (
          <LiveBriefView key="live" />
        ) : (
          <main className="min-w-0 space-y-3 animate-fade-in" key={ed.id}>
            <ThreatBar ed={ed} />
            <TickerStrip ed={ed} />
            <ExecSummary ed={ed} />
            <GeopoliticsPanel ed={ed} />
            <MarketsTable ed={ed} />
            <RegionalDesks ed={ed} />
            <div className="grid gap-3 xl:grid-cols-2">
              <WeakSignals ed={ed} />
              <OpportunityMatrix ed={ed} />
            </div>
            <PredictionsTable ed={ed} />
            <AnalystNote ed={ed} />
          </main>
        )}
      </div>
    </div>
  );
}
