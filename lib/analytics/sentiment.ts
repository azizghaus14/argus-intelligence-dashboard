// Lexicon-based news sentiment for the crypto forecast.
//
// A transparent finance lexicon scores each headline; the aggregate is
// recency-weighted (exponential decay) and squashed to [-1, 1]. This is the
// engineered "news" feature that nudges the price drift in forecast.ts.

export interface ScoredHeadline {
  title: string;
  source: string;
  published: number;
  score: number; // signed lexicon score for this headline
}

export interface SentimentResult {
  index: number; // -1 (very bearish) .. +1 (very bullish)
  label: "Bullish" | "Bearish" | "Neutral";
  sampleSize: number; // headlines that carried signal
  topBull?: ScoredHeadline;
  topBear?: ScoredHeadline;
  drivers: string[];
}

// term -> weight. Magnitude 2 = strong, 1 = moderate.
const LEXICON: Record<string, number> = {
  // bullish
  rally: 2, surge: 2, soar: 2, soars: 2, jumps: 1, gain: 1, gains: 1, bull: 2, bullish: 2,
  breakout: 2, "all-time high": 2, ath: 2, "record high": 2, adoption: 2, approval: 2,
  approve: 2, approved: 2, etf: 1, inflow: 2, inflows: 2, accumulate: 1, partnership: 1,
  upgrade: 1, halving: 1, institutional: 1, support: 1, recovery: 2, rebound: 2, optimism: 1,
  greenlight: 2, integrate: 1, mainstream: 1, pump: 1, "buy the dip": 1, soaring: 2, rallies: 2,
  // bearish
  crash: -2, plunge: -2, plunges: -2, plummet: -2, slump: -2, dump: -2, bear: -2, bearish: -2,
  selloff: -2, "sell-off": -2, liquidation: -2, liquidations: -2, hack: -2, hacked: -2,
  exploit: -2, breach: -2, ban: -2, banned: -2, crackdown: -2, lawsuit: -2, fraud: -2,
  scam: -2, ponzi: -2, collapse: -2, bankrupt: -2, bankruptcy: -2, insolvency: -2,
  outflow: -2, outflows: -2, fear: -1, fud: -1, regulation: -1, regulatory: -1, restrict: -1,
  halt: -1, delist: -2, warning: -1, probe: -1, investigation: -1, fine: -1, sanction: -2,
  sanctions: -2, tariff: -1, slumps: -2, tumble: -2, tumbles: -2, sinks: -2, drop: -1, drops: -1,
};

// Pre-split multiword keys for phrase matching.
const PHRASES = Object.keys(LEXICON).filter((k) => k.includes(" ") || k.includes("-"));
const WORDS = Object.keys(LEXICON).filter((k) => !PHRASES.includes(k));
const WORDSET = new Set(WORDS);

export function scoreHeadline(title: string): number {
  const t = ` ${title.toLowerCase()} `;
  let score = 0;
  for (const p of PHRASES) if (t.includes(p)) score += LEXICON[p];
  for (const tok of t.split(/[^a-z0-9]+/)) {
    if (WORDSET.has(tok)) score += LEXICON[tok];
  }
  return score;
}

const HALF_LIFE_MS = 12 * 3.6e6; // 12h recency half-life
const MAX_AGE_MS = 48 * 3.6e6; // ignore headlines older than 48h

export function analyzeSentiment(
  news: { title: string; source: string; published: number }[]
): SentimentResult {
  const now = Date.now();
  const scored: ScoredHeadline[] = [];
  let weightedSum = 0;
  let weightTotal = 0;

  for (const n of news) {
    const age = now - n.published;
    if (age > MAX_AGE_MS || age < -3.6e6) continue;
    const s = scoreHeadline(n.title);
    if (s === 0) continue;
    const w = Math.pow(0.5, age / HALF_LIFE_MS); // recency weight
    weightedSum += s * w;
    weightTotal += w;
    scored.push({ title: n.title, source: n.source, published: n.published, score: s });
  }

  // Normalize: average weighted score, squashed with tanh.
  const avg = weightTotal > 0 ? weightedSum / weightTotal : 0;
  const index = Math.tanh(avg / 2.2);
  const label: SentimentResult["label"] = index > 0.12 ? "Bullish" : index < -0.12 ? "Bearish" : "Neutral";

  const sortedBull = [...scored].sort((a, b) => b.score - a.score);
  const sortedBear = [...scored].sort((a, b) => a.score - b.score);
  const topBull = sortedBull[0]?.score > 0 ? sortedBull[0] : undefined;
  const topBear = sortedBear[0]?.score < 0 ? sortedBear[0] : undefined;

  const drivers: string[] = [];
  const bulls = scored.filter((s) => s.score > 0).length;
  const bears = scored.filter((s) => s.score < 0).length;
  if (bulls) drivers.push(`${bulls} bullish signal${bulls > 1 ? "s" : ""}`);
  if (bears) drivers.push(`${bears} bearish signal${bears > 1 ? "s" : ""}`);

  return { index, label, sampleSize: scored.length, topBull, topBear, drivers };
}
