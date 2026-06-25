"use client";

import { useEffect, useRef, useState } from "react";
import { useUIStore } from "@/lib/store/uiStore";

// Soft-edged circle that expands from the centre when the globe transitions
// from the stylized overview into the satellite view.
export default function RevealOverlay() {
  const ts = useUIStore((s) => s.globeRevealTs);
  const [key, setKey] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!ts) return;
    setKey((k) => k + 1);
  }, [ts]);

  if (key === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden">
      <span key={key} className="reveal-circle" />
    </div>
  );
}
