---
name: wireframe-generation
description: Generate mathematically rigorous 3D wireframe components in TypeScript using React Three Fiber. Use whenever the user wants to create or visualise wireframe geometry in React, R3F, or three.js — Platonic solids (tetrahedron, cube, octahedron, dodecahedron, icosahedron), the cuboctahedron / vector equilibrium, dual polyhedra, pentagons, pentagrams, golden spirals, phyllotaxis, vesica piscis, Seed/Flower/Fruit of Life, Metatron's Cube, Sierpinski triangle/tetrahedron, Menger sponge, Koch snowflake, Mandelbrot/Julia wireframes, Barnsley fern, or any sacred-geometry or fractal wireframe. Triggers on "wireframe component", "R3F wireframe", "react three fiber" + a shape, "fractal mesh", "platonic solid component", "metatron's cube react", "golden spiral 3D", "sacred geometry wireframe", "fibonacci sphere", or any request combining a named geometric structure with React/R3F/three.js code. Always use when wireframe rendering of a mathematical shape is requested — exact vertex coordinates and topology matter.
---

# Wireframe Generation

A skill for producing mathematically rigorous 3D wireframe components in React Three Fiber + TypeScript. The goal is fidelity: every vertex coordinate is exact, every edge list reflects correct topology, every fractal recursion uses the canonical construction. No eyeballing, no approximations dressed as primitives, no `<icosahedronGeometry/>` shortcut when the user asked for something specific about its φ-coordinate structure.

## When this skill applies

Reach for this skill whenever a user wants to *generate*, *build*, or *visualise* a named geometric or fractal structure as a wireframe in React Three Fiber. The skill is mathematically grounded — it knows the exact φ-coordinate forms of the icosahedron and dodecahedron, the dual relationships between Platonic solids, the construction of pentagrams and golden spirals, the recursion rules for classical fractals, and the standard R3F patterns for rendering edges as lines without surface fills.

This skill does **not** replace `three.js` built-in geometries when those are sufficient. It augments them: when the user wants something `<icosahedronGeometry/>` can't express on its own — golden-ratio coordinate inspection, dual nesting, custom edge subsets, fractal recursion, phyllotaxis distributions — this skill provides the math and the component pattern.

## Workflow

Follow this sequence for every request:

### 1. Identify the geometric primitive(s)

Read the user's prompt carefully. Name the underlying mathematical structure(s). If the request is "a dodecahedron with the inner pentagram visible on each face," that's two primitives (dodecahedron + pentagram-on-face). If the request is "Metatron's Cube with the Platonic solid projections highlighted," that's the Fruit of Life circle pattern plus selected line subsets.

If the user's intent is ambiguous (e.g. "make a sacred geometry shape"), ask one short clarifying question with 2–4 named options. Don't guess between the Flower of Life and Metatron's Cube — they're different.

### 2. Load the relevant reference(s)

Read the reference file(s) covering the requested primitives **before writing any code**. The references contain exact vertex/edge data, golden-ratio coordinate forms, fractal recursion algorithms, and R3F rendering patterns. Pulling values from memory risks subtle errors (off-by-one indices on edge lists, rotated coordinate frames, missing duality alignment).

| Reference file | Covers |
|---|---|
| `references/platonic-solids.md` | All 5 Platonic solids with exact vertex coordinates, edge lists, duality, the cuboctahedron (vector equilibrium), and how to nest duals. |
| `references/golden-ratio-shapes.md` | φ derivation, regular pentagon and pentagram, golden rectangle, golden spiral (logarithmic spiral with growth factor φ), Fibonacci/golden-angle phyllotaxis (Vogel's model), vesica piscis, Seed/Flower/Fruit of Life, Metatron's Cube. |
| `references/fractals.md` | Sierpinski triangle, Sierpinski tetrahedron, Menger sponge, Koch snowflake/curve, Cantor set, Barnsley fern (IFS), pentagram fractal recursion, Mandelbrot/Julia wireframe slicing. |
| `references/r3f-patterns.md` | TypeScript component patterns, edge rendering with `<lineSegments>` vs `<Line>` from drei, instanced rendering for many edges, ref-typed geometry buffers, prop interfaces, performance notes, animation hooks. |

Always read `r3f-patterns.md` plus whichever geometry reference(s) match the request. For a Platonic solid, that's `platonic-solids.md`. For anything pentagon/pentagram/φ-related, `golden-ratio-shapes.md`. For recursive structures, `fractals.md`. Multi-primitive requests need multiple references.

### 3. Construct the component

Build a single self-contained TypeScript component following the patterns in `r3f-patterns.md`. The component should:

- Be a named export, default-prop-friendly, and typed with a `Props` interface.
- Compute vertex coordinates from canonical formulas (don't paste rounded decimals — derive from φ, π, etc. so the math is auditable).
- Use `useMemo` for any non-trivial geometry computation so it's not rebuilt every frame.
- Render edges with `<lineSegments>` for hot paths or drei's `<Line>` for thicker styled lines. Both are covered in `r3f-patterns.md`.
- Accept at minimum: `radius` or `size`, `color`, optional `position` and `rotation` via standard R3F group props. Add domain-specific props (e.g. `recursionDepth` for fractals, `pointCount` for phyllotaxis) when they make the component reusable.
- Include an inline JSDoc comment at the top naming the mathematical structure and citing the source formula (so the next reader knows what they're looking at).

### 4. Output format

Return a single-file React component as a TypeScript artifact. Use the `.tsx` extension. Place it in `/mnt/user-data/outputs/` if the environment supports file creation, otherwise present inline. After the component, add a short usage note showing how to drop it into a `<Canvas>` and what props to pass for typical results.

If the user asked for multiple shapes in one scene (e.g. "all five Platonic solids nested"), produce one component that renders the composition rather than five separate components, unless they explicitly asked for separable pieces.

## Mathematical fidelity rules

These hold across every output:

1. **Use exact φ, not 1.618.** Define `const PHI = (1 + Math.sqrt(5)) / 2` once at the top of the file.
2. **Use exact coordinate forms** from the references. The icosahedron's twelve vertices are cyclic permutations of `(0, ±1, ±φ)` — not approximations from a vertex table.
3. **Edge lists are topology, not appearance.** When the reference gives an edge list as pairs of vertex indices, use it verbatim. Don't generate edges by "vertices that look close" — that breaks for non-convex constructions.
4. **Duals nest with vertex-on-face alignment.** When rendering a Platonic dual pair (e.g. icosahedron inside dodecahedron), the inner solid's vertices touch the outer solid's face centres. The references give the correct scale factor for each dual pair.
5. **Fractals recurse with explicit depth.** Always expose `depth` or `iterations` as a prop. Always cap it (typical max: 5 for Menger sponge, 7 for Sierpinski tetrahedron, 8 for Koch — beyond that, edge counts explode).
6. **Phyllotaxis uses the golden angle in radians.** `const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))` ≈ 2.39996 rad ≈ 137.5°. Distribute points as `(r·cos(n·θ), r·sin(n·θ))` with `r = c·√n` for the Vogel sunflower model.
7. **Pentagrams inside pentagons** — the inner pentagon scale factor is `1/φ²`. Don't measure it off a sketch.

## Component skeleton

This is the baseline shape every output should follow. Adapt freely.

```tsx
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PHI = (1 + Math.sqrt(5)) / 2

interface Props {
  radius?: number
  color?: string
  rotationSpeed?: number
}

/**
 * Icosahedron wireframe.
 * Vertices: cyclic permutations of (0, ±1, ±φ), scaled to `radius`.
 * 12 vertices, 30 edges, 20 triangular faces.
 * Dual of the dodecahedron.
 */
export function IcosahedronWireframe({
  radius = 1,
  color = '#ffffff',
  rotationSpeed = 0,
}: Props) {
  const groupRef = useRef<THREE.Group>(null)

  const { positions, indices } = useMemo(() => {
    // ... derive from canonical φ-coordinate form
    // (full code in references/platonic-solids.md)
  }, [radius])

  useFrame((_, delta) => {
    if (groupRef.current && rotationSpeed) {
      groupRef.current.rotation.y += delta * rotationSpeed
    }
  })

  return (
    <group ref={groupRef}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute attach="index" args={[indices, 1]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} />
      </lineSegments>
    </group>
  )
}
```

## Common requests and which reference solves them

- "Make me an icosahedron wireframe" → `platonic-solids.md`
- "Show the dodecahedron with pentagrams on each face" → `platonic-solids.md` + `golden-ratio-shapes.md`
- "Animate a golden spiral in 3D" → `golden-ratio-shapes.md`
- "Sunflower seed pattern as a 3D point cloud with edges between neighbours" → `golden-ratio-shapes.md` (phyllotaxis) + `r3f-patterns.md` (instanced lines)
- "Metatron's Cube with all five Platonic solids highlighted" → `golden-ratio-shapes.md` (for the Fruit of Life base) + `platonic-solids.md` (for the projections)
- "Sierpinski tetrahedron, recursive depth 5" → `fractals.md`
- "Vesica piscis seed → flower → fruit progression" → `golden-ratio-shapes.md`
- "All five Platonic solids nested as duals" → `platonic-solids.md`
- "Mandelbrot wireframe in 3D" → `fractals.md`
- "Cuboctahedron / vector equilibrium" → `platonic-solids.md`

## Things to avoid

- **Don't use `<icosahedronGeometry/>` and call it done** when the user asked for something requiring vertex-level access (highlighted edges, dual nesting, custom subsets). Build from `BufferGeometry`.
- **Don't approximate.** If you can't recall a coordinate form exactly, read the reference. The references exist precisely so memory isn't a single point of failure.
- **Don't conflate the dodecahedron with the rhombic dodecahedron.** They're different solids with different vertex counts (20 vs 14). `references/platonic-solids.md` covers the regular dodecahedron; if a user asks for the rhombic, say so explicitly.
- **Don't generate fractals without bounded depth.** A Menger sponge at depth 6 is ~387 million voxels. Cap inputs; document the cap.
- **Don't claim mystical or pseudo-physical significance.** This skill is mathematical. The geometry is interesting on its own; it doesn't need "this shape is the fabric of spacetime" framing. If a user wants such framing in a comment, that's their call — don't add it unprompted.

## Quick sanity checklist before returning code

- [ ] Every vertex derived from canonical formula, not a rounded decimal table.
- [ ] φ defined once and reused.
- [ ] Edge index list matches the reference exactly.
- [ ] Component is typed with a `Props` interface.
- [ ] `useMemo` wraps any non-trivial computation.
- [ ] Recursive structures have a depth cap.
- [ ] JSDoc comment names the structure and notes vertex/edge counts.
- [ ] Output is valid TSX, importable into a standard R3F scene.
