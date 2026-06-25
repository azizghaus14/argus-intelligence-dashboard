import { NextResponse } from "next/server";
import { fetchWithTimeout, cachedJson } from "@/lib/server/fetchJson";
import { XMLParser } from "fast-xml-parser";
import type { NewsItem, FeedResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

// Keyless crypto-specific newswire (RSS) — feeds the sentiment feature that
// adjusts the price forecast.
const FEEDS: Array<{ url: string; source: string }> = [
  { url: "https://cointelegraph.com/rss", source: "COINTELEGRAPH" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", source: "COINDESK" },
  { url: "https://cryptopanic.com/news/rss/", source: "CRYPTOPANIC" },
  { url: "https://decrypt.co/feed", source: "DECRYPT" },
];

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

async function loadFeed(f: (typeof FEEDS)[number]): Promise<NewsItem[]> {
  try {
    const res = await fetchWithTimeout(f.url, { timeoutMs: 7000 });
    if (!res.ok) return [];
    const xml = await res.text();
    const doc = parser.parse(xml);
    const items = doc?.rss?.channel?.item ?? doc?.feed?.entry ?? [];
    const arr = Array.isArray(items) ? items : [items];
    return arr.slice(0, 25).map((it: any, i: number) => {
      const rawLink = it.link;
      const link =
        typeof rawLink === "string" ? rawLink : rawLink?.["@_href"] ?? rawLink?.["#text"] ?? "";
      const dateStr = it.pubDate ?? it.published ?? it.updated;
      const pub = dateStr ? Date.parse(dateStr) : Date.now();
      return {
        id: `${f.source}-${i}-${link}`,
        title: String(it.title?.["#text"] ?? it.title ?? "")
          .replace(/<!\[CDATA\[|\]\]>/g, "")
          .trim(),
        source: f.source,
        link,
        published: Number.isNaN(pub) ? Date.now() : pub,
        category: "CRYPTO",
      } as NewsItem;
    });
  } catch {
    return [];
  }
}

async function load(): Promise<NewsItem[]> {
  const all = (await Promise.all(FEEDS.map(loadFeed))).flat();
  if (all.length === 0) throw new Error("no crypto feeds");
  const seen = new Set<string>();
  return all
    .filter((n) => n.title && !seen.has(n.title) && seen.add(n.title))
    .sort((a, b) => b.published - a.published)
    .slice(0, 80);
}

export async function GET() {
  try {
    const { value, fresh } = await cachedJson("crypto-news", 300_000, load);
    const body: FeedResponse<NewsItem> = {
      data: value,
      meta: { count: value.length, fetchedAt: Date.now(), source: "Crypto OSINT / RSS", live: fresh },
    };
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      {
        data: [],
        meta: { count: 0, fetchedAt: Date.now(), source: "Crypto OSINT (unavailable)", live: false },
      } as FeedResponse<NewsItem>,
      { status: 200 }
    );
  }
}
