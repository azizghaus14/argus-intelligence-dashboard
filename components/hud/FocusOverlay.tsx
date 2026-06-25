"use client";

import { useUIStore } from "@/lib/store/uiStore";
import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";

// Heavy vignette + centered targeting reticle shown while locked onto a flight.
// The tracked aircraft is camera-centered, so a centered reticle frames it.
export default function FocusOverlay() {
  const { selection, setSelection } = useUIStore();
  const active = selection?.kind === "flights" || selection?.kind === "military";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-20 transition-opacity duration-500",
        active ? "opacity-100" : "opacity-0"
      )}
    >
      {/* small, tight focus vignette around the locked aircraft */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle 22% at 50% 50%, transparent 55%, rgba(2,4,9,0.45) 100%)",
        }}
      />

      {/* small white targeting reticle (no glow) */}
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300",
          active ? "scale-100" : "scale-110"
        )}
      >
        <div className="relative h-24 w-24">
          {/* corner brackets — white, no glow */}
          <span className="absolute left-0 top-0 h-4 w-4 border-l border-t border-white/90" />
          <span className="absolute right-0 top-0 h-4 w-4 border-r border-t border-white/90" />
          <span className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-white/90" />
          <span className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-white/90" />

          {/* lock label */}
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.3em] text-white/80">
            Target Lock
          </span>
        </div>
      </div>

      <button
        type="button"
        aria-label="Exit target lock"
        title="Exit target lock"
        onClick={() => setSelection(null)}
        className={cn(
          "absolute left-1/2 top-[calc(50%+78px)] flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white/75 backdrop-blur-md transition hover:border-white/40 hover:text-white",
          active ? "pointer-events-auto scale-100" : "pointer-events-none scale-90"
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
