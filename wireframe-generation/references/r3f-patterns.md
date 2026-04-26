# React Three Fiber Wireframe Patterns

TypeScript patterns for rendering wireframe geometry in R3F. Covers component structure, edge rendering options, performance, and animation.

## Table of contents

1. Component structure and prop typing
2. Rendering edges — three options
3. BufferGeometry construction patterns
4. Animation with `useFrame`
5. Composition: multiple shapes in one component
6. Performance: when to instance, when to batch
7. Common pitfalls

---

## 1. Component structure and prop typing

Every wireframe component should follow this structural template:

```tsx
import { useMemo, useRef } from 'react'
import { useFrame, type GroupProps } from '@react-three/fiber'
import * as THREE from 'three'

interface MyShapeProps extends GroupProps {
  // Domain-specific props
  radius?: number
  color?: string
  recursionDepth?: number
  // Animation
  rotationSpeed?: number
}

export function MyShape({
  radius = 1,
  color = '#ffffff',
  recursionDepth = 3,
  rotationSpeed = 0,
  ...groupProps  // forward position, rotation, scale, etc.
}: MyShapeProps) {
  const groupRef = useRef<THREE.Group>(null)

  const geometry = useMemo(() => {
    // ...build BufferGeometry from canonical formulas
    return new THREE.BufferGeometry()
  }, [radius, recursionDepth])

  useFrame((_, delta) => {
    if (groupRef.current && rotationSpeed) {
      groupRef.current.rotation.y += delta * rotationSpeed
    }
  })

  return (
    <group ref={groupRef} {...groupProps}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color={color} />
      </lineSegments>
    </group>
  )
}
```

Extending `GroupProps` lets users pass `position`, `rotation`, `scale`, etc. directly.

---

## 2. Rendering edges — three options

There are three main ways to render wireframe edges in R3F. Pick based on requirements.

### Option A: `<lineSegments>` with `BufferGeometry` (fastest, thin lines)

```tsx
<lineSegments geometry={geometry}>
  <lineBasicMaterial color="#ffffff" />
</lineSegments>
```

The geometry's position attribute is interpreted as pairs of points — `[x1,y1,z1, x2,y2,z2, x3,y3,z3, x4,y4,z4, ...]` where each pair `(2i, 2i+1)` becomes one line segment.

Pros: native WebGL line primitive, fastest path, handles huge edge counts well.
Cons: line width is **always 1px** on most platforms (WebGL spec limitation). Modern browsers ignore the `linewidth` parameter on `lineBasicMaterial`.

### Option B: drei's `<Line>` (thick styled lines)

```tsx
import { Line } from '@react-three/drei'

<Line
  points={[[x1,y1,z1], [x2,y2,z2], ...]}  // sequence of points forming a polyline
  color="#ffffff"
  lineWidth={2}
  dashed={false}
/>
```

drei's `<Line>` wraps `meshline` and produces actual thick lines. Use for hero shapes where line weight is part of the design.

Pros: line width works.
Cons: each `<Line>` is a draw call. If you have 200 line segments, render them as 200 disconnected segments in a single call (option A) rather than 200 `<Line>` components.

For many disconnected segments needing thick lines, build one `<Line>` per chain or use `<LineSegments2>` from `three/examples`.

### Option C: `<LineSegments2>` (thick + many segments)

For thick lines with thousands of disconnected segments:

```tsx
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
```

This is a fatline implementation — non-trivial to set up but the right tool for "thick wireframe with 10,000 edges" cases. Use `<lineSegments>` + thin lines unless the user specifically asks for thick lines on a large mesh.

### Decision rule

- Edge count > 1,000 and lineWidth = 1 is fine → **Option A** (`<lineSegments>`)
- Edge count < 500 and lineWidth > 1 → **Option B** (drei `<Line>`)
- Edge count > 1,000 and lineWidth > 1 → **Option C** (`LineSegments2`)

Default to Option A. It's the simplest and works for almost everything in the geometry references.

---

## 3. BufferGeometry construction patterns

### Pattern A: from edge index list (preferred)

When you have an array of `[indexA, indexB]` pairs and an array of unique vertices, expand into a flat position array:

```tsx
function edgesToBufferGeometry(
  vertices: number[][],
  edges: [number, number][],
  scale = 1,
): THREE.BufferGeometry {
  const positions = new Float32Array(edges.length * 6)
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
```

This is the workhorse for Platonic solids and any topology-defined mesh.

### Pattern B: from polyline (continuous path)

For a Koch curve, golden spiral, or any single continuous path:

```tsx
function polylineToBufferGeometry(points: number[][]): THREE.BufferGeometry {
  // Convert to lineSegments-compatible: each segment needs 2 points,
  // so for a polyline of n+1 points we need n segments = 2n endpoints.
  const positions = new Float32Array((points.length - 1) * 6)
  for (let i = 0; i < points.length - 1; i++) {
    positions[i * 6 + 0] = points[i][0]
    positions[i * 6 + 1] = points[i][1]
    positions[i * 6 + 2] = points[i][2]
    positions[i * 6 + 3] = points[i + 1][0]
    positions[i * 6 + 4] = points[i + 1][1]
    positions[i * 6 + 5] = points[i + 1][2]
  }
  const geom = new THREE.BufferGeometry()
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geom
}
```

Or, simpler, use drei's `<Line>` and pass `points` directly — it handles the polyline interpretation internally.

### Pattern C: from three.js built-in geometry, edge-extracted

If you genuinely just want the edges of a built-in three.js shape:

```tsx
const baseGeometry = new THREE.IcosahedronGeometry(1, 0)
const edgesGeometry = new THREE.EdgesGeometry(baseGeometry)
// Render with <lineSegments geometry={edgesGeometry}>
```

`EdgesGeometry` extracts edges where adjacent face normals differ by more than a threshold angle (default 1°). This is the right tool for "I want the wireframe of this existing mesh" but **not** for the kind of mathematically-precise constructions this skill is designed for. Prefer Patterns A or B when the math matters.

---

## 4. Animation with `useFrame`

```tsx
useFrame((state, delta) => {
  if (!groupRef.current) return
  // delta is seconds since last frame; multiply for frame-rate independence
  groupRef.current.rotation.y += delta * rotationSpeed
  groupRef.current.rotation.x += delta * rotationSpeed * 0.5
})
```

For pulsing/breathing scale:
```tsx
useFrame((state) => {
  if (!groupRef.current) return
  const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
  groupRef.current.scale.setScalar(s)
})
```

For depth-recursion that animates over time (e.g. fractal "growing"):
```tsx
const [animatedDepth, setAnimatedDepth] = useState(0)
useFrame((state) => {
  const target = Math.floor((state.clock.elapsedTime % 8) / 2)
  if (target !== animatedDepth) setAnimatedDepth(target)
})
// Pass animatedDepth into useMemo dependency for the geometry
```

⚠️ Recomputing geometry every frame is expensive. Wrap in `useMemo` keyed on `animatedDepth`, and only allow it to change at low frequencies (e.g. once per 2 seconds).

---

## 5. Composition: multiple shapes in one component

For "all five Platonic solids nested as duals," build one component that renders all five:

```tsx
export function NestedPlatonics({ baseRadius = 2 }: { baseRadius?: number }) {
  // Each solid sized so its dual fits inside it correctly
  return (
    <group>
      <DodecahedronWireframe radius={baseRadius} color="#ff6b6b" />
      <IcosahedronWireframe radius={baseRadius * 0.795} color="#4ecdc4" />
      <CubeWireframe radius={baseRadius * 0.577} color="#ffe66d" />
      <OctahedronWireframe radius={baseRadius * 0.408} color="#95e1d3" />
      <TetrahedronWireframe radius={baseRadius * 0.289} color="#f38181" />
    </group>
  )
}
```

(The exact scale ratios above are approximations for a clean visual nesting; for mathematically rigorous dual-nesting, see `platonic-solids.md` section 8 for the precise dual-pair ratios.)

For "Metatron's Cube with Platonic solid projections highlighted":

```tsx
export function MetatronsCubeWithSolids({ radius = 1 }: { radius?: number }) {
  return (
    <group>
      <FruitOfLife radius={radius} color="#888888" />
      <MetatronEdges radius={radius} color="#ffffff" />
      {/* Highlighted subsets — these would be specific edge subsets
          identified in golden-ratio-shapes.md section 8 */}
      <CubeProjection radius={radius} color="#ff6b6b" lineWidth={2} />
      <OctahedronProjection radius={radius} color="#4ecdc4" lineWidth={2} />
    </group>
  )
}
```

---

## 6. Performance: when to instance, when to batch

### Phyllotaxis with thousands of seed-markers

If rendering a sunflower phyllotaxis with 5,000 dots, **don't** create 5,000 mesh components. Use a single `<instancedMesh>`:

```tsx
import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'

export function PhyllotaxisDots({
  count = 1000,
  scale = 0.05,
}: {
  count?: number
  scale?: number
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const positions = useMemo(() => {
    const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
    const points: [number, number, number][] = []
    for (let i = 0; i < count; i++) {
      const r = scale * Math.sqrt(i)
      const theta = i * GOLDEN_ANGLE
      points.push([r * Math.cos(theta), r * Math.sin(theta), 0])
    }
    return points
  }, [count, scale])

  useEffect(() => {
    if (!meshRef.current) return
    positions.forEach((pos, i) => {
      dummy.position.set(...pos)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [positions, dummy])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <circleGeometry args={[scale * 0.3, 16]} />
      <meshBasicMaterial color="#ffe66d" />
    </instancedMesh>
  )
}
```

### Wireframe for many similar shapes

For "100 small icosahedra in a grid", batch all the line segments into a single `<lineSegments>` call rather than rendering 100 separate components. Build one big position array.

### Memoize aggressively

Geometry construction in fractal recursion can be expensive at depth 6+. Always wrap in `useMemo` keyed on the depth and any dimensional props.

---

## 7. Common pitfalls

### `linewidth` doesn't work in WebGL

Setting `linewidth={3}` on a `<lineBasicMaterial>` has no effect in modern Chrome/Firefox/Safari due to the underlying WebGL spec. If you need thick lines, use drei's `<Line>` (which uses `meshline` internally) or `LineSegments2`.

### Forgetting `useMemo` causes geometry rebuild every frame

If you have `useFrame` triggering re-renders (e.g. via `useState`), and you compute geometry directly in the function body, you'll rebuild the entire geometry every frame. Always wrap in `useMemo`.

### TypeScript strictness with R3F's JSX intrinsics

R3F maps three.js classes to JSX elements like `<lineSegments>`, `<bufferGeometry>`, `<lineBasicMaterial>`. With strict TypeScript, ensure `@react-three/fiber` types are picked up — usually by importing the package somewhere in the tree, but sometimes you need an explicit `import { extend } from '@react-three/fiber'` or to add the package to `tsconfig.json` types.

### `BufferAttribute` constructor signature

Two ways:
```tsx
// JSX form (R3F)
<bufferAttribute attach="attributes-position" args={[positions, 3]} />

// Imperative form (when building geometry outside JSX)
geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
```

The second is the standard three.js pattern and is what `edgesToBufferGeometry` above uses. Both are fine; pick one and be consistent.

### Coordinate frame conventions

R3F uses three.js conventions: **+y is up**, **right-handed coordinate system** (+z toward the viewer in default camera). When porting math from sources that use +z-up (common in physics/CAD), swap `y` and `z` in vertex coordinates.

The Platonic solid vertex tables in `platonic-solids.md` use the standard math convention (+y up implicitly — they're labelled by which permutation gives which axis). For canonical orientations (icosahedron with two vertices on the y-axis, etc.), the coordinates as given work directly in R3F.

### Don't forget the ground plane

A wireframe icosahedron centred at origin renders with half above and half below y=0. If you want it sitting on a "floor", translate it up: `position={[0, radius, 0]}` for a circumradius `radius`.

### Camera defaults

The default R3F camera is at `[0, 0, 5]`. For a unit-radius shape this is too far for thin lines to be visible; either increase the shape size, move the camera closer (`camera={{ position: [0, 0, 3] }}` on `<Canvas>`), or let the user pass camera props.
