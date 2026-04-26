# Golden Ratio Shapes Reference

Constructions involving φ — the regular pentagon, pentagram, golden rectangle, golden spiral, phyllotaxis distributions, and the circle-based sacred geometry sequence (vesica piscis → seed → flower → fruit → Metatron's Cube).

## Table of contents

1. φ and the golden angle — fundamentals
2. Regular pentagon and pentagram
3. Golden rectangle and golden spiral
4. Phyllotaxis (Vogel's sunflower model)
5. Vesica piscis
6. Seed of Life
7. Flower of Life
8. Fruit of Life and Metatron's Cube

---

## 1. φ and the golden angle

```ts
const PHI = (1 + Math.sqrt(5)) / 2          // ≈ 1.6180339887
const INV_PHI = 1 / PHI                     // ≈ 0.6180339887, also = PHI - 1
const PHI_SQ = PHI * PHI                    // ≈ 2.6180339887, also = PHI + 1
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))  // ≈ 2.39996 rad ≈ 137.5077°
```

Useful identities:
- `φ² = φ + 1`
- `1/φ = φ − 1`
- `cos(36°) = φ/2`, `cos(72°) = (φ−1)/2 = 1/(2φ)`

---

## 2. Regular pentagon and pentagram

### Regular pentagon

Five vertices on a unit circle, starting at the top and going clockwise (or counter-clockwise — your choice, just be consistent):

```ts
function regularPentagonVertices(radius = 1, rotation = -Math.PI / 2): [number, number][] {
  // rotation = -π/2 puts vertex 0 at the top
  return Array.from({ length: 5 }, (_, i) => {
    const angle = rotation + (i * 2 * Math.PI) / 5
    return [Math.cos(angle) * radius, Math.sin(angle) * radius]
  })
}
```

Edge length of pentagon inscribed in circle of radius `r`: `2r·sin(π/5) = 2r·sin(36°)` ≈ `1.176·r`.

Pentagon diagonal length (vertex-to-non-adjacent-vertex): `φ × edge length`. This is the φ-relationship that makes pentagons interesting.

### Pentagram (five-pointed star)

Drawn by connecting every *second* vertex of a pentagon — so vertex 0 → 2 → 4 → 1 → 3 → 0.

```ts
function pentagramEdges(): [number, number][] {
  return [[0, 2], [2, 4], [4, 1], [1, 3], [3, 0]]
}
```

### Pentagram inside a pentagon — nested fractal structure

When you draw a pentagram inside a pentagon, the five intersection points of the pentagram's lines form a smaller, **inverted** pentagon. The scale factor is `1/φ²` ≈ 0.382.

If you draw a new pentagram inside that smaller pentagon, you get an even smaller pentagon at scale `1/φ⁴`, and so on. This is the canonical pentagram fractal.

```ts
interface PentagramFractalParams {
  radius: number
  depth: number      // recursion depth, cap at ~7
  rotation?: number
}

function buildPentagramFractal({
  radius,
  depth,
  rotation = -Math.PI / 2,
}: PentagramFractalParams): { vertices: [number, number][]; edges: [number, number][] } {
  const vertices: [number, number][] = []
  const edges: [number, number][] = []

  function recurse(r: number, rot: number, level: number) {
    if (level >= depth || r < 1e-4) return
    const baseIdx = vertices.length
    // Add this level's pentagon vertices
    for (let i = 0; i < 5; i++) {
      const angle = rot + (i * 2 * Math.PI) / 5
      vertices.push([Math.cos(angle) * r, Math.sin(angle) * r])
    }
    // Pentagram edges: 0→2, 2→4, 4→1, 1→3, 3→0
    edges.push([baseIdx, baseIdx + 2])
    edges.push([baseIdx + 2, baseIdx + 4])
    edges.push([baseIdx + 4, baseIdx + 1])
    edges.push([baseIdx + 1, baseIdx + 3])
    edges.push([baseIdx + 3, baseIdx])
    // Recurse: inner pentagon is rotated by π (inverted) and scaled by 1/φ²
    recurse(r / (PHI * PHI), rot + Math.PI, level + 1)
  }

  recurse(radius, rotation, 0)
  return { vertices, edges }
}
```

For 3D rendering, lift to z=0 and draw with `<lineSegments>` as in `platonic-solids.md`.

### Pentagrams on dodecahedron faces

Each face of the dodecahedron is a regular pentagon. To draw the pentagram on each face, you need:
1. The five vertex indices of each face.
2. The face plane (normal vector pointing outward).
3. The five connections going every-second-vertex-around-the-face.

This gives the dodecahedron with all 12 pentagrams visible — a striking render. The pentagram edges are *not* edges of the dodecahedron itself; they are diagonals of the pentagonal faces. There are 12 faces × 5 pentagram edges = 60 pentagram edges total.

---

## 3. Golden rectangle and golden spiral

### Golden rectangle

A rectangle with side ratio φ:1. Removing a 1×1 square from one end leaves a smaller golden rectangle (side ratio 1:1/φ = φ:1 again — that's the self-similar property).

### Golden spiral (logarithmic spiral with growth factor φ)

A logarithmic spiral has the polar form `r = a · e^(b·θ)`. For the **golden spiral**, the spiral grows by a factor of φ for every quarter-turn (90° = π/2 radians):

```
e^(b · π/2) = φ
b = 2·ln(φ)/π ≈ 0.30635
```

So the parametric form is:
```ts
function goldenSpiralPoint(theta: number, scale = 1): [number, number] {
  const b = 2 * Math.log(PHI) / Math.PI
  const r = scale * Math.exp(b * theta)
  return [r * Math.cos(theta), r * Math.sin(theta)]
}
```

To render as a polyline:
```ts
function goldenSpiralPoints(turns = 3, samplesPerTurn = 64, scale = 0.05): [number, number, number][] {
  const totalSamples = turns * samplesPerTurn
  const points: [number, number, number][] = []
  for (let i = 0; i <= totalSamples; i++) {
    const theta = (i / samplesPerTurn) * 2 * Math.PI
    const [x, y] = goldenSpiralPoint(theta, scale)
    points.push([x, y, 0])
  }
  return points
}
```

For a 3D golden spiral (helix with golden growth), add a linearly increasing z component:
```ts
const z = (i / totalSamples) * height
```

Note: the spiral commonly drawn inside the Fibonacci tiling (quarter-circle arcs in nested golden rectangles) is **not** a true golden spiral — it's piecewise circular. The true golden spiral is the smooth logarithmic curve above. Both are visually similar and both are legitimate, but they are different curves.

---

## 4. Phyllotaxis (Vogel's sunflower model)

Distributing N points on a disk so that successive points are placed at angle increments of `GOLDEN_ANGLE` from each other, with radial distance growing as `√n`, produces the sunflower-seed pattern.

This is **Vogel's model** (Helmut Vogel, 1979):

```ts
function vogelPhyllotaxis(n: number, c = 1): [number, number][] {
  // n: number of points
  // c: scale factor (controls disk size; r_n = c·√n)
  const points: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const r = c * Math.sqrt(i)
    const theta = i * GOLDEN_ANGLE
    points.push([r * Math.cos(theta), r * Math.sin(theta)])
  }
  return points
}
```

Counting spirals (parastichies): for moderate `n`, you'll see two families of spirals winding in opposite directions, and their counts will be **adjacent Fibonacci numbers** (e.g. 21 and 34, or 34 and 55). This is a real phenomenon, well-documented in plants.

### 3D phyllotaxis on a sphere — Fibonacci sphere

To distribute points evenly on a sphere using the same angle, use:

```ts
function fibonacciSphere(n: number, radius = 1): [number, number, number][] {
  const points: [number, number, number][] = []
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2  // y from +1 to -1
    const r = Math.sqrt(1 - y * y)   // radius at height y
    const theta = i * GOLDEN_ANGLE
    points.push([
      Math.cos(theta) * r * radius,
      y * radius,
      Math.sin(theta) * r * radius,
    ])
  }
  return points
}
```

This is the standard "Fibonacci sphere" point distribution — used in graphics, sampling, and as the basis for evenly-spread sphere point clouds. To draw edges between each point and its k nearest neighbours:

```ts
function nearestNeighborEdges(
  points: [number, number, number][],
  k: number,
): [number, number][] {
  const edges = new Set<string>()
  for (let i = 0; i < points.length; i++) {
    const distances = points.map((p, j) => ({
      idx: j,
      d: j === i ? Infinity : Math.hypot(
        p[0] - points[i][0], p[1] - points[i][1], p[2] - points[i][2]
      ),
    }))
    distances.sort((a, b) => a.d - b.d)
    for (let m = 0; m < k; m++) {
      const j = distances[m].idx
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      edges.add(key)
    }
  }
  return Array.from(edges).map(s => s.split('-').map(Number) as [number, number])
}
```

---

## 5. Vesica piscis

Two unit circles whose centres are separated by distance `1` (so each centre lies on the other's circumference). The lens-shaped intersection is the vesica piscis.

```ts
const vesicaCircles = [
  { center: [-0.5, 0, 0], radius: 1 },
  { center: [ 0.5, 0, 0], radius: 1 },
]
```

The two intersection points of the circles are at `(0, ±√3/2, 0)`, so the lens has height `√3` and width `1`.

To render a circle as a wireframe polygon in R3F:
```ts
function circlePoints(
  cx: number, cy: number, cz: number,
  radius: number,
  segments = 64,
  axis: 'xy' | 'xz' | 'yz' = 'xy',
): [number, number, number][] {
  const points: [number, number, number][] = []
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * 2 * Math.PI
    const c = Math.cos(t) * radius, s = Math.sin(t) * radius
    if (axis === 'xy') points.push([cx + c, cy + s, cz])
    else if (axis === 'xz') points.push([cx + c, cy, cz + s])
    else points.push([cx, cy + c, cz + s])
  }
  return points
}
```

---

## 6. Seed of Life

Seven circles of equal radius, all of radius `r`. One central circle, and six surrounding circles whose centres are at the vertices of a regular hexagon of radius `r` (so each circle passes through the central circle's centre).

```ts
function seedOfLifeCircles(radius = 1): { center: [number, number, number]; radius: number }[] {
  const centers: [number, number, number][] = [[0, 0, 0]]
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3  // 60° increments
    centers.push([Math.cos(angle) * radius, Math.sin(angle) * radius, 0])
  }
  return centers.map(c => ({ center: c, radius }))
}
```

7 circles total. This is the kernel of the Flower of Life.

---

## 7. Flower of Life

Extending the Seed of Life by adding more rings of circles, each new circle still of radius `r` and centred so it passes through neighbours' centres. The standard "Flower of Life" has **19 circles** (the central one + 6 + 12 in the next ring) bounded inside a larger circle of radius `3r`.

The centres lie on a triangular lattice with spacing `r`:

```ts
function flowerOfLifeCircles(radius = 1, rings = 2): { center: [number, number, number]; radius: number }[] {
  const result: { center: [number, number, number]; radius: number }[] = []
  // Triangular lattice basis vectors
  const u: [number, number] = [radius, 0]
  const v: [number, number] = [radius * 0.5, radius * Math.sqrt(3) / 2]

  for (let i = -rings; i <= rings; i++) {
    for (let j = -rings; j <= rings; j++) {
      const x = i * u[0] + j * v[0]
      const y = i * u[1] + j * v[1]
      // Restrict to circles within distance `rings * radius` of origin
      if (Math.hypot(x, y) <= rings * radius + 1e-6) {
        result.push({ center: [x, y, 0], radius })
      }
    }
  }
  return result
}
```

`rings = 2` gives the canonical 19-circle Flower of Life.

---

## 8. Fruit of Life and Metatron's Cube

### Fruit of Life

Take the Flower of Life and keep only the **13 circles** whose centres form a hexagonal close-packing pattern: the central circle plus the 6 immediate neighbours, plus 6 more "outer" circles at the corners of a larger hexagon.

The 13 centres:

```ts
function fruitOfLifeCenters(radius = 1): [number, number, number][] {
  const centers: [number, number, number][] = [[0, 0, 0]]
  // Inner ring: 6 at distance r·√3 (vertices of a hexagon at this distance? no — at distance 2r)
  // Actually the Fruit of Life centres are at distance 2r and 2r·√3 from origin.
  // Let me rebuild this properly.
  // The Fruit of Life has 13 circles: 1 central, 6 at the vertices of a hexagon of side 2r,
  //                                   6 at the midpoints of that hexagon's edges.
  // Equivalently: 1 + 6 + 6 = 13, on a triangular lattice with spacing 2r,
  // forming a hexagonal close-packed cluster.
  const r = radius
  // Hexagon of 6 circles at distance 2r:
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3
    centers.push([Math.cos(angle) * 2 * r, Math.sin(angle) * 2 * r, 0])
  }
  // Outer 6 circles at distance 2r·√3, rotated by 30°:
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 + Math.PI / 6
    const d = 2 * r * Math.sqrt(3)
    centers.push([Math.cos(angle) * d, Math.sin(angle) * d, 0])
  }
  return centers
}
```

### Metatron's Cube

Connect every Fruit of Life centre to every other Fruit of Life centre with straight lines. With 13 centres, that's `C(13, 2) = 78` lines.

```ts
function metatronsCubeEdges(centers: [number, number, number][]): [number, number][] {
  const edges: [number, number][] = []
  for (let i = 0; i < centers.length; i++) {
    for (let j = i + 1; j < centers.length; j++) {
      edges.push([i, j])
    }
  }
  return edges
}
```

Within these 78 lines, specific subsets project to all five Platonic solids in 2D. This is the result that gives Metatron's Cube its iconic status in sacred geometry. Identifying the projection subsets requires choosing which 8 of the 13 centres form a cube projection, which 12 form an icosahedron, etc. — these subsets are specific and documented in sacred-geometry references (Drunvalo Melchizedek's work being the most-cited popular source, though for rigour see the geometric construction in any standard reference on regular polyhedron projections).

For a clean visual, render all 13 circles + all 78 lines and let the projections emerge. Highlighting specific subsets is a stretch goal — note in code comments which subset corresponds to which solid if you implement it.
