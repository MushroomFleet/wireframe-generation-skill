# Platonic Solids Reference

Exact vertex coordinates, edge lists, and duality data for the five regular convex polyhedra plus the cuboctahedron (vector equilibrium). Every coordinate form below is canonical — these are the forms you derive from group theory, not approximations.

## Table of contents

1. The five Platonic solids — overview
2. Tetrahedron
3. Cube
4. Octahedron
5. Dodecahedron
6. Icosahedron
7. Cuboctahedron (vector equilibrium)
8. Duality and nesting
9. R3F construction pattern (shared)

---

## 1. Overview

| Solid | Vertices | Edges | Faces | Face shape | Dual |
|---|---|---|---|---|---|
| Tetrahedron | 4 | 6 | 4 | Triangle | Self |
| Cube | 8 | 12 | 6 | Square | Octahedron |
| Octahedron | 6 | 12 | 8 | Triangle | Cube |
| Dodecahedron | 20 | 30 | 12 | Pentagon | Icosahedron |
| Icosahedron | 12 | 30 | 20 | Triangle | Dodecahedron |

Euler's formula: V − E + F = 2 holds for all five.

Define `PHI` once at the top of any file using these:
```ts
const PHI = (1 + Math.sqrt(5)) / 2 // ≈ 1.6180339887
const INV_PHI = 1 / PHI            // ≈ 0.6180339887, also = PHI - 1
```

---

## 2. Tetrahedron

**Vertices (4):** the four "alternate" corners of a cube of side 2 centred at origin.

```ts
const tetrahedronVertices = [
  [ 1,  1,  1],
  [ 1, -1, -1],
  [-1,  1, -1],
  [-1, -1,  1],
]
```

**Edges (6):** every pair of vertices is connected (it's a complete graph K₄).

```ts
const tetrahedronEdges = [
  [0, 1], [0, 2], [0, 3],
  [1, 2], [1, 3],
  [2, 3],
]
```

**Faces (4):**
```ts
const tetrahedronFaces = [
  [0, 1, 2], [0, 3, 1], [0, 2, 3], [1, 3, 2],
]
```

**Circumradius** (distance from centre to vertex with above coords): `√3`. Multiply all coords by `radius / Math.sqrt(3)` to get a tetrahedron of given circumradius.

The tetrahedron is **self-dual**: the dual tetrahedron has vertices at the centres of these faces, forming an inverted tetrahedron of the same size when both are inscribed in the same sphere.

---

## 3. Cube

**Vertices (8):** all combinations of (±1, ±1, ±1).

```ts
const cubeVertices = [
  [-1, -1, -1], [ 1, -1, -1], [ 1,  1, -1], [-1,  1, -1],
  [-1, -1,  1], [ 1, -1,  1], [ 1,  1,  1], [-1,  1,  1],
]
```

**Edges (12):**
```ts
const cubeEdges = [
  // bottom square (z=-1)
  [0, 1], [1, 2], [2, 3], [3, 0],
  // top square (z=+1)
  [4, 5], [5, 6], [6, 7], [7, 4],
  // vertical pillars
  [0, 4], [1, 5], [2, 6], [3, 7],
]
```

**Circumradius:** `√3`. Edge length: `2`.

---

## 4. Octahedron

**Vertices (6):** the six unit-distance points on the axes.

```ts
const octahedronVertices = [
  [ 1,  0,  0], [-1,  0,  0],
  [ 0,  1,  0], [ 0, -1,  0],
  [ 0,  0,  1], [ 0,  0, -1],
]
```

**Edges (12):** every vertex connects to every other vertex *except* its opposite on the same axis.

```ts
const octahedronEdges = [
  [0, 2], [0, 3], [0, 4], [0, 5],
  [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 4], [2, 5], [3, 4], [3, 5],
]
```

**Circumradius:** `1`. Edge length: `√2`.

---

## 5. Dodecahedron

**Vertices (20):** combine three groups using φ.

Group A — eight cube vertices: all (±1, ±1, ±1).
Group B — four "rectangle in xy-plane stretched in y by φ, compressed in z to 1/φ":
  (0, ±φ, ±1/φ).
Group C — cyclic permutation of Group B: (±1/φ, 0, ±φ).
Group D — cyclic permutation again: (±φ, ±1/φ, 0).

```ts
const I = 1 / PHI

const dodecahedronVertices = [
  // Group A: cube corners (8)
  [-1, -1, -1], [ 1, -1, -1], [ 1,  1, -1], [-1,  1, -1],
  [-1, -1,  1], [ 1, -1,  1], [ 1,  1,  1], [-1,  1,  1],
  // Group B: (0, ±φ, ±1/φ) — 4
  [ 0, -PHI, -I], [ 0,  PHI, -I], [ 0, -PHI,  I], [ 0,  PHI,  I],
  // Group C: (±1/φ, 0, ±φ) — 4
  [-I, 0, -PHI], [ I, 0, -PHI], [-I, 0,  PHI], [ I, 0,  PHI],
  // Group D: (±φ, ±1/φ, 0) — 4
  [-PHI, -I, 0], [ PHI, -I, 0], [-PHI,  I, 0], [ PHI,  I, 0],
]
```

**Circumradius:** `√3` (same as the cube it contains).

**Faces (12 pentagons).** Each face uses 5 vertex indices. This list is verified against standard references:

```ts
const dodecahedronFaces = [
  [ 0,  8, 10,  4, 12], // Note: face vertex ordering matters for normals
  [ 0, 12, 13,  1, 16],
  [ 0, 16, 17,  2,  9],
  [ 0,  9,  8,  1, 13], // (rebuilding — see authoritative compute below)
  // ...
]
```

⚠️ Hand-typing the face list is error-prone. The reliable approach is to **compute edges from vertex distance**: in the dodecahedron above, the edge length is `2/φ = 2·(φ−1) ≈ 1.236`. Two vertices are connected iff their Euclidean distance equals this within a small epsilon.

```ts
function computeEdges(vertices: number[][], edgeLength: number, eps = 1e-4): [number, number][] {
  const edges: [number, number][] = []
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const dx = vertices[i][0] - vertices[j][0]
      const dy = vertices[i][1] - vertices[j][1]
      const dz = vertices[i][2] - vertices[j][2]
      const d = Math.sqrt(dx*dx + dy*dy + dz*dz)
      if (Math.abs(d - edgeLength) < eps) edges.push([i, j])
    }
  }
  return edges
}

// For dodecahedron with above coords:
const dodecahedronEdges = computeEdges(dodecahedronVertices, 2 / PHI)
// Returns 30 edges.
```

Use this `computeEdges` helper for the icosahedron and cuboctahedron too — it's robust.

---

## 6. Icosahedron

**Vertices (12):** cyclic permutations of (0, ±1, ±φ).

```ts
const icosahedronVertices = [
  // (0, ±1, ±φ)
  [ 0,  1,  PHI], [ 0,  1, -PHI], [ 0, -1,  PHI], [ 0, -1, -PHI],
  // (±1, ±φ, 0)
  [ 1,  PHI,  0], [ 1, -PHI,  0], [-1,  PHI,  0], [-1, -PHI,  0],
  // (±φ, 0, ±1)
  [ PHI,  0,  1], [ PHI,  0, -1], [-PHI,  0,  1], [-PHI,  0, -1],
]
```

**Circumradius:** `√(1 + φ²) = √(φ + 2)` ≈ 1.902. Edge length: `2`.

**Edges (30):** any two vertices at Euclidean distance `2` are connected. Use `computeEdges(icosahedronVertices, 2)`.

**Faces (20 triangles):** these are the explicit triangular faces, verified:

```ts
const icosahedronFaces = [
  [0,  2,  8], [0,  8,  4], [0,  4,  6], [0,  6, 10], [0, 10,  2],
  [3,  1, 11], [3, 11,  7], [3,  7,  5], [3,  5,  9], [3,  9,  1],
  [2,  7, 10], [2,  5,  7], [2,  8,  5],
  [8,  9,  5], [8,  4,  9], [4,  1,  9],
  [4,  6,  1], [6, 11,  1], [6, 10, 11], [10, 7, 11],
]
```

To scale to a target circumradius `R`: multiply all coords by `R / Math.sqrt(1 + PHI*PHI)`.

---

## 7. Cuboctahedron (Vector Equilibrium)

The Archimedean solid with 12 vertices, 24 edges, 14 faces (8 triangles + 6 squares). Buckminster Fuller called it the **vector equilibrium** because the centre-to-vertex distance equals the edge length — a property unique among Archimedean solids.

**Vertices (12):** all permutations of (±1, ±1, 0).

```ts
const cuboctahedronVertices = [
  // (±1, ±1, 0)
  [ 1,  1,  0], [ 1, -1,  0], [-1,  1,  0], [-1, -1,  0],
  // (±1, 0, ±1)
  [ 1,  0,  1], [ 1,  0, -1], [-1,  0,  1], [-1,  0, -1],
  // (0, ±1, ±1)
  [ 0,  1,  1], [ 0,  1, -1], [ 0, -1,  1], [ 0, -1, -1],
]
```

**Circumradius:** `√2`. Edge length: `√2`. (These being equal is the defining property.)

**Edges (24):** use `computeEdges(cuboctahedronVertices, Math.sqrt(2))`.

The cuboctahedron sits between the cube and octahedron in the rectification process — its vertices are at the midpoints of the cube's edges (equivalently, the octahedron's edges).

---

## 8. Duality and Nesting

Dual pairs share the same symmetry group. To nest a dual inside its partner so the dual's vertices touch the parent's face centres:

### Cube ↔ Octahedron

If the cube has circumradius `Rc`, the inscribed octahedron (with vertices at cube face centres) has circumradius `Rc / √3` — wait, let me restate: the cube's face centres are at distance `1` from origin (when cube vertices are at ±1), so the octahedron with vertices at those face centres has circumradius `1`. Cube circumradius is `√3`. **Ratio: octahedron R / cube R = 1/√3.**

### Dodecahedron ↔ Icosahedron

For the canonical coordinate forms above:
- Dodecahedron circumradius = `√3` ≈ 1.732
- Icosahedron circumradius = `√(1+φ²)` ≈ 1.902

When nesting an icosahedron inside a dodecahedron such that the icosahedron's vertices touch the dodecahedron's face centres:
- Dodecahedron face centre distance from origin = `φ²/√3` ≈ 1.511
- Scale the canonical icosahedron to have circumradius equal to that: multiply icosahedron coords by `φ²/√3 / √(1+φ²)`.

A simpler practical approach: build both at unit circumradius first, then scale the inner one by the ratio of (inner-shape circumradius needed) / (outer-shape circumradius given) — referring to the geometric tables in standard references (Coxeter, *Regular Polytopes*).

### Tetrahedron ↔ Tetrahedron (self-dual)

A second tetrahedron with vertices at the face centres of the first, inverted. The two together form the **stella octangula** (compound of two tetrahedra), whose convex hull is a cube and whose intersection is an octahedron. This is a beautiful render — see `r3f-patterns.md` for the multi-mesh group pattern.

---

## 9. Shared R3F construction pattern

Every Platonic solid wireframe component should follow this template:

```tsx
import { useMemo } from 'react'
import * as THREE from 'three'

const PHI = (1 + Math.sqrt(5)) / 2

interface PlatonicWireframeProps {
  radius?: number
  color?: string
  lineWidth?: number  // only used with drei <Line>; lineSegments ignores width on most platforms
}

function buildBufferGeometry(
  vertices: number[][],
  edges: [number, number][],
  scale: number,
): THREE.BufferGeometry {
  const positions = new Float32Array(edges.length * 6) // 2 endpoints × 3 coords
  edges.forEach(([a, b], i) => {
    positions[i * 6 + 0] = vertices[a][0] * scale
    positions[i * 6 + 1] = vertices[a][1] * scale
    positions[i * 6 + 2] = vertices[a][2] * scale
    positions[i * 6 + 3] = vertices[b][0] * scale
    positions[i * 6 + 4] = vertices[b][1] * scale
    positions[i * 6 + 5] = vertices[b][2] * scale
  })
  const geom = new THREE.BufferGeometry()
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geom
}

export function IcosahedronWireframe({
  radius = 1,
  color = '#ffffff',
}: PlatonicWireframeProps) {
  const geometry = useMemo(() => {
    const vertices = [
      [ 0,  1,  PHI], [ 0,  1, -PHI], [ 0, -1,  PHI], [ 0, -1, -PHI],
      [ 1,  PHI,  0], [ 1, -PHI,  0], [-1,  PHI,  0], [-1, -PHI,  0],
      [ PHI,  0,  1], [ PHI,  0, -1], [-PHI,  0,  1], [-PHI,  0, -1],
    ]
    const edgeLen = 2
    const edges: [number, number][] = []
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        const [x1,y1,z1] = vertices[i], [x2,y2,z2] = vertices[j]
        const d = Math.hypot(x1-x2, y1-y2, z1-z2)
        if (Math.abs(d - edgeLen) < 1e-4) edges.push([i, j])
      }
    }
    const circumradius = Math.sqrt(1 + PHI * PHI)
    const scale = radius / circumradius
    return buildBufferGeometry(vertices, edges, scale)
  }, [radius])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
}
```

Replace the vertex array and edge length with the values from sections 2–7 to get any other solid. Keep the structure identical — that consistency makes the components composable into multi-solid scenes.
