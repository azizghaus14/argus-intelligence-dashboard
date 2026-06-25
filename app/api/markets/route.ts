import { NextResponse } from "next/server";
import { fetchWithTimeout, cachedJson } from "@/lib/server/fetchJson";

export const dynamic = "force-dynamic";

// Keyless live crypto via CoinGecko (rate-limited public API).
const URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true";

export interface MarketTick {
  label: string;
  value: number;
  change: number;
}
export interface MarketsResponse {
  data: MarketTick[];
  meta: { fetchedAt: number; live: boolean };
}

async function load(): Promise<MarketTick[]> {
  const res = await fetchWithTimeout(URL, { timeoutMs: 8000 });
  if (!res.ok) throw new Error(`coingecko ${res.status}`);
  const j = (await res.json()) as Record<string, { usd: number; usd_24h_change: number }>;
  const map: Array<[string, string]> = [
    ["BTC", "bitcoin"],
    ["ETH", "ethereum"],
    ["SOL", "solana"],
  ];
  return map
    .filter(([, id]) => j[id])
    .map(([label, id]) => ({ label, value: j[id].usd, change: j[id].usd_24h_change ?? 0 }));
}

export async function GET() {
  try {
    const { value, fresh } = await cachedJson("markets", 60_000, load);
    const body: MarketsResponse = { data: value, meta: { fetchedAt: Date.now(), live: fresh } };
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      { data: [], meta: { fetchedAt: Date.now(), live: false } } as MarketsResponse,
      { status: 200 }
    );
  }
}
