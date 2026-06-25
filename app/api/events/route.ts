import { NextResponse } from "next/server";
import { fetchWithTimeout, cachedJson } from "@/lib/server/fetchJson";
import { XMLParser } from "fast-xml-parser";
import type { NewsItem, FeedResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

// Keyless OSINT news via RSS. Powers the global event ticker.
const FEEDS: Array<{ url: string; source: string; category: string }> = [
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC", category: "WORLD" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "AL JAZEERA", category: "WORLD" },
  { url: "http://rss.cnn.com/rss/edition_world.rss", source: "CNN", category: "WORLD" },
  { url: "https://feeds.npr.org/1004/rss.xml", source: "NPR", category: "WORLD" },
];

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

async function loadFeed(f: (typeof FEEDS)[number]): Promise<NewsItem[]> {
  try {
    const res = await fetchWithTimeout(f.url, { timeoutMs: 7000 });
    if (!res.ok) return [];
    const xml = await res.text();
    const doc = parser.parse(xml);
    const items = doc?.rss?.channel?.item ?? [];
    const arr = Array.isArray(items) ? items : [items];
    return arr.slice(0, 20).map((it: any, i: number) => {
      const link = typeof it.link === "string" ? it.link : it.link?.["#text"] ?? "";
      const pub = it.pubDate ? Date.parse(it.pubDate) : Date.now();
      return {
        id: `${f.source}-${i}-${link}`,
        title: String(it.title ?? "").replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
        source: f.source,
        link,
        published: Number.isNaN(pub) ? Date.now() : pub,
        category: f.category,
      } as NewsItem;
    });
  } catch {
    return [];
  }
}

async function load(): Promise<NewsItem[]> {
  const all = (await Promise.all(FEEDS.map(loadFeed))).flat();
  if (all.length === 0) throw new Error("no feeds");
  // dedupe by title, newest first
  const seen = new Set<string>();
  return all
    .filter((n) => n.title && !seen.has(n.title) && seen.add(n.title))
    .sort((a, b) => b.published - a.published)
    .slice(0, 60);
}

export async function GET() {
  try {
    const { value, fresh } = await cachedJson("events", 120_000, load);
    const body: FeedResponse<NewsItem> = {
      data: value,
      meta: { count: value.length, fetchedAt: Date.now(), source: "OSINT / RSS", live: fresh },
    };
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      {
        data: [],
        meta: { count: 0, fetchedAt: Date.now(), source: "OSINT (unavailable)", live: false },
      } as FeedResponse<NewsItem>,
      { status: 200 }
    );
  }
}
