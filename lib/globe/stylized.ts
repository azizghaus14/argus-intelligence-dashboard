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
  const BORDER = C.Color.fromCssColorString("#5cc0ff"); // crisp blue, faint teal

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
    color: C.Color.fromCssColorString("#0d2748"),
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
                    width: 1.6,
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
            position: C.Cartesian3.fromDegrees(lon, lat, 30_000),
            text: String(name).toUpperCase(),
            font: "600 12px Inter, system-ui, sans-serif",
            fillColor: C.Color.fromCssColorString("#dceaff").withAlpha(0.92),
            outlineColor: C.Color.fromCssColorString("#04101f").withAlpha(0.9),
            outlineWidth: 2.5,
            style: C.LabelStyle.FILL_AND_OUTLINE,
            horizontalOrigin: C.HorizontalOrigin.CENTER,
            verticalOrigin: C.VerticalOrigin.CENTER,
            scaleByDistance: new C.NearFarScalar(2.0e6, 1.05, 3.0e7, 0.5),
            translucencyByDistance: new C.NearFarScalar(2.5e6, 1.0, 3.2e7, 0.18),
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

  // ── Soft atmosphere: two static fresnel shells (no per-frame cost)
  const shellMat = (power: number, lo: string, hi: string, mul: number, alpha: number) =>
    new C.Material({
      fabric: {
        source: `
          czm_material czm_getMaterial(czm_materialInput materialInput) {
            czm_material m = czm_getDefaultMaterial(materialInput);
            vec3 n = normalize(materialInput.normalEC);
            vec3 e = normalize(materialInput.positionToEyeEC);
            float f = pow(1.0 - clamp(abs(dot(n, e)), 0.0, 1.0), ${power.toFixed(2)});
            vec3 glow = mix(${lo}, ${hi}, f);
            m.diffuse = glow; m.emission = glow * ${mul.toFixed(2)}; m.alpha = f * ${alpha.toFixed(3)};
            return m;
          }`,
      },
      translucent: true,
    });
  const radii = C.Ellipsoid.WGS84.radii;
  const mkShell = (scale: number, mat: any, depth: boolean) =>
    scene.primitives.add(
      new C.EllipsoidPrimitive({ radii: new C.Cartesian3(radii.x * scale, radii.y * scale, radii.z * scale), material: mat, depthTestEnabled: depth, show: shown })
    );
  const atmosphere = [
    mkShell(1.16, shellMat(1.0, "vec3(0.04,0.10,0.24)", "vec3(0.18,0.40,0.82)", 1.0, 0.07), false),
    mkShell(1.045, shellMat(0.9, "vec3(0.06,0.22,0.38)", "vec3(0.36,0.68,1.0)", 0.8, 0.05), true),
  ];

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

  const setShow = (show: boolean) => {
    shown = show;
    for (const shell of atmosphere) shell.show = show;
    if (bordersPrim) bordersPrim.show = show;
    for (const p of land) p.show = show;
    labels.show = show;
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
      scene.primitives.remove(stars);
    }
  };

  return { atmosphere, borders: null, land, labels, stars, setShow, destroy };
}
