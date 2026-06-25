"use client";

import { create } from "zustand";
import type { LayerId } from "@/lib/types";
import type { Anomaly } from "@/lib/analytics/anomaly";

interface Selection {
  kind: LayerId;
  id: string;
  title: string;
  lines: string[];
  lat: number;
  lng: number;
}

interface UIState {
  layers: Record<LayerId, boolean>;
  toggleLayer: (id: LayerId) => void;
  autoRotate: boolean;
  toggleRotate: () => void;
  selection: Selection | null;
  setSelection: (s: Selection | null) => void;
  analyticsOpen: boolean;
  toggleAnalytics: () => void;
  flyTo: { lat: number; lng: number; name: string; ts: number } | null;
  requestFlyTo: (lat: number, lng: number, name: string) => void;
  resetViewTs: number;
  resetView: () => void;
  globeRevealTs: number;
  triggerGlobeReveal: () => void;
  globeMode: "stylized" | "satellite";
  setGlobeMode: (m: "stylized" | "satellite") => void;
  anomalies: Anomaly[];
  setAnomalies: (a: Anomaly[]) => void;
  briefOpen: boolean;
  setBriefOpen: (b: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  layers: {
    flights: true,
    military: true,
    quakes: true,
    space: true,
    events: true,
    flashpoints: true,
  },
  toggleLayer: (id) =>
    set((s) => ({ layers: { ...s.layers, [id]: !s.layers[id] } })),
  autoRotate: true,
  toggleRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
  selection: null,
  setSelection: (selection) => set({ selection }),
  analyticsOpen: false,
  toggleAnalytics: () => set((s) => ({ analyticsOpen: !s.analyticsOpen })),
  flyTo: null,
  requestFlyTo: (lat, lng, name) => set({ flyTo: { lat, lng, name, ts: Date.now() } }),
  resetViewTs: 0,
  resetView: () => set({ resetViewTs: Date.now(), selection: null }),
  globeRevealTs: 0,
  triggerGlobeReveal: () => set({ globeRevealTs: Date.now() }),
  globeMode: "stylized",
  setGlobeMode: (m) => set({ globeMode: m }),
  anomalies: [],
  setAnomalies: (anomalies) => set({ anomalies }),
  briefOpen: false,
  setBriefOpen: (briefOpen) => set({ briefOpen }),
}));
