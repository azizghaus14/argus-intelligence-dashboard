// Loads the prebuilt Cesium UMD bundle + CSS from a version-pinned CDN at
// runtime. This deliberately avoids importing "cesium" through webpack, which
// fails on Cesium's ESM source (KmlDataSource → @zip.js subpath export).

const CESIUM_VERSION = "1.122.0";
const BASE = `https://cdn.jsdelivr.net/npm/cesium@${CESIUM_VERSION}/Build/Cesium/`;

// Cesium is huge and fully dynamic — typing it as `any` keeps us off the
// bundler entirely while staying ergonomic.
/* eslint-disable @typescript-eslint/no-explicit-any */
let promise: Promise<any> | null = null;

export function loadCesium(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as any;
  if (w.Cesium) return Promise.resolve(w.Cesium);
  if (promise) return promise;

  promise = new Promise((resolve, reject) => {
    w.CESIUM_BASE_URL = BASE;

    if (!document.getElementById("cesium-widgets-css")) {
      const link = document.createElement("link");
      link.id = "cesium-widgets-css";
      link.rel = "stylesheet";
      link.href = `${BASE}Widgets/widgets.css`;
      document.head.appendChild(link);
    }

    const existing = document.getElementById("cesium-script") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(w.Cesium));
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.id = "cesium-script";
    script.src = `${BASE}Cesium.js`;
    script.async = true;
    script.onload = () => resolve(w.Cesium);
    script.onerror = () => reject(new Error("Failed to load Cesium from CDN"));
    document.head.appendChild(script);
  });

  return promise;
}
