import { NextResponse } from "next/server";
import { fetchWithTimeout, cachedJson } from "@/lib/server/fetchJson";

export const dynamic = "force-dynamic";

// Keyless hourly price history via Binance public klines (data-api.binance.vision).
// 240 × 1h candles ≈ 10 days. Reliable and generous vs. CoinGecko's throttled free tier.
const COINS: Array<{ id: string; label: string; symbol: string }> = [
  { id: "bitcoin", label: "BTC", symbol: "BTCUSDT" },
  { id: "ethereum", label: "ETH", symbol: "ETHUSDT" },
  { id: "solana", label: "SOL", symbol: "SOLUSDT" },
];

export interface CryptoSeries {
  id: string;
  label: string;
  prices: [number, number][]; // [epochMs, usd close]
}
export interface CryptoHistoryResponse {
  data: CryptoSeries[];
  meta: { fetchedAt: number; live: boolean };
}

async function loadCoin(c: (typeof COINS)[number]): Promise<CryptoSeries> {
  const url = `https://data-api.binance.vision/api/v3/klines?symbol=${c.symbol}&interval=1h&limit=240`;
  const res = await fetchWithTimeout(url, { timeoutMs: 9000 });
  if (!res.ok) throw new Error(`binance ${c.symbol} ${res.status}`);
  const rows = (await res.json()) as unknown[][];
  // kline: [openTime, open, high, low, close, ...]
  const prices = rows.map((r) => [Number(r[0]), parseFloat(r[4] as string)] as [number, number]);
  return { id: c.id, label: c.label, prices };
}

async function load(): Promise<CryptoSeries[]> {
  const out = await Promise.all(COINS.map(loadCoin));
  if (out.every((s) => s.prices.length === 0)) throw new Error("no candles");
  return out;
}

export async function GET() {
  try {
    const { value, fresh } = await cachedJson("crypto-history", 300_000, load);
    const body: CryptoHistoryResponse = { data: value, meta: { fetchedAt: Date.now(), live: fresh } };
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      { data: [], meta: { fetchedAt: Date.now(), live: false } } as CryptoHistoryResponse,
      { status: 200 }
    );
  }
}
