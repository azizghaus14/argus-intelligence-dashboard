// Structured model for archived Dark Signal intelligence briefings.

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type ThreatLevel =
  | "LOW"
  | "WATCH"
  | "ELEVATED"
  | "HIGH"
  | "SEVERE"
  | "CRITICAL";
export type Tone = "up" | "down" | "flat" | "warn" | "alert";
export type Action = "BUY" | "STRONG BUY" | "TACTICAL BUY" | "WATCH" | "AVOID" | "HOLD";

export interface Ticker {
  label: string;
  value: string;
  sub?: string;
  tone: Tone;
}

export interface SummaryItem {
  rank?: number;
  title: string;
  body: string;
  severity: Severity;
  tags?: string[];
  confidence?: string;
}

export interface Flashpoint {
  id: string;
  title: string;
  status: string; // e.g. ESCALATING, ACTIVE, WATCH
  body: string;
  severity: Severity;
  lat: number;
  lng: number;
  region: string;
}

export interface MarketRow {
  asset: string;
  price: string;
  change: string;
  tone: Tone;
  signal: string;
  keyLevel?: string;
}

export interface CentralBank {
  name: string;
  stance: string; // HOLD, RAISED, HOLD/WATCH, FISCAL FIRST
  rate: string;
  note: string;
  tone: Tone;
}

export interface RegionDesk {
  country: string;
  flag: string;
  tag?: string; // HOME BASE / CURRENT LOCATION
  metrics: { label: string; value: string; sub?: string; tone?: Tone }[];
  analysis: string[];
}

export interface WeakSignal {
  title: string;
  risk: Severity;
  body: string;
}

export interface Opportunity {
  asset: string;
  action: Action;
  horizon: string;
  body: string;
  confidence?: string;
}

export interface Prediction {
  horizon: string;
  event: string;
  prediction: string;
  confidence: string; // HIGH / MEDIUM / LOW
  status?: string; // PRIMED / ACTIVE / BULLISH / BEARISH / WATCH
}

export interface Edition {
  id: string; // "2026-04-29"
  editionNo: string; // "022"
  date: string; // ISO
  dateLabel: string; // "29 APR 2026"
  subtitle: string; // "Post-Speech Reckoning" / "Day 7 of War"
  operation?: string;
  threatLevel: ThreatLevel;
  location: string;
  headline: string;
  tickers: Ticker[];
  summary: SummaryItem[];
  geopolitics: Flashpoint[];
  markets: MarketRow[];
  centralBanks: CentralBank[];
  regional: RegionDesk[];
  weakSignals: WeakSignal[];
  opportunities: Opportunity[];
  predictions: Prediction[];
  analystNote?: string;
  sources: string[];
}
