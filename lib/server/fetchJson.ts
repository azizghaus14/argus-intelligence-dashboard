// Server-side fetch helpers with timeout + tiny in-memory TTL cache.
// Keeps us inside upstream rate limits and makes the demo resilient.

type CacheEntry = { at: number; value: unknown };
const cache = new Map<string, CacheEntry>();

export async function fetchWithTimeout(
  url: string,
  opts: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = 8000, ...rest } = opts;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...rest,
      signal: ctrl.signal,
      headers: { "User-Agent": "argus-osint/0.1 (portfolio)", ...rest.headers },
      cache: "no-store",
    });
  } finally {
    clearTimeout(t);
  }
}

export async function cachedJson<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): Promise<{ value: T; fresh: boolean }> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) {
    return { value: hit.value as T, fresh: false };
  }
  try {
    const value = await loader();
    cache.set(key, { at: Date.now(), value });
    return { value, fresh: true };
  } catch (err) {
    if (hit) return { value: hit.value as T, fresh: false }; // serve stale
    throw err;
  }
}
