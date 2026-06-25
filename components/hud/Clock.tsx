"use client";

import { useEffect, useState } from "react";
import { fmtUTC, fmtDateUTC } from "@/lib/utils/format";

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-baseline gap-2 font-mono tabular">
      <span className="hidden text-[10px] text-text-tertiary sm:inline">{now ? fmtDateUTC(now) : "----------"}</span>
      <span className="text-sm font-medium text-signal">
        {now ? fmtUTC(now) : "--:--:--Z"}
      </span>
    </div>
  );
}
