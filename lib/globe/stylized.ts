/* eslint-disable @typescript-eslint/no-explicit-any */
// Builds the stylized "digital globe" look in Cesium: glowing animated country
// borders + a 3D particle starfield. Returned handles let the caller toggle
// visibility when switching between the stylized overview and satellite view.

export interface StylizedHandles {
  atmosphere: any[];
  borders: any;
  land: any[];
  stars: any;
  setShow: (show: boolean) => void;
  destroy: () => void;
}

export function buildStylizedGlobe(C: any, scene: any, viewer: any): StylizedHandles {
  // Both surface materials use fragment coordinates, so their lighting remains
  // fixed to the camera while the geography rotates beneath it.
  const oceanMaterial = new C.Material({
    fabric: {
      source: `
        czm_material czm_getMaterial(czm_materialInput materialInput)
        {
          czm_material material = czm_getDefaultMaterial(materialInput);
          vec2 uv = (gl_FragCoord.xy - czm_viewport.xy) / czm_viewport.zw;
          vec2 p = (uv - vec2(0.50, 0.53)) / vec2(0.64, 0.72);
          float focus = 1.0 - smoothstep(0.08, 1.0, length(p));
          float sweep = smoothstep(0.0, 1.0, 1.0 - uv.x) * 0.12;
          vec3 deepOcean = vec3(0.001, 0.004, 0.018);
          vec3 litOcean = vec3(0.005, 0.020, 0.065);
          material.diffuse = mix(deepOcean, litOcean, pow(focus, 0.72) + sweep);
          material.emission = material.diffuse * 0.10;
          material.alpha = 1.0;
          return material;
        }
      `,
    },
    translucent: false,
  });

  const landMaterial = new C.Material({
    fabric: {
      source: `
        czm_material czm_getMaterial(czm_materialInput materialInput)
        {
          czm_material material = czm_getDefaultMaterial(materialInput);
          vec2 uv = (gl_FragCoord.xy - czm_viewport.xy) / czm_viewport.zw;
          vec2 p = (uv - vec2(0.48, 0.54)) / vec2(0.62, 0.72);
          float focus = 1.0 - smoothstep(0.10, 1.02, length(p));
          vec3 edgeLand = vec3(0.005, 0.014, 0.045);
          vec3 litLand = vec3(0.016, 0.052, 0.145);
          material.diffuse = mix(edgeLand, litLand, pow(focus, 0.68));
          material.emission = material.diffuse * 0.10;
          material.alpha = 1.0;
          return material;
        }
      `,
    },
    translucent: false,
  });

  // Short segments let the glow respond to screen position instead of being
  // baked into the rotating geography. This keeps the brightest detail in the
  // camera centre and lets it fall away naturally toward the frame edges.
  const borders = new C.CustomDataSource("borders");
  viewer.dataSources.add(borders);
  const land: any[] = [];
  const borderColor = C.Color.fromCssColorString("#48aef0");
  const borderSegments: Array<{
    anchor: any;
    color: any;
    alpha: number;
    glow: number;
    width: number;
  }> = [];
  const pointsPerSegment = 12;
  let shown = true;

  const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
  const smoothstep = (edge0: number, edge1: number, value: number) => {
    const t = clamp01((value - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  };

  fetch("/ne_countries.geojson")
    .then((r) => r.json())
    .then((geo: any) => {
      const landInstances: any[] = [];
      const ringPositions = (ring: any[]) => {
        const valid = ring.filter(
          (coord) => Number.isFinite(coord?.[0]) && Number.isFinite(coord?.[1])
        );
        if (
          valid.length > 3 &&
          valid[0][0] === valid[valid.length - 1][0] &&
          valid[0][1] === valid[valid.length - 1][1]
        ) {
          valid.pop();
        }
        if (valid.length < 3) return null;
        const flat: number[] = [];
        for (const coord of valid) flat.push(coord[0], coord[1]);
        return C.Cartesian3.fromDegreesArray(flat);
      };

      for (const feature of geo.features ?? []) {
        const g = feature.geometry;
        if (!g) continue;
        const polys =
          g.type === "Polygon"
            ? [g.coordinates]
            : g.type === "MultiPolygon"
              ? g.coordinates
              : [];
        for (const poly of polys) {
          try {
            const outer = ringPositions(poly[0]);
            if (outer) {
              const holes = poly
                .slice(1)
                .map((ring: any[]) => ringPositions(ring))
                .filter(Boolean)
                .map((positions: any) => new C.PolygonHierarchy(positions));
              const polygon = new C.PolygonGeometry({
                polygonHierarchy: new C.PolygonHierarchy(outer, holes),
                height: 12_000,
                vertexFormat: C.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
              });
              const geometry = C.PolygonGeometry.createGeometry(polygon);
              if (geometry) landInstances.push(new C.GeometryInstance({ geometry }));
            }
          } catch {
            // A few polar/dateline rings are degenerate after projection.
          }

          for (const ring of poly) {
            if (ring.length < 3) continue;
            for (let start = 0; start < ring.length - 1; start += pointsPerSegment - 1) {
              const coords = ring.slice(start, Math.min(ring.length, start + pointsPerSegment));
              if (coords.length < 2) continue;
              const flat: number[] = [];
              for (const coord of coords) flat.push(coord[0], coord[1], 28_000);
              const positions = C.Cartesian3.fromDegreesArrayHeights(flat);
              const state = {
                anchor: positions[Math.floor(positions.length / 2)],
                color: borderColor.withAlpha(0.9),
                alpha: 0.9,
                glow: 0.4,
                width: 2.2,
              };
              borderSegments.push(state);
              borders.entities.add({
                polyline: {
                  positions,
                  width: new C.CallbackProperty(() => state.width, false),
                  material: new C.PolylineGlowMaterialProperty({
                    glowPower: new C.CallbackProperty(() => state.glow, false),
                    taperPower: 1.0,
                    color: new C.CallbackProperty(() => state.color, false),
                  }),
                  arcType: C.ArcType.GEODESIC,
                },
              });
            }
          }
        }
      }
      if (landInstances.length && !viewer.isDestroyed()) {
        land.push(
          scene.primitives.add(
            new C.Primitive({
              geometryInstances: landInstances,
              appearance: new C.EllipsoidSurfaceAppearance({
                aboveGround: true,
                flat: true,
                material: landMaterial,
                translucent: false,
              }),
              asynchronous: false,
            })
          )
        );
      }
      if (!viewer.isDestroyed()) scene.requestRender();
    })
    .catch(() => {});

  const screenPosition = new C.Cartesian2();
  const surfaceNormal = new C.Cartesian3();
  const towardCamera = new C.Cartesian3();
  let lastFadeUpdate = 0;
  const updateCameraLockedFade = () => {
    if (!shown || viewer.isDestroyed()) return;
    const now = performance.now();
    if (now - lastFadeUpdate < 32) return;
    lastFadeUpdate = now;

    const canvas = scene.canvas;
    const halfWidth = Math.max(1, canvas.clientWidth * 0.5);
    const halfHeight = Math.max(1, canvas.clientHeight * 0.5);
    for (const state of borderSegments) {
      C.Cartesian3.normalize(state.anchor, surfaceNormal);
      C.Cartesian3.subtract(scene.camera.positionWC, state.anchor, towardCamera);
      C.Cartesian3.normalize(towardCamera, towardCamera);
      const facing = C.Cartesian3.dot(surfaceNormal, towardCamera);
      const projected = scene.cartesianToCanvasCoordinates(state.anchor, screenPosition);

      let strength = 0;
      if (projected && facing > -0.02) {
        const x = (projected.x - halfWidth) / halfWidth;
        const y = (projected.y - halfHeight) / halfHeight;
        const radialDistance = Math.sqrt(x * x + y * y);
        const centreFade = 1 - smoothstep(0.18, 1.04, radialDistance);
        const horizonFade = smoothstep(-0.02, 0.18, facing);
        strength = clamp01(centreFade * horizonFade);
      }

      // Thin, subtle, glowing borders — bloom does the glow, so the line core
      // stays fine. Brightest toward the camera centre, faint at the edges.
      state.alpha = 0.09 + strength * 0.46;
      state.glow = 0.54 + strength * 0.20;
      state.width = 0.5 + strength * 0.55;
      C.Color.clone(borderColor, state.color);
      state.color.alpha = state.alpha;
    }
  };
  scene.preRender.addEventListener(updateCameraLockedFade);

  // Two concentric atmosphere shells: a broad rear-space bloom and a tighter
  // front limb. Both are true ellipsoids, so neither can detach during tilt.
  const rearAtmosphereMaterial = new C.Material({
    fabric: {
      source: `
        czm_material czm_getMaterial(czm_materialInput materialInput)
        {
          czm_material material = czm_getDefaultMaterial(materialInput);
          vec3 normal = normalize(materialInput.normalEC);
          vec3 toEye = normalize(materialInput.positionToEyeEC);
          float fresnel = pow(1.0 - clamp(abs(dot(normal, toEye)), 0.0, 1.0), 1.0);
          vec3 glow = mix(vec3(0.05, 0.11, 0.26), vec3(0.20, 0.42, 0.80), fresnel);
          material.diffuse = glow;
          material.emission = glow * 1.0;
          material.alpha = fresnel * 0.06;
          return material;
        }
      `,
    },
    translucent: true,
  });
  const frontAtmosphereMaterial = new C.Material({
    fabric: {
      source: `
        czm_material czm_getMaterial(czm_materialInput materialInput)
        {
          czm_material material = czm_getDefaultMaterial(materialInput);
          vec3 normal = normalize(materialInput.normalEC);
          vec3 toEye = normalize(materialInput.positionToEyeEC);
          float fresnel = pow(1.0 - clamp(abs(dot(normal, toEye)), 0.0, 1.0), 0.85);
          vec3 glow = mix(vec3(0.06, 0.22, 0.36), vec3(0.34, 0.66, 1.0), fresnel);
          material.diffuse = glow;
          material.emission = glow * 0.8;
          material.alpha = fresnel * 0.05;
          return material;
        }
      `,
    },
    translucent: true,
  });
  const earthRadii = C.Ellipsoid.WGS84.radii;
  const rearAtmosphere = scene.primitives.add(
    new C.EllipsoidPrimitive({
      radii: new C.Cartesian3(
        earthRadii.x * 1.18,
        earthRadii.y * 1.18,
        earthRadii.z * 1.18
      ),
      material: rearAtmosphereMaterial,
      depthTestEnabled: false,
      show: shown,
    })
  );
  const frontAtmosphere = scene.primitives.add(
    new C.EllipsoidPrimitive({
      radii: new C.Cartesian3(
        earthRadii.x * 1.05,
        earthRadii.y * 1.05,
        earthRadii.z * 1.05
      ),
      material: frontAtmosphereMaterial,
      depthTestEnabled: true,
      show: shown,
    })
  );
  const atmosphere = [rearAtmosphere, frontAtmosphere];

  // ── Floating 3D particle starfield (bokeh-ish, lifted by bloom) ────────────
  const stars = scene.primitives.add(new C.PointPrimitiveCollection());
  const palette = ["#bfe9ff", "#cdd9ff", "#ffffff", "#9fd0e6", "#aeb9d8", "#8fe6dc"];
  const R = 6.371e6;
  for (let i = 0; i < 1200; i++) {
    const u = Math.random() * 2 - 1;
    const theta = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const dir = new C.Cartesian3(s * Math.cos(theta), s * Math.sin(theta), u);
    const radius = R * 1.08 + Math.random() * R * 4.2;
    const pos = C.Cartesian3.multiplyByScalar(dir, radius, new C.Cartesian3());
    const color = C.Color.fromCssColorString(
      palette[(Math.random() * palette.length) | 0]
    ).withAlpha(0.18 + Math.random() * 0.55);
    stars.add({
      position: pos,
      pixelSize: 1 + Math.pow(Math.random(), 3) * 7,
      color,
      scaleByDistance: new C.NearFarScalar(1.0e7, 1.4, 6.0e7, 0.4),
    });
  }

  const setShow = (show: boolean) => {
    shown = show;
    for (const shell of atmosphere) shell.show = show;
    borders.show = show;
    for (const primitive of land) primitive.show = show;
    stars.show = show;
    scene.globe.material = show ? oceanMaterial : undefined;
  };

  const destroy = () => {
    scene.preRender.removeEventListener(updateCameraLockedFade);
    if (scene.globe.material === oceanMaterial) scene.globe.material = undefined;
    if (!viewer.isDestroyed()) {
      for (const shell of atmosphere) scene.primitives.remove(shell);
    }
  };

  return { atmosphere, borders, land, stars, setShow, destroy };
}
