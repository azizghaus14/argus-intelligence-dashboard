/* eslint-disable @typescript-eslint/no-explicit-any */
// Stylized "digital globe": crisp batched country borders + country labels,
// a soft atmosphere, and a 3D particle starfield. Rebuilt for clarity + speed:
// borders are ONE batched primitive (not ~1000 entities), labels are GPU
// billboards, and there is NO per-frame JS loop — so it stays smooth at high FPS.

export interface StylizedHandles {
  atmosphere: any[];
  borders: any;
  land: any[];
  labels: any;
  stars: any;
  setShow: (show: boolean) => void;
  destroy: () => void;
}

export function buildStylizedGlobe(C: any, scene: any, viewer: any): StylizedHandles {
  let shown = true;
  const BORDER = C.Color.fromCssColorString("#2f5b80").withAlpha(0.8); // darker, subtle blue

  // ── Ocean: a subtle, camera-locked centre-lit dark navy (cheap fragment shader)
  const oceanMaterial = new C.Material({
    fabric: {
      source: `
        czm_material czm_getMaterial(czm_materialInput materialInput) {
          czm_material m = czm_getDefaultMaterial(materialInput);
          vec2 uv = (gl_FragCoord.xy - czm_viewport.xy) / czm_viewport.zw;
          float focus = 1.0 - smoothstep(0.10, 1.0, length((uv - vec2(0.5, 0.5)) / vec2(0.66, 0.74)));
          m.diffuse = mix(vec3(0.004, 0.010, 0.030), vec3(0.012, 0.034, 0.082), pow(focus, 0.7));
          m.emission = m.diffuse * 0.12;
          m.alpha = 1.0;
          return m;
        }`,
    },
    translucent: false,
  });

  // ── Land: flat, slightly lifted navy fill (one batched primitive)
  const landMaterial = C.Material.fromType("Color", {
    color: C.Color.fromCssColorString("#070f1e"),
  });
  const land: any[] = [];
  const labels = scene.primitives.add(new C.LabelCollection());

  const ringPositions = (ring: any[]) => {
    const valid = ring.filter((c) => Number.isFinite(c?.[0]) && Number.isFinite(c?.[1]));
    if (valid.length > 3 && valid[0][0] === valid[valid.length - 1][0] && valid[0][1] === valid[valid.length - 1][1]) valid.pop();
    if (valid.length < 3) return null;
    const flat: number[] = [];
    for (const c of valid) flat.push(c[0], c[1]);
    return C.Cartesian3.fromDegreesArray(flat);
  };

  let bordersPrim: any = null;

  fetch("/ne_countries.geojson")
    .then((r) => r.json())
    .then((geo: any) => {
      if (viewer.isDestroyed()) return;
      const landInstances: any[] = [];
      const borderInstances: any[] = [];

      for (const feature of geo.features ?? []) {
        const g = feature.geometry;
        const p = feature.properties ?? {};
        if (!g) continue;
        const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];

        for (const poly of polys) {
          // filled land
          try {
            const outer = ringPositions(poly[0]);
            if (outer) {
              const holes = poly.slice(1).map((ring: any[]) => ringPositions(ring)).filter(Boolean).map((pos: any) => new C.PolygonHierarchy(pos));
              const geom = C.PolygonGeometry.createGeometry(
                new C.PolygonGeometry({
                  polygonHierarchy: new C.PolygonHierarchy(outer, holes),
                  height: 6_000,
                  vertexFormat: C.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                })
              );
              if (geom) landInstances.push(new C.GeometryInstance({ geometry: geom }));
            }
          } catch {
            /* degenerate ring */
          }

          // one batched polyline per ring (crisp, single draw call overall)
          for (const ring of poly) {
            if (ring.length < 2) continue;
            const flat: number[] = [];
            for (const c of ring) if (Number.isFinite(c?.[0]) && Number.isFinite(c?.[1])) flat.push(c[0], c[1], 22_000);
            if (flat.length < 6) continue;
            try {
              borderInstances.push(
                new C.GeometryInstance({
                  geometry: new C.PolylineGeometry({
                    positions: C.Cartesian3.fromDegreesArrayHeights(flat),
                    width: 0.7,
                    arcType: C.ArcType.GEODESIC,
                    vertexFormat: C.PolylineColorAppearance.VERTEX_FORMAT,
                  }),
                  attributes: { color: C.ColorGeometryInstanceAttribute.fromColor(BORDER) },
                })
              );
            } catch {
              /* skip */
            }
          }
        }

        // country label at the Natural Earth label anchor (fallback: rough centroid)
        const name = p.NAME || p.NAME_LONG || p.ADMIN;
        let lon = p.LABEL_X;
        let lat = p.LABEL_Y;
        if ((lon == null || lat == null) && polys[0]?.[0]) {
          const ring = polys[0][0];
          let sx = 0, sy = 0, n = 0;
          for (const c of ring) { if (Number.isFinite(c?.[0])) { sx += c[0]; sy += c[1]; n++; } }
          if (n) { lon = sx / n; lat = sy / n; }
        }
        if (name && Number.isFinite(lon) && Number.isFinite(lat)) {
          labels.add({
            position: C.Cartesian3.fromDegrees(lon, lat, 25_000),
            // Pull the label toward the camera in eye space so it always sits IN
            // FRONT of the curved surface — it never clips into / sinks behind
            // the globe near the limb — while depth-testing still hides the
            // labels on the far side of the globe.
            eyeOffset: new C.Cartesian3(0, 0, -64_000),
            text: String(name).toUpperCase(),
            font: "600 12px Inter, system-ui, sans-serif",
            fillColor: C.Color.fromCssColorString("#cfe2f7").withAlpha(0.9),
            outlineColor: C.Color.fromCssColorString("#02080f").withAlpha(0.95),
            outlineWidth: 2.5,
            style: C.LabelStyle.FILL_AND_OUTLINE,
            horizontalOrigin: C.HorizontalOrigin.CENTER,
            verticalOrigin: C.VerticalOrigin.CENTER,
            scaleByDistance: new C.NearFarScalar(2.0e6, 1.05, 3.0e7, 0.5),
            translucencyByDistance: new C.NearFarScalar(2.5e6, 1.0, 3.2e7, 0.2),
            show: shown,
          });
        }
      }

      if (landInstances.length && !viewer.isDestroyed()) {
        land.push(
          scene.primitives.add(
            new C.Primitive({
              geometryInstances: landInstances,
              appearance: new C.EllipsoidSurfaceAppearance({ aboveGround: true, flat: true, material: landMaterial, translucent: false }),
              asynchronous: false,
            })
          )
        );
      }
      if (borderInstances.length && !viewer.isDestroyed()) {
        bordersPrim = scene.primitives.add(
          new C.Primitive({
            geometryInstances: borderInstances,
            appearance: new C.PolylineColorAppearance({ translucent: true }),
            asynchronous: false,
            show: shown,
          })
        );
      }
      if (!viewer.isDestroyed()) scene.requestRender();
    })
    .catch(() => {});

  // No ellipsoid atmosphere shells — they read as hard "circles" ringing the
  // globe. The soft limb glow now comes purely from Cesium's skyAtmosphere
  // (configured in CesiumGlobe) plus the screen-space halo behind the canvas.
  const atmosphere: any[] = [];

  // ── Particle starfield (instanced points)
  const stars = scene.primitives.add(new C.PointPrimitiveCollection());
  const palette = ["#bfe9ff", "#cdd9ff", "#ffffff", "#9fd0e6", "#aeb9d8", "#8fe6dc"];
  const R = 6.371e6;
  for (let i = 0; i < 1200; i++) {
    const u = Math.random() * 2 - 1;
    const theta = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const dir = new C.Cartesian3(s * Math.cos(theta), s * Math.sin(theta), u);
    const radius = R * 1.1 + Math.random() * R * 4.2;
    stars.add({
      position: C.Cartesian3.multiplyByScalar(dir, radius, new C.Cartesian3()),
      pixelSize: 1 + Math.pow(Math.random(), 3) * 6,
      color: C.Color.fromCssColorString(palette[(Math.random() * palette.length) | 0]).withAlpha(0.18 + Math.random() * 0.55),
      scaleByDistance: new C.NearFarScalar(1.0e7, 1.4, 6.0e7, 0.4),
    });
  }

  // ── Crisp VECTOR place labels for the satellite view (our own font, never
  // pixelated like the baked raster tile labels). Shown only in satellite mode
  // and decluttered by importance: major cities appear from high up, smaller
  // towns only when you zoom right in.
  const cityLabels = scene.primitives.add(new C.LabelCollection());
  // Camera→label distance at which a label switches on, by scalerank (0 = major
  // world city … 10 = minor town). Lower rank → visible from higher altitude.
  const FAR_BY_RANK = [1.7e6, 1.4e6, 1.15e6, 9.0e5, 7.0e5, 5.5e5, 4.3e5, 3.4e5, 2.7e5, 2.1e5, 1.7e5];
  fetch("/cities.json")
    .then((r) => r.json())
    .then((rows: any[]) => {
      if (viewer.isDestroyed()) return;
      // Cap the number of labels — the file is sorted major-first, so this keeps
      // the most important cities. Too many labels overflow Cesium's glyph
      // billboard batching and crash the renderer.
      let added = 0;
      for (const row of rows) {
        if (added >= 700) break;
        const name = row[0];
        const lon = row[1];
        const lat = row[2];
        const rank = row[3] | 0;
        const cap = row[4];
        if (!name || !Number.isFinite(lon) || !Number.isFinite(lat)) continue;
        added++;
        let far = FAR_BY_RANK[Math.max(0, Math.min(10, rank))];
        if (cap) far = Math.max(far, 2.4e6); // capitals stay visible from higher up
        // Simplest possible depth-tested label — NO eyeOffset, NO
        // DistanceDisplayCondition, NO disableDepthTestDistance. Each of those
        // fed an invalid near distance into Cesium's multi-frustum culling and
        // crashed the renderer. Visibility is gated purely by a per-rank
        // translucency fade (minor towns fade out beyond their `far` distance).
        cityLabels.add({
          position: C.Cartesian3.fromDegrees(lon, lat, 100),
          text: String(name),
          font: cap ? "600 13px Inter, system-ui, sans-serif" : "500 12px Inter, system-ui, sans-serif",
          fillColor: C.Color.fromCssColorString("#ffffff"),
          outlineColor: C.Color.fromCssColorString("#0a1018").withAlpha(0.95),
          outlineWidth: 3,
          style: C.LabelStyle.FILL_AND_OUTLINE,
          horizontalOrigin: C.HorizontalOrigin.CENTER,
          verticalOrigin: C.VerticalOrigin.CENTER,
          scaleByDistance: new C.NearFarScalar(2.0e5, 1.0, 1.6e6, 0.55),
          translucencyByDistance: new C.NearFarScalar(far * 0.7, 1.0, far, 0.0),
          // Per-label show stays true; the COLLECTION's `.show` (toggled in
          // setShow) gates satellite vs stylized. (Don't gate per-label on
          // `shown` here — it races with the async fetch and left labels hidden.)
        });
      }
      if (!viewer.isDestroyed()) scene.requestRender();
    })
    .catch(() => {});

  const setShow = (show: boolean) => {
    shown = show;
    for (const shell of atmosphere) shell.show = show;
    if (bordersPrim) bordersPrim.show = show;
    for (const p of land) p.show = show;
    labels.show = show; // country labels — stylized overview
    cityLabels.show = !show; // city labels — satellite view
    stars.show = show;
    scene.globe.material = show ? oceanMaterial : undefined;
  };

  const destroy = () => {
    if (scene.globe.material === oceanMaterial) scene.globe.material = undefined;
    if (!viewer.isDestroyed()) {
      for (const shell of atmosphere) scene.primitives.remove(shell);
      if (bordersPrim) scene.primitives.remove(bordersPrim);
      for (const p of land) scene.primitives.remove(p);
      scene.primitives.remove(labels);
      scene.primitives.remove(cityLabels);
      scene.primitives.remove(stars);
    }
  };

  return { atmosphere, borders: null, land, labels, stars, setShow, destroy };
}
