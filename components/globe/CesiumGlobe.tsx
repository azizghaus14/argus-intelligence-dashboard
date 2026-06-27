"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { loadCesium } from "@/lib/globe/loadCesium";
import { buildStylizedGlobe, type StylizedHandles } from "@/lib/globe/stylized";
import { useFlights, useMilitary, useQuakes, useSpace } from "@/lib/hooks/useFeeds";
import { useUIStore } from "@/lib/store/uiStore";
import { timeAgo } from "@/lib/utils/format";
import type { Flight, Quake } from "@/lib/types";

const ION_TOKEN = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
const BASE = { lat: 3.14, lng: 101.69 }; // analyst base — Kuala Lumpur

// Centred full-globe view (zoom-out / Home always returns here).
const HOME_VIEW = { lng: 10, lat: 20, height: 2.4e7 };
// Oblique 3D "hero" view shown on first load (Google-Earth style horizon).
const HERO_VIEW = { lng: 2, lat: 26, height: 2.0e6, pitch: -40 };
const FLIGHT_BLEND_MS = 7_000;
const FLIGHT_RETENTION_MS = 180_000;
const FLIGHT_ICON_PX = 16;
const FLIGHT_DEPTH_BYPASS_METRES = 1.5e6;

// Top-down plane glyph (white → tinted by billboard color), points "up" = north.
// Explicit width/height is required or Cesium rasterizes the SVG as a black box.
const PLANE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><path fill="#ffffff" d="M12 2c.6 0 1 .8 1 2v6.2l8 4.8v2l-8-2.6V20l2.4 1.6V23L12 21.7 8.6 23v-1.4L11 20v-5.4L3 17.2v-2l8-4.8V4c0-1.2.4-2 1-2z"/></svg>';
const PLANE_IMG =
  typeof window !== "undefined"
    ? "data:image/svg+xml;base64," + window.btoa(PLANE_SVG)
    : "";

type FlightMotion = {
  startLat: number;
  startLng: number;
  startAlt: number;
  targetLat: number;
  targetLng: number;
  targetAlt: number;
  heading: number;
  velocity: number;
  verticalRate: number;
  onGround: boolean;
  blendStartedAt: number;
  blendDurationMs: number;
  sampleKey: string;
  seenAt: number;
};

let planeSpriteReady: Promise<string> | null = null;

function preloadPlaneSprite() {
  if (planeSpriteReady || typeof Image === "undefined") return planeSpriteReady ?? Promise.resolve(PLANE_IMG);
  planeSpriteReady = new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(PLANE_IMG);
    image.onerror = () => resolve(PLANE_IMG);
    image.src = PLANE_IMG;
  });
  return planeSpriteReady;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function lerpLongitude(from: number, to: number, amount: number) {
  const delta = ((to - from + 540) % 360) - 180;
  return ((from + delta * amount + 540) % 360) - 180;
}

function flightVisualAltitude(flight: Flight) {
  const sourceAltitude = Number.isFinite(flight.alt) ? flight.alt : 0;
  const clearance = flight.onGround ? 1_800 : 1_200;
  return Math.max(sourceAltitude + clearance, flight.onGround ? 1_800 : 2_600);
}

function flightPositionAt(motion: FlightMotion, now: number) {
  const elapsedMs = Math.max(0, now - motion.blendStartedAt);
  const projectedSeconds = Math.min(180, elapsedMs / 1000);
  const target =
    motion.onGround || motion.velocity < 2
      ? { lat: motion.targetLat, lng: motion.targetLng }
      : projectGreatCircle(
          motion.targetLat,
          motion.targetLng,
          motion.heading,
          (motion.velocity * projectedSeconds) / 1000
        );
  const blend = motion.blendDurationMs === 0 ? 1 : smoothstep(elapsedMs / motion.blendDurationMs);
  return {
    lat: motion.startLat + (target.lat - motion.startLat) * blend,
    lng: lerpLongitude(motion.startLng, target.lng, blend),
    alt: Math.max(
      motion.onGround ? 1_800 : 2_600,
      motion.startAlt +
        (motion.targetAlt + motion.verticalRate * projectedSeconds - motion.startAlt) * blend
    ),
  };
}

function setFlightFocused(C: any, entity: any, focused: boolean) {
  if (!entity) return;
  if (entity.billboard) {
    entity.billboard.width = FLIGHT_ICON_PX;
    entity.billboard.height = FLIGHT_ICON_PX;
    entity.billboard.color = C.Color.fromCssColorString(
      focused ? "#FFFFFF" : entity._flightColor ?? "#CFEFFF"
    ).withAlpha(entity._flightAlpha ?? 1);
  }
  if (entity.label) entity.label.show = focused;
}

// Pure great-circle projection (no Cesium) — dead-reckons aircraft positions.
function projectGreatCircle(lat: number, lng: number, brgDeg: number, distKm: number) {
  const R = 6371;
  const d = distKm / R;
  const b = (brgDeg * Math.PI) / 180;
  const la1 = (lat * Math.PI) / 180;
  const lo1 = (lng * Math.PI) / 180;
  const la2 = Math.asin(Math.sin(la1) * Math.cos(d) + Math.cos(la1) * Math.sin(d) * Math.cos(b));
  const lo2 =
    lo1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(la1), Math.cos(d) - Math.sin(la1) * Math.sin(la2));
  return { lat: (la2 * 180) / Math.PI, lng: (((lo2 * 180) / Math.PI + 540) % 360) - 180 };
}

function headingVector(lng: number, lat: number, heading: number, velocity: number) {
  const distanceKm = Math.min(28, Math.max(4, (velocity * 60) / 1000));
  const radians = (heading * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const dLat = (Math.cos(radians) * distanceKm) / 111;
  const dLng = (Math.sin(radians) * distanceKm) / (111 * Math.max(0.25, Math.cos(latRad)));
  return { lng: lng + dLng, lat: lat + dLat };
}

export default function CesiumGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const CRef = useRef<any>(null); // Cesium namespace
  const dsRef = useRef<Record<string, any>>({});
  const flightEntitiesRef = useRef<Map<string, any>>(new Map());
  const flightMotionsRef = useRef<Map<string, FlightMotion>>(new Map());
  const rotateRef = useRef(true);
  const followIdRef = useRef<string | null>(null); // icao24 of tracked flight
  const focusFlightRef = useRef<((id: string) => void) | null>(null);
  const applyGlobeModeRef = useRef<((stylized: boolean) => void) | null>(null);
  const gfxRef = useRef<{ tileset: any; stylized: StylizedHandles | null; stylizedMode: boolean | null }>({
    tileset: null,
    stylized: null,
    stylizedMode: null,
  });
  const [ready, setReady] = useState(false);

  const { layers, autoRotate, setSelection, selection, flyTo, resetViewTs } = useUIStore();
  const flights = useFlights(layers.flights);
  const military = useMilitary(layers.military);
  const quakes = useQuakes(layers.quakes);
  const space = useSpace(layers.space);

  // ── Mount: build the viewer once ──────────────────────────────────────────
  useEffect(() => {
    let destroyed = false;
    let viewer: any = null;
    let handler: any = null;
    let onWheel: ((event: WheelEvent) => void) | null = null;
    let onZoomTick: (() => void) | null = null;
    let onCameraMoveEnd: (() => void) | null = null;
    let onKeyDown: ((event: KeyboardEvent) => void) | null = null;
    let zoomAnimationFrame: number | null = null;
    let flightAnimationTimer: ReturnType<typeof setInterval> | null = null;

    loadCesium()
      .then((Cesium) => {
        if (destroyed || !containerRef.current || viewerRef.current) return;
        CRef.current = Cesium;
        if (ION_TOKEN) Cesium.Ion.defaultAccessToken = ION_TOKEN;

        const color = (hex: string, a = 1) =>
          Cesium.Color.fromCssColorString(hex).withAlpha(a);

        viewer = new Cesium.Viewer(containerRef.current, {
          animation: false,
          timeline: false,
          baseLayer: false, // we add our own imagery — avoids the expired Ion default token
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          fullscreenButton: false,
          infoBox: false,
          selectionIndicator: false,
          creditContainer: document.createElement("div"),
          contextOptions: { webgl: { alpha: true } }, // transparent canvas → CSS space behind
        });
        viewerRef.current = viewer;
        if (typeof window !== "undefined") (window as any).__v = viewer;

        const scene = viewer.scene;
        // Transparent space — the atmospheric backdrop is painted in CSS behind.
        scene.backgroundColor = Cesium.Color.TRANSPARENT;
        scene.skyBox.show = false;
        scene.sun.show = true;
        try { scene.sun.glowFactor = 0.6; } catch {}
        try { scene.moon.show = false; } catch {}
        scene.globe.baseColor = color("#0a0e16");
        scene.globe.depthTestAgainstTerrain = false;
        scene.globe.enableLighting = true;
        scene.fog.enabled = true;

        // Performance-first: render at CSS resolution, cheap FXAA (no MSAA),
        // and only redraw when something actually changes (huge idle win,
        // and it lets the glass panels stop recompositing every frame).
        viewer.useBrowserRecommendedResolution = true;
        viewer.resolutionScale = 1.0;
        try { scene.msaaSamples = 1; } catch {}
        try { scene.postProcessStages.fxaa.enabled = true; } catch {}

        // On-demand rendering by default → the globe is idle (and flights are
        // static) until you interact or focus a flight. Saves CPU/GPU. We flip
        // to continuous only while orbiting or tracking an aircraft.
        scene.requestRenderMode = true;
        scene.maximumRenderTimeChange = Infinity;
        // Keep streaming tiles/imagery while in on-demand mode.
        scene.globe.tileLoadProgressEvent.addEventListener(() => {
          if (!viewer.isDestroyed()) scene.requestRender();
        });

        // Cesium's world-space atmosphere remains attached at every camera tilt.
        scene.skyAtmosphere.show = true;
        try {
          scene.skyAtmosphere.atmosphereLightIntensity = 18.0;
          scene.skyAtmosphere.brightnessShift = 0.06;
          scene.skyAtmosphere.saturationShift = 0.16;
          scene.skyAtmosphere.hueShift = -0.02;
          scene.skyAtmosphere.perFragmentAtmosphere = true;
          scene.skyAtmosphere.dynamicAtmosphereLighting = false;
        } catch {
          /* older Cesium */
        }

        // Render at the device's native pixel ratio (crisp retina) — NOT extra
        // supersampling, which would over-render and tank FPS.
        try {
          viewer.useBrowserRecommendedResolution = false;
          viewer.resolutionScale = 1.0;
        } catch {
          /* noop */
        }
        try {
          scene.msaaSamples = 4; // smooth border/label edges
          scene.postProcessStages.fxaa.enabled = true;
        } catch {
          /* older Cesium */
        }

        // Fast imagery streaming: many parallel requests per host, a big tile
        // cache, and preloading neighbours/ancestors so zoom feels instant and
        // tiles refine to full resolution quickly.
        try {
          Cesium.RequestScheduler.maximumRequestsPerServer = 18;
          Cesium.RequestScheduler.maximumRequests = 64;
          scene.globe.tileCacheSize = 1200;
          scene.globe.preloadSiblings = true;
          scene.globe.preloadAncestors = true;
        } catch {
          /* noop */
        }

        // Subtle bloom — enough to make markers/limb glow, without blowing out
        // sunlit Google tiles. HDR off (it over-brightens daytime photoreal).
        scene.highDynamicRange = false;
        try {
          const bloom = scene.postProcessStages.bloom;
          bloom.enabled = false;
          bloom.uniforms.glowOnly = false;
          bloom.uniforms.contrast = 96;
          bloom.uniforms.brightness = -0.82;
          bloom.uniforms.delta = 0.8;
          bloom.uniforms.sigma = 2.8;
          bloom.uniforms.stepSize = 1.0;
        } catch {
          /* bloom optional */
        }

        const ctrl = scene.screenSpaceCameraController;
        ctrl.minimumZoomDistance = 80;
        ctrl.maximumZoomDistance = 4.5e7;
        // Full 3D navigation: drag to rotate, right-drag / two-finger to tilt & inspect 3D tiles.
        ctrl.enableRotate = true;
        ctrl.enableTilt = true;
        ctrl.enableLook = true;
        ctrl.enableTranslate = true;
        ctrl.enableZoom = true;
        ctrl.inertiaSpin = 0.85;
        ctrl.inertiaTranslate = 0.85;
        ctrl.inertiaZoom = 0.65;
        ctrl.maximumMovementRatio = 0.06;
        // Wheel zoom is handled below so zooming out always resolves to the
        // same centered world view. Keep native pinch for touch devices.
        ctrl.zoomEventTypes = [Cesium.CameraEventType.PINCH];

        // Start zoomed out on the centred stylized digital globe.
        // Oblique 3/4 default — look at the globe from a low angle so the
        // glowing limb arcs across the top, the way it reads in the hero shot.
        const heroTarget = Cesium.Cartesian3.fromDegrees(26, 32, 0);
        viewer.camera.lookAt(
          heroTarget,
          new Cesium.HeadingPitchRange(
            Cesium.Math.toRadians(0),
            Cesium.Math.toRadians(-30),
            1.12e7
          )
        );
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY); // unlock for free rotation / spin
        viewer.camera.moveDown(2.2e6); // nudge the globe up in the frame

        // Satellite imagery = Google SATELLITE tiles only (lyrs=s, NO baked
        // labels). The baked raster labels were pixelated at high-DPI; we render
        // our own crisp vector place labels instead (see buildStylizedGlobe).
        // Rotated across Google's 4 subdomains (mt0–mt3) for parallel downloads.
        (async () => {
          try {
            viewer.imageryLayers.addImageryProvider(
              new Cesium.UrlTemplateImageryProvider({
                url: "https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
                subdomains: ["0", "1", "2", "3"],
                maximumLevel: 20,
                credit: "Imagery © Google",
              })
            );
            scene.requestRender();
          } catch (err) {
            try {
              viewer.imageryLayers.addImageryProvider(
                new Cesium.OpenStreetMapImageryProvider({
                  url: "https://tile.openstreetmap.org/",
                })
              );
            } catch {
              /* noop */
            }
            // eslint-disable-next-line no-console
            console.warn("[CesiumGlobe] imagery fallback:", err);
          }
        })();

        for (const id of ["flights", "military", "quakes", "space", "flashpoints", "arcs"]) {
          const ds = new Cesium.CustomDataSource(id);
          viewer.dataSources.add(ds);
          dsRef.current[id] = ds;
        }

        // ── Stylized "digital globe" overview + satellite mode switching ──────
        gfxRef.current.stylized = buildStylizedGlobe(Cesium, scene, viewer);
        const SAT_THRESHOLD = 3.0e6; // above → stylized digital globe; below → satellite

        const applyGlobeMode = (stylized: boolean) => {
          if (gfxRef.current.stylizedMode === stylized) return;
          const enteringSatellite =
            stylized === false && gfxRef.current.stylizedMode !== null;
          gfxRef.current.stylizedMode = stylized;
          try {
            useUIStore.getState().setGlobeMode(stylized ? "stylized" : "satellite");
          } catch {
            /* noop */
          }
          if (stylized) {
            scene.globe.show = true;
            scene.globe.baseColor = Cesium.Color.fromCssColorString("#040d28");
            scene.globe.enableLighting = false; // uniform digital look, no sun terminator
            scene.globe.showGroundAtmosphere = false;
            // No sky atmosphere in the stylized view — it draws a bright limb
            // ring that reads as an outline around the globe. Keep space clean.
            scene.skyAtmosphere.show = false;
            // No bloom — borders stay thin, crisp, and glow-free (cleaner look,
            // and cheaper). The soft atmosphere limb comes from skyAtmosphere.
            try {
              scene.postProcessStages.bloom.enabled = false;
            } catch {
              /* bloom optional */
            }
            if (gfxRef.current.tileset) gfxRef.current.tileset.show = false;
            gfxRef.current.stylized?.setShow(true);
            scene.requestRenderMode = false; // animate glowing borders + stars
          } else {
            gfxRef.current.stylized?.setShow(false);
            scene.globe.enableLighting = true;
            scene.globe.showGroundAtmosphere = true;
            scene.skyAtmosphere.show = true;
            scene.skyAtmosphere.atmosphereLightIntensity = 18.0;
            scene.skyAtmosphere.brightnessShift = 0.06;
            scene.skyAtmosphere.saturationShift = 0.16;
            try { scene.postProcessStages.bloom.enabled = false; } catch { /* noop */ }
            if (gfxRef.current.tileset) {
              gfxRef.current.tileset.show = true;
              scene.globe.show = false;
            } else {
              scene.globe.show = true; // Esri fallback renders on the globe
            }
            scene.requestRenderMode = !(rotateRef.current || followIdRef.current);
            if (enteringSatellite) {
              try {
                useUIStore.getState().triggerGlobeReveal();
              } catch {
                /* noop */
              }
            }
          }
          scene.requestRender();
        };
        applyGlobeModeRef.current = applyGlobeMode;
        applyGlobeMode(true); // start in the stylized overview

        const releaseTargetLock = () => {
          setFlightFocused(
            Cesium,
            flightEntitiesRef.current.get(followIdRef.current ?? ""),
            false
          );
          followIdRef.current = null;
          viewer.trackedEntity = undefined;
          scene.requestRenderMode = !rotateRef.current;
          setSelection(null);
          scene.requestRender();
        };

        // Zoom is now pure relative zoom (see onWheel) — no auto-centring blend,
        // which was the source of the zoom-out stutter/jump. Kept as a no-op so
        // existing call sites stay valid.
        const resetHomeTransition = () => {};

        const focusFlight = (flightId: string) => {
          const ent = flightEntitiesRef.current.get(flightId);
          if (!ent || viewer.isDestroyed()) return;
          const meta = ent._meta;
          setFlightFocused(
            Cesium,
            flightEntitiesRef.current.get(followIdRef.current ?? ""),
            false
          );
          followIdRef.current = flightId;
          setFlightFocused(Cesium, ent, true);
          rotateRef.current = false;
          scene.requestRenderMode = false;
          viewer.camera.cancelFlight();
          viewer.trackedEntity = undefined;

          const currentPosition = ent.position?.getValue(viewer.clock.currentTime);
          const targetPosition =
            currentPosition ?? Cesium.Cartesian3.fromDegrees(meta?.lng ?? 0, meta?.lat ?? 0, 0);
          const finalPitch = Cesium.Math.toRadians(-28);
          const finalRange = 1_700;
          const localOffset = new Cesium.Cartesian3(
            0,
            -finalRange * Math.cos(Math.abs(finalPitch)),
            finalRange * Math.sin(Math.abs(finalPitch))
          );
          const targetFrame = Cesium.Transforms.eastNorthUpToFixedFrame(targetPosition);
          const finalCameraPosition = Cesium.Matrix4.multiplyByPoint(
            targetFrame,
            localOffset,
            new Cesium.Cartesian3()
          );
          // Orient the final pose to look from the chase offset toward the
          // aircraft, so a SINGLE smooth flight lands exactly where
          // trackedEntity will hold it — no mid-flight re-orientation, no
          // jarring two-stage snap.
          const direction = Cesium.Cartesian3.normalize(
            Cesium.Cartesian3.subtract(targetPosition, finalCameraPosition, new Cesium.Cartesian3()),
            new Cesium.Cartesian3()
          );
          const surfaceNormal = Cesium.Cartesian3.normalize(targetPosition, new Cesium.Cartesian3());
          const right = Cesium.Cartesian3.normalize(
            Cesium.Cartesian3.cross(direction, surfaceNormal, new Cesium.Cartesian3()),
            new Cesium.Cartesian3()
          );
          const up = Cesium.Cartesian3.normalize(
            Cesium.Cartesian3.cross(right, direction, new Cesium.Cartesian3()),
            new Cesium.Cartesian3()
          );
          ent.viewFrom = localOffset;

          // Swap stylized → satellite partway through the descent so the
          // circular reveal masks the change while the camera is still moving.
          const revealTimer = window.setTimeout(() => {
            if (followIdRef.current === flightId && !viewer.isDestroyed()) applyGlobeMode(false);
          }, 1150);

          viewer.camera.flyTo({
            destination: finalCameraPosition,
            orientation: { direction, up },
            duration: 2.2,
            easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
            complete: () => {
              window.clearTimeout(revealTimer);
              if (followIdRef.current !== flightId || viewer.isDestroyed()) return;
              applyGlobeMode(false);
              viewer.trackedEntity = ent;
            },
            cancel: () => window.clearTimeout(revealTimer),
          });
        };
        focusFlightRef.current = focusFlight;

        handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        handler.setInputAction((m: any) => {
          const picks = scene.drillPick(m.position, 64);
          const picked =
            picks.find((candidate: any) => candidate?.id?._meta?.kind === "flights") ??
            picks.find((candidate: any) => candidate?.id?._meta);
          const ent = picked?.id;
          const meta = ent?._meta;
          if (!meta) {
            releaseTargetLock();
            return;
          }
          resetHomeTransition();
          setSelection(meta);
          rotateRef.current = false;
          if (meta.kind === "flights") {
            focusFlight(meta.id);
          } else {
            setFlightFocused(Cesium, flightEntitiesRef.current.get(followIdRef.current ?? ""), false);
            followIdRef.current = null;
            viewer.trackedEntity = undefined;
            scene.requestRenderMode = !rotateRef.current;
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(meta.lng, meta.lat, 1.2e6),
              duration: 1.2,
            });
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction(
          () => {
            rotateRef.current = false;
            resetHomeTransition();
          },
          Cesium.ScreenSpaceEventType.LEFT_DOWN
        );

        // Smooth, fast, sensitive wheel zoom: each tick nudges a *target* height
        // and an eased per-frame loop glides the camera toward it. Rapid ticks
        // accumulate into one fluid motion instead of discrete jumps.
        let zoomTargetH: number | null = null;

        const recenterHome = () => {
          // When fully zoomed out, settle to a centred full-globe view (keep the
          // current longitude so the planet doesn't spin sideways).
          const cam = scene.camera;
          const lon = Cesium.Math.toDegrees(cam.positionCartographic.longitude);
          cam.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, 12, HOME_VIEW.height),
            orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 },
            duration: 0.9,
          });
        };

        onWheel = (event) => {
          event.preventDefault();
          rotateRef.current = false;
          viewer.camera.cancelFlight();
          const cam = scene.camera;
          const base = zoomTargetH ?? cam.positionCartographic.height;
          const zoomingOut = event.deltaY > 0;
          if (zoomingOut) releaseTargetLock();
          // Sensitivity scales with wheel delta; min step keeps it snappy.
          const step = Math.min(0.5, Math.max(0.06, Math.abs(event.deltaY) * 0.0024));
          zoomTargetH = Math.min(
            HOME_VIEW.height,
            Math.max(120, zoomingOut ? base * (1 + step) : base * (1 - step))
          );
          scene.requestRender();
        };
        scene.canvas.addEventListener("wheel", onWheel, { passive: false });

        // Eased zoom animator — runs only while a zoom target is pending.
        onZoomTick = () => {
          if (zoomTargetH == null || destroyed || viewer.isDestroyed()) return;
          const cam = scene.camera;
          const h = cam.positionCartographic.height;
          const diff = zoomTargetH - h;
          if (Math.abs(diff) < Math.max(2500, h * 0.004)) {
            const finalH = zoomTargetH;
            zoomTargetH = null;
            applyGlobeMode(finalH > SAT_THRESHOLD);
            if (finalH > HOME_VIEW.height * 0.9) recenterHome(); // centre when fully out
            return;
          }
          const stepH = diff * 0.22; // smooth easing toward the target
          if (stepH < 0) cam.zoomIn(-stepH);
          else cam.zoomOut(stepH);
          applyGlobeMode(h + stepH > SAT_THRESHOLD);
          scene.requestRender();
        };
        scene.preUpdate.addEventListener(onZoomTick);

        // Mobile pinch-zoom uses Cesium's native PINCH (no wheel event), so keep
        // the stylized↔satellite swap in sync with the camera height on every
        // settled camera move — this makes touch zoom transition like the wheel.
        onCameraMoveEnd = () => {
          if (destroyed || viewer.isDestroyed()) return;
          try {
            applyGlobeMode(scene.camera.positionCartographic.height > SAT_THRESHOLD);
          } catch {
            /* tearing down */
          }
        };
        scene.camera.moveEnd.addEventListener(onCameraMoveEnd);

        onKeyDown = (event) => {
          if (event.key === "Escape") releaseTargetLock();
        };
        window.addEventListener("keydown", onKeyDown);

        viewer.clock.onTick.addEventListener(() => {
          if (destroyed || !viewer || viewer.isDestroyed() || !rotateRef.current) return;
          try {
            if (scene.camera.positionCartographic.height > 5e6) {
              scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -0.0017);
            }
          } catch {
            /* viewer tearing down */
          }
        });

        // Request a modest animation cadence for moving aircraft while retaining
        // Cesium's on-demand rendering for the rest of the scene.
        flightAnimationTimer = setInterval(() => {
          if (!destroyed && !document.hidden && dsRef.current.flights?.show) {
            scene.requestRender();
          }
        }, 50);
        // Swallow transient tile/render errors so they don't spam the console.
        scene.renderError.addEventListener(() => {});

        void preloadPlaneSprite().then(() => {
          if (!destroyed) setReady(true);
        });
      })
      .catch((e) => console.error("[CesiumGlobe] load failed", e));

    return () => {
      destroyed = true;
      try {
        if (viewer && !viewer.isDestroyed()) {
          if (onWheel) viewer.scene.canvas.removeEventListener("wheel", onWheel);
          if (onZoomTick) viewer.scene.preUpdate.removeEventListener(onZoomTick);
          if (onCameraMoveEnd) viewer.scene.camera.moveEnd.removeEventListener(onCameraMoveEnd);
          if (onKeyDown) window.removeEventListener("keydown", onKeyDown);
          if (zoomAnimationFrame != null) cancelAnimationFrame(zoomAnimationFrame);
          if (flightAnimationTimer) clearInterval(flightAnimationTimer);
          gfxRef.current.stylized?.destroy();
          handler?.destroy();
          viewer.destroy();
        }
      } catch {
        /* noop */
      }
      viewerRef.current = null;
      focusFlightRef.current = null;
      applyGlobeModeRef.current = null;
      flightEntitiesRef.current.clear();
      flightMotionsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    rotateRef.current = autoRotate;
    const v = viewerRef.current;
    if (v && !v.isDestroyed()) {
      // Continuous while orbiting OR tracking a flight; on-demand otherwise.
      v.scene.requestRenderMode = !(autoRotate || followIdRef.current);
      v.scene.requestRender();
    }
  }, [autoRotate]);

  // Fly to a searched location in an oblique 3D view.
  useEffect(() => {
    const C = CRef.current;
    const v = viewerRef.current;
    if (!ready || !C || !v || v.isDestroyed() || !flyTo) return;
    rotateRef.current = false;
    setFlightFocused(C, flightEntitiesRef.current.get(followIdRef.current ?? ""), false);
    followIdRef.current = null;
    v.trackedEntity = undefined;
    applyGlobeModeRef.current?.(false);
    v.camera.flyTo({
      destination: C.Cartesian3.fromDegrees(flyTo.lng, flyTo.lat - 0.55, 30000),
      orientation: { heading: 0, pitch: C.Math.toRadians(-32), roll: 0 },
      duration: 2.4,
    });
  }, [flyTo, ready]);

  // Reset to the home (centred full-globe) view.
  useEffect(() => {
    const C = CRef.current;
    const v = viewerRef.current;
    if (!ready || !C || !v || v.isDestroyed() || !resetViewTs) return;
    setFlightFocused(C, flightEntitiesRef.current.get(followIdRef.current ?? ""), false);
    followIdRef.current = null;
    v.trackedEntity = undefined;
    rotateRef.current = false;
    v.camera.flyTo({
      destination: C.Cartesian3.fromDegrees(HOME_VIEW.lng, HOME_VIEW.lat, HOME_VIEW.height),
      orientation: { heading: 0, pitch: C.Math.toRadians(-90), roll: 0 },
      duration: 1.6,
    });
  }, [resetViewTs, ready]);

  // Stop following when the target is deselected.
  useEffect(() => {
    const v = viewerRef.current;
    if (!ready || !v || v.isDestroyed()) return;
    if (selection?.kind === "flights" && followIdRef.current !== selection.id) {
      focusFlightRef.current?.(selection.id);
      return;
    }
    if (!selection && followIdRef.current) {
      setFlightFocused(CRef.current, flightEntitiesRef.current.get(followIdRef.current), false);
      followIdRef.current = null;
      v.trackedEntity = undefined;
      v.scene.requestRenderMode = !rotateRef.current; // back to on-demand
      v.scene.requestRender();
    }
  }, [selection, ready]);

  // ── Layer visibility ──────────────────────────────────────────────────────
  useEffect(() => {
    const d = dsRef.current;
    if (!ready || !d.flights) return;
    d.flights.show = layers.flights;
    d.military.show = layers.military;
    d.quakes.show = layers.quakes;
    d.space.show = layers.space;
    d.flashpoints.show = layers.flashpoints;
    d.arcs.show = layers.flashpoints;
  }, [layers, ready]);

  // ── Flights ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const C = CRef.current;
    const ds = dsRef.current.flights;
    if (!ready || !C || !ds || !flights.data) return;
    const color = (h: string, a = 1) => C.Color.fromCssColorString(h).withAlpha(a);
    const now = Date.now();
    const activeIds = new Set<string>();
    for (const f of flights.data.data.slice(0, 15000)) {
      activeIds.add(f.id);
      const tracked = followIdRef.current === f.id;
      const trackColor = f.emergency
        ? "#EF4444"
        : f.stale || f.onGround
          ? "#94A3B8"
          : "#CFEFFF";
      const altitude = flightVisualAltitude(f);
      const sampleTimestamp = f.timePosition ?? f.lastContact ?? now;
      const sampleAgeSeconds = Math.min(180, Math.max(0, (now - sampleTimestamp) / 1000));
      const target =
        f.onGround || f.velocity < 2
          ? { lat: f.lat, lng: f.lng }
          : projectGreatCircle(f.lat, f.lng, f.heading, (f.velocity * sampleAgeSeconds) / 1000);
      const sampleKey = `${sampleTimestamp}:${f.lat.toFixed(5)}:${f.lng.toFixed(5)}`;
      const previousMotion = flightMotionsRef.current.get(f.id);
      if (!previousMotion || previousMotion.sampleKey !== sampleKey) {
        const current = previousMotion
          ? flightPositionAt(previousMotion, now)
          : { lat: target.lat, lng: target.lng, alt: altitude };
        flightMotionsRef.current.set(f.id, {
          startLat: current.lat,
          startLng: current.lng,
          startAlt: current.alt,
          targetLat: target.lat,
          targetLng: target.lng,
          targetAlt: altitude,
          heading: f.heading,
          velocity: f.velocity,
          verticalRate: f.verticalRate ?? 0,
          onGround: f.onGround,
          blendStartedAt: now,
          blendDurationMs: previousMotion ? FLIGHT_BLEND_MS : 0,
          sampleKey,
          seenAt: now,
        });
      } else {
        previousMotion.seenAt = now;
      }

      let e = flightEntitiesRef.current.get(f.id);
      if (!e) {
        e = ds.entities.add({
          id: `flight:${f.id}`,
          position: new C.CallbackProperty(() => {
            const motion = flightMotionsRef.current.get(f.id);
            if (!motion) return undefined;
            const position = flightPositionAt(motion, Date.now());
            const cameraHeight = viewerRef.current?.camera?.positionCartographic?.height ?? 0;
            const overviewClearance =
              45_000 * clamp01((cameraHeight - 1.0e6) / 8.0e6);
            return C.Cartesian3.fromDegrees(
              position.lng,
              position.lat,
              position.alt + overviewClearance
            );
          }, false),
          viewFrom: new C.Cartesian3(0, -1100, 620),
          billboard: {
            image: PLANE_IMG,
            width: FLIGHT_ICON_PX,
            height: FLIGHT_ICON_PX,
            color: color(trackColor, f.stale ? 0.6 : 1),
            rotation: C.Math.toRadians(-f.heading),
            alignedAxis: C.Cartesian3.ZERO,
            disableDepthTestDistance: FLIGHT_DEPTH_BYPASS_METRES,
          },
          label: {
            show: tracked,
            text: "",
            font: "600 12px monospace",
            fillColor: color("#FFFFFF"),
            showBackground: true,
            backgroundColor: color("#0A0E16", 0.82),
            pixelOffset: new C.Cartesian2(0, 34),
            horizontalOrigin: C.HorizontalOrigin.CENTER,
            disableDepthTestDistance: FLIGHT_DEPTH_BYPASS_METRES,
            scale: 0.9,
          },
        });
        flightEntitiesRef.current.set(f.id, e);
      }
      e.show = true;
      e._flightColor = trackColor;
      e._flightAlpha = f.stale ? 0.6 : 1;
      e.billboard.rotation = C.Math.toRadians(-f.heading);
      e.label.text = `${f.callsign}\n${Math.round(f.alt)} m · ${Math.round(f.velocity * 3.6)} km/h`;
      setFlightFocused(C, e, tracked);
      e._meta = {
        kind: "flights",
        id: f.id,
        title: f.emergency ? `EMERGENCY ${f.callsign}` : f.callsign,
        lat: f.lat,
        lng: f.lng,
        lines: [
          `ICAO24   ${f.id.toUpperCase()}`,
          `ORIGIN   ${f.origin}`,
          `SRC      ${f.positionSource ?? "UNKNOWN"}`,
          `CLASS    ${f.category ?? "AIRCRAFT"}`,
          `ALT      ${Math.round(f.alt)} m`,
          `SPD      ${Math.round(f.velocity * 3.6)} km/h`,
          `HDG      ${Math.round(f.heading)}°`,
          f.verticalRate != null ? `V/S      ${Math.round(f.verticalRate)} m/s` : null,
          f.squawk ? `SQUAWK   ${f.squawk}` : null,
          f.lastContact ? `CONTACT  ${timeAgo(f.lastContact)}` : null,
          `STATUS   ${f.emergency ? "ALERT" : f.onGround ? "ON GROUND" : f.stale ? "STALE" : "AIRBORNE"}`,
        ].filter(Boolean),
      };
    }
    for (const [id, entity] of flightEntitiesRef.current) {
      const motion = flightMotionsRef.current.get(id);
      if (!activeIds.has(id) && motion && now - motion.seenAt > FLIGHT_RETENTION_MS) {
        if (followIdRef.current !== id) {
          ds.entities.remove(entity);
          flightEntitiesRef.current.delete(id);
          flightMotionsRef.current.delete(id);
        }
      }
    }
    viewerRef.current?.scene?.requestRender?.();
  }, [flights.data, ready]);

  // ── Military (ADS-B) ──────────────────────────────────────────────────────
  useEffect(() => {
    const C = CRef.current;
    const ds = dsRef.current.military;
    if (!ready || !C || !ds || !military.data) return;
    const color = (h: string, a = 1) => C.Color.fromCssColorString(h).withAlpha(a);
    ds.entities.removeAll();
    for (const m of military.data.data.slice(0, 150)) {
      const e = ds.entities.add({
        position: C.Cartesian3.fromDegrees(m.lng, m.lat, Math.max(m.alt, 1000) + 24_000),
        point: { pixelSize: 6, color: color("#F5C842"), outlineColor: color("#F5C842", 0.4), outlineWidth: 1 },
      });
      e._meta = {
        kind: "military",
        id: m.id,
        title: `⬢ ${m.callsign}`,
        lat: m.lat,
        lng: m.lng,
        lines: [`TYPE ${m.origin}`, `ALT ${Math.round(m.alt)} m`, `SPD ${Math.round(m.velocity * 3.6)} km/h`, `CLASS MILITARY`],
      };
    }
    viewerRef.current?.scene?.requestRender?.();
  }, [military.data, ready]);

  // ── Quakes + flashpoints (top live quakes) + threat arcs ──────────────────
  useEffect(() => {
    const C = CRef.current;
    const q = dsRef.current.quakes;
    const fp = dsRef.current.flashpoints;
    const ar = dsRef.current.arcs;
    if (!ready || !C || !q || !quakes.data) return;
    const color = (h: string, a = 1) => C.Color.fromCssColorString(h).withAlpha(a);
    q.entities.removeAll();
    fp.entities.removeAll();
    ar.entities.removeAll();

    for (const quake of quakes.data.data) {
      const c = quake.mag >= 5 ? "#EF4444" : quake.mag >= 3 ? "#F97316" : "#F5C842";
      const e = q.entities.add({
        position: C.Cartesian3.fromDegrees(quake.lng, quake.lat, 22_000),
        point: {
          pixelSize: 3 + Math.max(0, quake.mag) * 2.2,
          color: color(c, 0.85),
          outlineColor: color(c, 0.3),
          outlineWidth: 1,
        },
      });
      e._meta = quakeMeta(quake);
    }

    const top = [...quakes.data.data]
      .filter((x) => x.mag >= 4.5)
      .sort((a, b) => b.mag - a.mag)
      .slice(0, 12);
    for (const quake of top) {
      const e = fp.entities.add({
        position: C.Cartesian3.fromDegrees(quake.lng, quake.lat, 30_000),
        point: { pixelSize: 10, color: color("#EF4444", 0.9), outlineColor: color("#EF4444", 0.35), outlineWidth: 6 },
        label: {
          text: `M${quake.mag.toFixed(1)}`,
          font: "600 11px monospace",
          fillColor: color("#EF4444"),
          showBackground: true,
          backgroundColor: color("#0D0F11", 0.85),
          pixelOffset: new C.Cartesian2(0, -18),
          scale: 0.9,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
      e._meta = quakeMeta(quake);

      ar.entities.add({
        polyline: {
          positions: arcPositions(C, BASE.lng, BASE.lat, quake.lng, quake.lat),
          width: 1.5,
          material: new C.PolylineGlowMaterialProperty({ glowPower: 0.25, color: color("#EF4444", 0.55) }),
        },
      });
    }
    viewerRef.current?.scene?.requestRender?.();
  }, [quakes.data, ready]);

  // ── Space (orbital assets) ────────────────────────────────────────────────
  useEffect(() => {
    const C = CRef.current;
    const ds = dsRef.current.space;
    if (!ready || !C || !ds || !space.data) return;
    const color = (h: string, a = 1) => C.Color.fromCssColorString(h).withAlpha(a);
    ds.entities.removeAll();
    for (const s of space.data.data) {
      const e = ds.entities.add({
        position: C.Cartesian3.fromDegrees(s.lng, s.lat, s.alt * 1000),
        point: { pixelSize: 8, color: color("#A78BFA"), outlineColor: color("#A78BFA", 0.4), outlineWidth: 2 },
        label: {
          text: s.name,
          font: "500 10px monospace",
          fillColor: color("#A78BFA"),
          showBackground: true,
          backgroundColor: color("#0D0F11", 0.85),
          pixelOffset: new C.Cartesian2(0, -16),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
      e._meta = {
        kind: "space",
        id: s.id,
        title: s.name,
        lat: s.lat,
        lng: s.lng,
        lines: [`NORAD ${s.id}`, `ALT ${s.alt.toFixed(0)} km`, `LAT/LNG ${s.lat.toFixed(2)}, ${s.lng.toFixed(2)}`],
      };
    }
    viewerRef.current?.scene?.requestRender?.();
  }, [space.data, ready]);

  return <div ref={containerRef} className="h-full w-full" />;
}

function quakeMeta(q: Quake) {
  return {
    kind: "quakes" as const,
    id: q.id,
    title: `M${q.mag.toFixed(1)} EVENT`,
    lat: q.lat,
    lng: q.lng,
    lines: [`LOC ${q.place}`, `MAG ${q.mag.toFixed(1)}`, `DEPTH ${q.depth.toFixed(0)} km`, `TIME ${timeAgo(q.time)}`],
  };
}

// Great-circle arc raised above the surface.
function arcPositions(C: any, lng1: number, lat1: number, lng2: number, lat2: number) {
  const start = C.Cartographic.fromDegrees(lng1, lat1);
  const end = C.Cartographic.fromDegrees(lng2, lat2);
  const geo = new C.EllipsoidGeodesic(start, end);
  const n = 60;
  const pts: any[] = [];
  for (let i = 0; i <= n; i++) {
    const fr = i / n;
    const p = geo.interpolateUsingFraction(fr);
    const arcH = 28_000 + Math.sin(Math.PI * fr) * geo.surfaceDistance * 0.18;
    pts.push(C.Cartesian3.fromRadians(p.longitude, p.latitude, arcH));
  }
  return pts;
}
