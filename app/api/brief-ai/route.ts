import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { fetchWithTimeout } from "@/lib/server/fetchJson";
import { XMLParser } from "fast-xml-parser";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

/* ── Brief shape (also the structured-output schema) ── */
export interface AiBrief {
  generatedAt: number;
  dateLabel: string;
  headline: string;
  overview: string;
  threatLevel: "LOW" | "WATCH" | "ELEVATED" | "HIGH" | "SEVERE" | "CRITICAL";
  executiveSummary: { severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"; title: string; analysis: string }[];
  marketAnalysis: { asset: string; signal: "BULLISH" | "BEARISH" | "NEUTRAL" | "VOLATILE"; view: string }[];
  businessSignals: { source: string; signal: string }[];
  thingsToWatch: { title: string; detail: string; horizon: string }[];
  opportunities: { asset: string; action: "BUY" | "ACCUMULATE" | "WATCH" | "HOLD" | "AVOID"; rationale: string }[];
  predictions: { statement: string; probability: number }[];
}

export interface AiBriefResponse {
  available: boolean;
  brief: AiBrief | null;
  meta: { model: string; cached: boolean; reason?: string };
}

const BRIEF_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    headline: { type: "string" },
    overview: { type: "string" },
    threatLevel: { type: "string", enum: ["LOW", "WATCH", "ELEVATED", "HIGH", "SEVERE", "CRITICAL"] },
    executiveSummary: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          severity: { type: "string", enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] },
          title: { type: "string" },
          analysis: { type: "string" },
        },
        required: ["severity", "title", "analysis"],
      },
    },
    marketAnalysis: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          asset: { type: "string" },
          signal: { type: "string", enum: ["BULLISH", "BEARISH", "NEUTRAL", "VOLATILE"] },
          view: { type: "string" },
        },
        required: ["asset", "signal", "view"],
      },
    },
    businessSignals: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: { source: { type: "string" }, signal: { type: "string" } },
        required: ["source", "signal"],
      },
    },
    thingsToWatch: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: { title: { type: "string" }, detail: { type: "string" }, horizon: { type: "string" } },
        required: ["title", "detail", "horizon"],
      },
    },
    opportunities: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          asset: { type: "string" },
          action: { type: "string", enum: ["BUY", "ACCUMULATE", "WATCH", "HOLD", "AVOID"] },
          rationale: { type: "string" },
        },
        required: ["asset", "action", "rationale"],
      },
    },
    predictions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: { statement: { type: "string" }, probability: { type: "integer" } },
        required: ["statement", "probability"],
      },
    },
  },
  required: [
    "headline",
    "overview",
    "threatLevel",
    "executiveSummary",
    "marketAnalysis",
    "businessSignals",
    "thingsToWatch",
    "opportunities",
    "predictions",
  ],
} as const;

/* ── Gather today's live signals (server-side) ── */
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

const WORLD = [
  "https://feeds.bbci.co.uk/news/world/rss.xml",
  "https://www.aljazeera.com/xml/rss/all.xml",
  "https://feeds.npr.org/1004/rss.xml",
];
const BUSINESS = [
  "https://www.cnbc.com/id/100003114/device/rss/rss.html",
  "http://feeds.marketwatch.com/marketwatch/topstories/",
  "https://news.google.com/rss/search?q=markets+economy+fed+oil+inflation&hl=en-US&gl=US&ceid=US:en",
];
const CRYPTO = ["https://cointelegraph.com/rss", "https://www.coindesk.com/arc/outboundfeeds/rss/"];

async function rssTitles(url: string, n: number): Promise<string[]> {
  try {
    const res = await fetchWithTimeout(url, { timeoutMs: 7000 });
    if (!res.ok) return [];
    const doc = parser.parse(await res.text());
    const items = doc?.rss?.channel?.item ?? doc?.feed?.entry ?? [];
    const arr = Array.isArray(items) ? items : [items];
    return arr
      .slice(0, n)
      .map((it: any) => String(it?.title?.["#text"] ?? it?.title ?? "").replace(/<!\[CDATA\[|\]\]>/g, "").trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function gatherSignals(): Promise<string> {
  const [world, business, crypto, marketsRes, quakesRes] = await Promise.all([
    Promise.all(WORLD.map((u) => rssTitles(u, 12))).then((a) => a.flat()),
    Promise.all(BUSINESS.map((u) => rssTitles(u, 12))).then((a) => a.flat()),
    Promise.all(CRYPTO.map((u) => rssTitles(u, 12))).then((a) => a.flat()),
    fetchWithTimeout(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true",
      { timeoutMs: 8000 }
    )
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
    fetchWithTimeout("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson", {
      timeoutMs: 8000,
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  ]);

  const dedupe = (xs: string[]) => Array.from(new Set(xs)).slice(0, 24);
  let markets = "unavailable";
  if (marketsRes) {
    const m = marketsRes as Record<string, { usd: number; usd_24h_change: number }>;
    markets = ["bitcoin", "ethereum", "solana"]
      .filter((k) => m[k])
      .map((k) => `${k.toUpperCase()} $${Math.round(m[k].usd).toLocaleString()} (${m[k].usd_24h_change >= 0 ? "+" : ""}${m[k].usd_24h_change.toFixed(1)}% 24h)`)
      .join(", ");
  }
  let quakes = "none M4.5+";
  if (quakesRes?.features?.length) {
    quakes = quakesRes.features
      .slice(0, 6)
      .map((f: any) => `M${f.properties.mag?.toFixed(1)} ${f.properties.place}`)
      .join("; ");
  }

  return [
    `WORLD / GEOPOLITICS HEADLINES:\n- ${dedupe(world).join("\n- ")}`,
    `\nBUSINESS / MARKETS HEADLINES:\n- ${dedupe(business).join("\n- ")}`,
    `\nCRYPTO HEADLINES:\n- ${dedupe(crypto).join("\n- ")}`,
    `\nLIVE MARKET SNAPSHOT: ${markets}`,
    `\nSIGNIFICANT SEISMIC (24h): ${quakes}`,
  ].join("\n");
}

const SYSTEM = `You are ARGUS — an elite geopolitical and macro-financial intelligence analyst. You write a single daily executive intelligence briefing for a head of state and serial entrepreneur who has five minutes and needs to know what matters and where the opportunities are.

Rules:
- Synthesize ONLY from the live signals provided. Today's situation is defined by those headlines and market data — do not invent events that aren't supported.
- Be specific, quantified, and decisive. No hedging filler. Write like a Stratfor/Goldman desk note.
- For businessSignals, attribute institutional-style views to the houses that actually publish them (Goldman Sachs, Morgan Stanley, JPMorgan, McKinsey, Wood Mackenzie, BlackRock, IMF, OPEC) — keep them directionally consistent with the signals; never cite a precise figure that contradicts the data.
- thingsToWatch = concrete upcoming catalysts that could move markets (data prints, central-bank meetings, elections, earnings, OPEC, geopolitical flashpoints).
- opportunities = actionable asset calls a sophisticated allocator could act on, each with a crisp rationale.
- predictions = falsifiable 30-day calls with an integer probability 0-100.
- executiveSummary = the 4-6 most important signals, ranked by severity, each with a tight analytical paragraph.
- Condense aggressively. This is for decision-makers, not a newspaper.`;

function userPrompt(signals: string, dateLabel: string): string {
  return `Today is ${dateLabel}. Produce the daily ARGUS executive intelligence brief from these live signals.\n\n${signals}\n\nReturn the structured brief.`;
}

/* ── daily cache: Vercel KV / Upstash Redis (persistent) → tmp file (dev) ── */
// Vercel's KV integration injects KV_REST_API_URL/TOKEN; Upstash uses its own.
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KV_ON = !!(KV_URL && KV_TOKEN);

async function kvCmd(cmd: unknown[]): Promise<any> {
  const r = await fetchWithTimeout(KV_URL!, {
    timeoutMs: 6000,
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify(cmd),
  });
  return r.json();
}

function tmpPath(dateKey: string) {
  return path.join(os.tmpdir(), `argus-brief-${dateKey}.json`);
}

async function cacheGet(dateKey: string): Promise<AiBrief | null> {
  if (KV_ON) {
    try {
      const j = await kvCmd(["GET", `argus-brief:${dateKey}`]);
      return j?.result ? (JSON.parse(j.result) as AiBrief) : null;
    } catch {
      return null;
    }
  }
  try {
    return JSON.parse(await fs.readFile(tmpPath(dateKey), "utf8")) as AiBrief;
  } catch {
    return null;
  }
}

async function cacheSet(dateKey: string, brief: AiBrief): Promise<void> {
  if (KV_ON) {
    try {
      await kvCmd(["SET", `argus-brief:${dateKey}`, JSON.stringify(brief), "EX", "172800"]); // 2-day TTL
    } catch {
      /* ignore */
    }
    return;
  }
  await fs.writeFile(tmpPath(dateKey), JSON.stringify(brief)).catch(() => {});
}

let inflight: Promise<AiBrief> | null = null;

async function generate(dateKey: string, dateLabel: string): Promise<AiBrief> {
  const client = new Anthropic();
  const signals = await gatherSignals();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium", format: { type: "json_schema", schema: BRIEF_SCHEMA } },
    system: SYSTEM,
    messages: [{ role: "user", content: userPrompt(signals, dateLabel) }],
  });
  const msg = await stream.finalMessage();
  const textBlock = msg.content.find((b: any) => b.type === "text") as { text: string } | undefined;
  if (!textBlock) throw new Error("no text block in model response");
  const parsed = JSON.parse(textBlock.text) as Omit<AiBrief, "generatedAt" | "dateLabel">;
  return { ...parsed, generatedAt: Date.now(), dateLabel };
}

function unavailable(reason: string): AiBriefResponse {
  return { available: false, brief: null, meta: { model: MODEL, cached: false, reason } };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const refresh = url.searchParams.get("refresh") === "1";
  const now = new Date();
  const dateKey = now.toISOString().slice(0, 10);
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const dateLabel = `${String(now.getUTCDate()).padStart(2, "0")} ${months[now.getUTCMonth()]} ${now.getUTCFullYear()}`;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(unavailable("no ANTHROPIC_API_KEY configured"));
  }

  // Only authorized callers may trigger a (paid) generation. Vercel Cron sends
  // `Authorization: Bearer <CRON_SECRET>`. With CRON_SECRET unset (local dev),
  // generation is open so you can develop without a cron. In production, set
  // CRON_SECRET → random visitors can NEVER spend your credits; only the daily
  // cron regenerates the brief.
  const cronSecret = process.env.CRON_SECRET;
  const authed =
    !cronSecret ||
    req.headers.get("authorization") === `Bearer ${cronSecret}` ||
    url.searchParams.get("token") === cronSecret;

  const cached = await cacheGet(dateKey);
  if (cached && !refresh) {
    return NextResponse.json({ available: true, brief: cached, meta: { model: MODEL, cached: true } } as AiBriefResponse);
  }
  if (!authed) {
    return NextResponse.json(
      cached
        ? ({ available: true, brief: cached, meta: { model: MODEL, cached: true } } as AiBriefResponse)
        : unavailable("today's brief is generated once daily and isn't ready yet")
    );
  }

  try {
    if (!inflight) inflight = generate(dateKey, dateLabel).finally(() => (inflight = null));
    const brief = await inflight;
    await cacheSet(dateKey, brief);
    return NextResponse.json({ available: true, brief, meta: { model: MODEL, cached: false } } as AiBriefResponse);
  } catch (err) {
    return NextResponse.json(unavailable(err instanceof Error ? err.message : "generation failed"));
  }
}
