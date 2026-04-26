# Fractals Reference

Recursive constructions for classical mathematical fractals, all rendered as wireframe in 3D. Every algorithm is bounded by an explicit depth parameter — the cap matters because edge counts grow exponentially.

## Table of contents

1. Sierpinski triangle (2D)
2. Sierpinski tetrahedron (3D)
3. Menger sponge
4. Koch snowflake / Koch curve
5. Cantor set / Cantor dust
6. Barnsley fern (IFS)
7. Mandelbrot / Julia wireframe
8. Edge-count growth tables (cap recommendations)

---

## 1. Sierpinski triangle (2D, lifted to z=0 for 3D scenes)

Start with an equilateral triangle. At each recursion, replace it with three smaller triangles at its corners (omitting the central inverted triangle).

```ts
type Triangle2D = [[number, number], [number, number], [number, number]]

function sierpinskiTriangles(
  initial: Triangle2D,
  depth: number,
): Triangle2D[] {
  if (depth <= 0) return [initial]
  const [a, b, c] = initial
  const ab: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const bc: [number, number] = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2]
  const ca: [number, number] = [(c[0] + a[0]) / 2, (c[1] + a[1]) / 2]
  return [
    ...sierpinskiTriangles([a, ab, ca], depth - 1),
    ...sierpinskiTriangles([ab, b, bc], depth - 1),
    ...sierpinskiTriangles([ca, bc, c], depth - 1),
  ]
}

function trianglesToEdges(
  triangles: Triangle2D[],
): { vertices: [number, number, number][]; edges: [number, number][] } {
  const vertices: [number, number, number][] = []
  const edges: [number, number][] = []
  triangles.forEach(([a, b, c]) => {
    const i0 = vertices.length
    vertices.push([a[0], a[1], 0], [b[0], b[1], 0], [c[0], c[1], 0])
    edges.push([i0, i0 + 1], [i0 + 1, i0 + 2], [i0 + 2, i0])
  })
  return { vertices, edges }
}
```

Edge count at depth `d`: `3^(d+1)` triangle edges (with triplication at shared edges; deduplicate if rendering identical edges is wasteful).

Recommended depth cap: **8** (= 19,683 triangles).

---

## 2. Sierpinski tetrahedron (3D)

The 3D analogue: at each recursion, replace a tetrahedron with four smaller tetrahedra at its corners.

```ts
type Vec3 = [number, number, number]
type Tetrahedron = [Vec3, Vec3, Vec3, Vec3]

function midpoint(a: Vec3, b: Vec3): Vec3 {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
}

function sierpinskiTetrahedra(
  initial: Tetrahedron,
  depth: number,
): Tetrahedron[] {
  if (depth <= 0) return [initial]
  const [a, b, c, d] = initial
  const ab = midpoint(a, b), ac = midpoint(a, c), ad = midpoint(a, d)
  const bc = midpoint(b, c), bd = midpoint(b, d), cd = midpoint(c, d)
  return [
    ...sierpinskiTetrahedra([a, ab, ac, ad], depth - 1),
    ...sierpinskiTetrahedra([ab, b, bc, bd], depth - 1),
    ...sierpinskiTetrahedra([ac, bc, c, cd], depth - 1),
    ...sierpinskiTetrahedra([ad, bd, cd, d], depth - 1),
  ]
}

function tetrahedraToEdges(
  tetrahedra: Tetrahedron[],
): { vertices: Vec3[]; edges: [number, number][] } {
  const vertices: Vec3[] = []
  const edges: [number, number][] = []
  tetrahedra.forEach(([a, b, c, d]) => {
    const i0 = vertices.length
    vertices.push(a, b, c, d)
    // 6 edges of a tetrahedron
    edges.push(
      [i0, i0+1], [i0, i0+2], [i0, i0+3],
      [i0+1, i0+2], [i0+1, i0+3], [i0+2, i0+3],
    )
  })
  return { vertices, edges }
}

// Standard regular tetrahedron at origin, circumradius √3:
const initialTetrahedron: Tetrahedron = [
  [ 1,  1,  1],
  [ 1, -1, -1],
  [-1,  1, -1],
  [-1, -1,  1],
]
```

Edge count: `6 × 4^d` (with shared edges between sub-tetrahedra; dedup if needed).

Recommended depth cap: **6** (= 4,096 tetrahedra, 24,576 edges).

---

## 3. Menger sponge

Start with a cube. Subdivide it into 27 sub-cubes (3×3×3 grid). Remove the centre sub-cube and the 6 face-centre sub-cubes. Recurse on the remaining 20 sub-cubes.

```ts
interface CubeBox {
  center: Vec3
  size: number
}

function isMengerKept(i: number, j: number, k: number): boolean {
  // Remove cubes where two or more of (i, j, k) equal 1 (the middle index).
  let middleCount = 0
  if (i === 1) middleCount++
  if (j === 1) middleCount++
  if (k === 1) middleCount++
  return middleCount < 2
}

function mengerSubcubes(cube: CubeBox, depth: number): CubeBox[] {
  if (depth <= 0) return [cube]
  const result: CubeBox[] = []
  const newSize = cube.size / 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        if (!isMengerKept(i, j, k)) continue
        const offset = (idx: number) => (idx - 1) * newSize
        const center: Vec3 = [
          cube.center[0] + offset(i),
          cube.center[1] + offset(j),
          cube.center[2] + offset(k),
        ]
        result.push(...mengerSubcubes({ center, size: newSize }, depth - 1))
      }
    }
  }
  return result
}

function cubeBoxToWireframe(box: CubeBox): { vertices: Vec3[]; edges: [number, number][] } {
  const h = box.size / 2
  const [cx, cy, cz] = box.center
  const vertices: Vec3[] = [
    [cx-h, cy-h, cz-h], [cx+h, cy-h, cz-h], [cx+h, cy+h, cz-h], [cx-h, cy+h, cz-h],
    [cx-h, cy-h, cz+h], [cx+h, cy-h, cz+h], [cx+h, cy+h, cz+h], [cx-h, cy+h, cz+h],
  ]
  const edges: [number, number][] = [
    [0,1],[1,2],[2,3],[3,0], [4,5],[5,6],[6,7],[7,4], [0,4],[1,5],[2,6],[3,7],
  ]
  return { vertices, edges }
}
```

Sub-cube count per level: 20. So depth `d` yields `20^d` cubes, each with 12 edges.

| Depth | Cubes | Edges (max, no dedup) |
|---|---|---|
| 0 | 1 | 12 |
| 1 | 20 | 240 |
| 2 | 400 | 4,800 |
| 3 | 8,000 | 96,000 |
| 4 | 160,000 | 1,920,000 |
| 5 | 3,200,000 | 38,400,000 |

Recommended depth cap: **3** for interactive rendering, **4** for static stills only.

---

## 4. Koch snowflake / Koch curve

The Koch curve: divide a line segment into thirds, replace the middle third with two sides of an equilateral triangle pointing outward.

```ts
function kochCurve(a: Vec3, b: Vec3, depth: number): Vec3[] {
  // Returns the polyline as a sequence of points, including endpoints.
  if (depth <= 0) return [a, b]

  // Divide into thirds
  const p1: Vec3 = [
    a[0] + (b[0] - a[0]) / 3,
    a[1] + (b[1] - a[1]) / 3,
    a[2] + (b[2] - a[2]) / 3,
  ]
  const p2: Vec3 = [
    a[0] + 2 * (b[0] - a[0]) / 3,
    a[1] + 2 * (b[1] - a[1]) / 3,
    a[2] + 2 * (b[2] - a[2]) / 3,
  ]

  // Apex of the triangular bump (in 2D, lifted to 3D with z preserved)
  // Rotate (p2 - p1) by +60° around z-axis
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1]
  const cos60 = 0.5, sin60 = Math.sqrt(3) / 2
  const apex: Vec3 = [
    p1[0] + dx * cos60 - dy * sin60,
    p1[1] + dx * sin60 + dy * cos60,
    p1[2],
  ]

  return [
    ...kochCurve(a, p1, depth - 1),
    ...kochCurve(p1, apex, depth - 1).slice(1),
    ...kochCurve(apex, p2, depth - 1).slice(1),
    ...kochCurve(p2, b, depth - 1).slice(1),
  ]
}

function kochSnowflake(radius: number, depth: number): Vec3[] {
  // Three sides of an equilateral triangle, each a Koch curve.
  const v1: Vec3 = [0, radius, 0]
  const v2: Vec3 = [radius * Math.sqrt(3) / 2, -radius / 2, 0]
  const v3: Vec3 = [-radius * Math.sqrt(3) / 2, -radius / 2, 0]
  return [
    ...kochCurve(v1, v2, depth),
    ...kochCurve(v2, v3, depth).slice(1),
    ...kochCurve(v3, v1, depth).slice(1),
  ]
}
```

Render as a polyline: connect successive points with edges.

Edge count at depth `d` (snowflake): `3 × 4^d`.

Recommended depth cap: **6** (= 12,288 edges).

---

## 5. Cantor set / Cantor dust

The 1D Cantor set: start with [0, 1]. Remove the middle third. Recurse on the two remaining thirds.

```ts
function cantorIntervals(start: number, end: number, depth: number): [number, number][] {
  if (depth <= 0) return [[start, end]]
  const len = end - start
  const a = start + len / 3
  const b = start + 2 * len / 3
  return [
    ...cantorIntervals(start, a, depth - 1),
    ...cantorIntervals(b, end, depth - 1),
  ]
}
```

Render as horizontal line segments stacked vertically (one row per recursion level), or as vertical bars at intervals.

**Cantor dust**: the 2D analogue (Cartesian product of the Cantor set with itself). The 3D analogue takes the product three times — at depth `d` you get `8^d` cubes.

---

## 6. Barnsley fern (IFS)

An iterated function system: pick one of four affine transformations randomly at each step, weighted by probability. After thousands of iterations, the points fill out the fern shape.

```ts
const barnsleyTransforms = [
  // [a, b, c, d, e, f] for x' = a*x + b*y + e, y' = c*x + d*y + f
  { matrix: [ 0.00,  0.00,  0.00,  0.16,  0.00,  0.00], probability: 0.01 }, // stem
  { matrix: [ 0.85,  0.04, -0.04,  0.85,  0.00,  1.60], probability: 0.85 }, // main frond
  { matrix: [ 0.20, -0.26,  0.23,  0.22,  0.00,  1.60], probability: 0.07 }, // left leaflet
  { matrix: [-0.15,  0.28,  0.26,  0.24,  0.00,  0.44], probability: 0.07 }, // right leaflet
]

function pickTransform(): typeof barnsleyTransforms[0] {
  let r = Math.random()
  for (const t of barnsleyTransforms) {
    r -= t.probability
    if (r <= 0) return t
  }
  return barnsleyTransforms[barnsleyTransforms.length - 1]
}

function barnsleyFernPoints(n: number): Vec3[] {
  const points: Vec3[] = []
  let x = 0, y = 0
  for (let i = 0; i < n; i++) {
    const t = pickTransform()
    const [a, b, c, d, e, f] = t.matrix
    const newX = a * x + b * y + e
    const newY = c * x + d * y + f
    x = newX
    y = newY
    if (i > 20) points.push([x, y, 0])  // skip warmup
  }
  return points
}
```

Render as a `<Points>` component with small circles or as `<lineSegments>` connecting nearest-neighbours (more expensive, less faithful — point cloud is the canonical render).

Typical `n`: 50,000–200,000. The fern is *not* depth-recursive in the same way as Sierpinski — it's a stochastic IFS.

---

## 7. Mandelbrot / Julia wireframe

The Mandelbrot set is the set of complex numbers `c` for which the iteration `z → z² + c` (starting from `z = 0`) does not diverge. It's inherently 2D.

For a "wireframe" Mandelbrot, the standard approach is:
1. Sample the complex plane on a grid.
2. For each point, compute the iteration count to escape (or `maxIterations` if never escapes).
3. Render the *boundary* — the contour at the "just barely escaping" threshold.

A genuinely 3D version uses **slicing**: render contours of the iteration-count function at multiple thresholds and stack them in z.

```ts
function mandelbrotIterations(cx: number, cy: number, maxIter = 100): number {
  let x = 0, y = 0, iter = 0
  while (x * x + y * y < 4 && iter < maxIter) {
    const xt = x * x - y * y + cx
    y = 2 * x * y + cy
    x = xt
    iter++
  }
  return iter
}

function mandelbrotContourPoints(
  threshold: number,
  resolution = 200,
  bounds = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 },
  maxIter = 100,
): Vec3[] {
  const points: Vec3[] = []
  const dx = (bounds.xMax - bounds.xMin) / resolution
  const dy = (bounds.yMax - bounds.yMin) / resolution
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const cx = bounds.xMin + i * dx
      const cy = bounds.yMin + j * dy
      const iter = mandelbrotIterations(cx, cy, maxIter)
      if (iter === threshold) points.push([cx, cy, threshold * 0.05])
    }
  }
  return points
}
```

For multi-threshold stacking:
```ts
const thresholds = [10, 20, 30, 50, 80]
const allLayers = thresholds.flatMap(t => mandelbrotContourPoints(t))
```

The **Mandelbulb** is a popular pseudo-3D extension using triplex numbers. It has no clean wireframe representation — it's a volume rendered as iso-surfaces. If a user asks for it, explain that wireframe is not the right rendering mode and suggest a meshed iso-surface instead (using `marching cubes` from a library, e.g. `three-bvh-csg` or a custom marching-cubes implementation).

### Julia sets

Same iteration but with fixed `c` and varying `z` start. Replace the iteration with:
```ts
function juliaIterations(zx0: number, zy0: number, cx: number, cy: number, maxIter = 100): number {
  let x = zx0, y = zy0, iter = 0
  while (x * x + y * y < 4 && iter < maxIter) {
    const xt = x * x - y * y + cx
    y = 2 * x * y + cy
    x = xt
    iter++
  }
  return iter
}
```

Fix `(cx, cy)` to interesting values like `(-0.7, 0.27015)` for the standard Julia rendering.

---

## 8. Recursion depth caps (summary)

| Fractal | Recommended max depth | Edge count at max | Notes |
|---|---|---|---|
| Sierpinski triangle | 8 | ~59,000 | Lift to 3D plane |
| Sierpinski tetrahedron | 6 | ~25,000 | Most popular 3D fractal |
| Menger sponge | 3 (interactive), 4 (still) | 96k / 1.9M | Edge counts explode fast |
| Koch snowflake | 6 | 12,288 | Vertex count = edge count |
| Cantor dust (3D) | 5 | 32,768 cubes | × 12 edges per cube |
| Barnsley fern | N/A (stochastic) | n iterations | 50k–200k points typical |
| Mandelbrot contour | resolution 500 | varies | Adjust by sampling resolution |

**Always expose `depth` (or `iterations`/`resolution`) as a prop**, default it to a safe value, and warn in code comments about the upper bound. Users will set it high; the cap stops the browser from hanging.
