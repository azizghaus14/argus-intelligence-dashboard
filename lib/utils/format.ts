export function fmtUTC(d: Date = new Date()): string {
  return d.toISOString().slice(11, 19) + "Z";
}

export function fmtDateUTC(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function compact(n: number): string {
  return Intl.NumberFormat("en", { notation: "compact" }).format(n);
}

export function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}
