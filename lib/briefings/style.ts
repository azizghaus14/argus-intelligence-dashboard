import type { Severity, Tone, Action, ThreatLevel } from "./types";

export function toneClass(t: Tone): string {
  switch (t) {
    case "up":
      return "text-ok";
    case "down":
      return "text-alert";
    case "warn":
      return "text-warn";
    case "alert":
      return "text-alert";
    default:
      return "text-text-secondary";
  }
}

export function severityClass(s: Severity): { text: string; bg: string; border: string } {
  switch (s) {
    case "CRITICAL":
      return { text: "text-alert", bg: "bg-alert/15", border: "border-alert/40" };
    case "HIGH":
      return { text: "text-quake", bg: "bg-quake/15", border: "border-quake/40" };
    case "MEDIUM":
      return { text: "text-warn", bg: "bg-warn/10", border: "border-warn/30" };
    default:
      return { text: "text-signal", bg: "bg-signal/10", border: "border-signal/30" };
  }
}

export function actionClass(a: Action): { text: string; bg: string } {
  if (a === "AVOID") return { text: "text-alert", bg: "bg-alert/15" };
  if (a === "WATCH") return { text: "text-warn", bg: "bg-warn/10" };
  if (a === "HOLD") return { text: "text-signal", bg: "bg-signal/10" };
  return { text: "text-ok", bg: "bg-ok/15" }; // all BUY variants
}

export function statusClass(s?: string): string {
  switch (s) {
    case "ACTIVE":
    case "BULLISH":
    case "PRIMED":
      return "text-ok";
    case "BEARISH":
      return "text-alert";
    case "WATCH":
      return "text-warn";
    default:
      return "text-text-tertiary";
  }
}

export const THREAT_LEVELS: ThreatLevel[] = ["LOW", "WATCH", "ELEVATED", "HIGH", "SEVERE", "CRITICAL"];

export function threatFill(level: ThreatLevel): string {
  switch (level) {
    case "LOW":
      return "bg-ok text-bg-base";
    case "WATCH":
      return "bg-signal text-bg-base";
    case "ELEVATED":
      return "bg-warn text-bg-base";
    case "HIGH":
      return "bg-quake text-bg-base";
    default:
      return "bg-alert text-white"; // SEVERE / CRITICAL
  }
}
