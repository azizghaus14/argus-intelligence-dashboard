"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useUIStore } from "@/lib/store/uiStore";

export default function SearchBox() {
  const requestFlyTo = useUIStore((s) => s.requestFlyTo);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query || busy) return;
    setBusy(true);
    setErr(false);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
        { headers: { Accept: "application/json" } }
      );
      const arr = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
      if (arr.length) {
        const { lat, lon, display_name } = arr[0];
        requestFlyTo(parseFloat(lat), parseFloat(lon), display_name.split(",")[0]);
      } else {
        setErr(true);
      }
    } catch {
      setErr(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={go} className="relative w-full max-w-[300px]">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin text-signal" /> : <Search className="h-3.5 w-3.5" />}
      </span>
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setErr(false);
        }}
        placeholder="Search"
        spellCheck={false}
        className={`w-full rounded-full border bg-white/[0.04] py-1.5 pl-9 pr-3 font-mono text-[11px] text-text-primary placeholder:text-text-tertiary outline-none backdrop-blur-md transition focus:bg-white/[0.07] ${
          err ? "border-alert/50" : "border-white/10 focus:border-signal/50"
        }`}
      />
    </form>
  );
}
