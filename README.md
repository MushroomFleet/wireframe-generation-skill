# Wireframe Generation Skill

A Claude skill for producing **mathematically rigorous 3D wireframe components** in TypeScript using React Three Fiber.

When you ask Claude to "build me an icosahedron in R3F," the default response is usually `<icosahedronGeometry/>` — fine for surface meshes, but useless when you need vertex-level access, dual nesting, fractal recursion, or pentagram diagonals on dodecahedron faces. This skill replaces the shortcut with canonical mathematics: exact φ-coordinate forms, verified edge lists, recursive fractal algorithms, and reusable R3F patterns.

It is the working geometry library that *Atoms to Architecture* points at — Platonic solids, golden-ratio constructions, sacred-geometry primitives, and classical fractals — turned into clean, typed, mesh-ready components.

## What it covers

**Platonic solids** — tetrahedron, cube, octahedron, dodecahedron, icosahedron, with exact vertex coordinates derived from canonical group-theoretic forms. The icosahedron uses cyclic permutations of `(0, ±1, ±φ)`. The dodecahedron uses the four-group construction `(±1,±1,±1) ∪ (0,±φ,±1/φ) ∪ (±1/φ,0,±φ) ∪ (±φ,±1/φ,0)`. Edge lists are computed by Euclidean distance, not hand-typed (which is where bugs hide).

**Cuboctahedron / vector equilibrium** — the Archimedean solid Buckminster Fuller named for its defining property: centre-to-vertex distance equals edge length, both `√2`.

**Golden-ratio shapes** — regular pentagon, pentagram with verified `1/φ²` inner-pentagon scaling, recursive pentagram fractal, golden rectangle, golden spiral as a true logarithmic spiral with growth factor `b = 2·ln(φ)/π`, Vogel's phyllotaxis (sunflower seed packing), Fibonacci sphere point distribution.

**Sacred geometry** — vesica piscis, Seed of Life, Flower of Life on a triangular lattice, Fruit of Life with its 13 hexagonal-close-packed centres, Metatron's Cube as the complete graph of 78 lines connecting them.

**Fractals** — Sierpinski triangle, Sierpinski tetrahedron, Menger sponge with the canonical "remove cubes where ≥2 indices equal 1" rule, Koch snowflake, Cantor dust, Barnsley fern with the four standard IFS matrices, Mandelbrot/Julia contour wireframes. Every fractal exposes a depth parameter with documented edge-count growth tables and recommended caps.

**R3F rendering patterns** — three options for edges (`<lineSegments>` for speed, drei's `<Line>` for thickness, `LineSegments2` for both), `BufferGeometry` construction patterns, `useFrame` animation, instanced rendering for thousand-point phyllotaxis fields, and a catalogue of common pitfalls (the WebGL `linewidth` limitation, missing `useMemo`, coordinate-frame conventions).

## What it does for Claude

When this skill is loaded into Claude and someone asks for a wireframe, Claude follows a four-step workflow:

1. **Identify the geometric primitive(s)** in the request. "A dodecahedron with pentagrams on each face" is two primitives. "Metatron's Cube with the Platonic projections highlighted" is several.
2. **Load the relevant reference file(s)** before writing any code. Pulling vertex coordinates from memory is how off-by-one errors creep in; the references are the source of truth.
3. **Construct the component** following the shared R3F template — typed `Props` interface, `useMemo`-wrapped geometry, `useFrame` for animation, exact φ defined once at the top.
4. **Output a single self-contained `.tsx` file** ready to drop into a `<Canvas>`.

The skill enforces seven fidelity rules: use exact `(1 + Math.sqrt(5)) / 2` not `1.618`, derive coordinates from canonical formulas, treat edge lists as topology not appearance, nest duals with vertex-on-face alignment, cap fractal recursion explicitly, use the golden angle in radians (`Math.PI * (3 - Math.sqrt(5))`), and scale pentagrams inside pentagons by `1/φ²`.

## Installation

Download `wireframe-generation.skill` from the releases page (or build from source — see below) and install it through the Claude skills interface, or place the unpacked folder where Claude can find it as a user skill.

## Triggering the skill

The skill triggers automatically on requests like:

- "Build me an icosahedron wireframe in R3F"
- "Show the dodecahedron with pentagrams on each face"
- "Animate a golden spiral in 3D"
- "Sunflower seed pattern as a 3D point cloud"
- "Metatron's Cube with the five Platonic projections highlighted"
- "Sierpinski tetrahedron, recursion depth 5"
- "Vesica piscis → Seed → Flower → Fruit progression"
- "All five Platonic solids nested as duals"
- "Cuboctahedron / vector equilibrium component"
- "Fibonacci sphere with k-nearest-neighbour edges"
- "Mandelbrot wireframe stacked across iteration thresholds"

Or anything that names a geometric or fractal structure alongside React Three Fiber, three.js, or a TypeScript wireframe context.

## Repository structure

```
wireframe-generation/
├── SKILL.md                              # Entry point: workflow, rules, checklist
├── references/
│   ├── platonic-solids.md                # Vertex coords, edges, duality, cuboctahedron
│   ├── golden-ratio-shapes.md            # φ, pentagon, pentagram fractal, phyllotaxis,
│   │                                     #   vesica, Seed/Flower/Fruit of Life, Metatron
│   ├── fractals.md                       # Sierpinski, Menger, Koch, Cantor, Barnsley,
│   │                                     #   Mandelbrot/Julia, depth caps
│   └── r3f-patterns.md                   # Edge rendering, BufferGeometry, animation,
│                                         #   instancing, performance, pitfalls
└── assets/
    └── component-template.tsx            # Starter skeleton component
```

The progressive-disclosure design means Claude only loads what's needed — `SKILL.md` is always in context (~12KB), and reference files are pulled in when their geometry is requested.

## Building from source

```bash
git clone https://github.com/MushroomFleet/wireframe-generation-skill
cd wireframe-generation-skill
# Package using the skill-creator's package_skill.py:
python3 path/to/skill-creator/scripts/package_skill.py wireframe-generation ./dist
```

The output `wireframe-generation.skill` is a zip archive following Anthropic's skill format and can be installed directly into Claude.

## Mathematical verification

Every geometric claim in the references was numerically verified before release:

- Icosahedron: 12 vertices, **30 edges of length 2**, circumradius `√(1+φ²)`. Every face is an equilateral triangle, every edge shared by exactly 2 faces.
- Dodecahedron: 20 vertices, **30 edges of length 2/φ**, circumradius `√3` (the cube it contains).
- Cuboctahedron: 12 vertices, **24 edges**, edge length = circumradius = `√2` — the defining vector-equilibrium property.
- Pentagram inner pentagon: scaled by exactly `1/φ² ≈ 0.382` of the outer.
- Golden angle in radians: `π(3 − √5) ≈ 2.39996` rad ≈ 137.5077°.

You don't have to take the references on faith — the formulas are auditable by anyone with a Python REPL.

## What this skill explicitly avoids

- **Mystical or pseudo-physical framing.** The geometry is interesting on its own. There's no claim that the cuboctahedron is "the fabric of spacetime" or that the dodecahedron is "the source code of reality" — those are interpretive overlays from sacred-geometry traditions, separate from the mathematics. Users are free to add such framing themselves; the skill won't insert it unprompted.
- **Confusing the regular dodecahedron with the rhombic dodecahedron.** Different solids, different vertex counts (20 vs 14), different applications.
- **Unbounded recursion.** Every fractal exposes a depth parameter, every depth has a documented cap. A Menger sponge at depth 6 is ~387 million voxels; the skill caps that at 4.
- **Approximations dressed as primitives.** When a user asks for an icosahedron with golden-ratio coordinates exposed, `<icosahedronGeometry/>` doesn't cut it. The skill builds from `BufferGeometry` so vertex indices are addressable.

## Background

This skill grew out of a grounding-document project that distinguished mathematically solid claims about geometry from the speculative framings that often accompany them in popular sacred-geometry content. The "Solid" claims — duality of icosahedron and dodecahedron, φ in their coordinates, pentagram-φ relationships, cuboctahedron as vector equilibrium, fractal patterns in nature — became this skill's reference library. The framing is mathematical; the components are honest about what they are.

## Contributing

PRs welcome, especially for:

- Additional Archimedean and Catalan solids (snub dodecahedron, rhombic triacontahedron — the latter is Metatron's Cube projected to 3D)
- Higher-dimensional projections (tesseract, 24-cell, 600-cell wireframes)
- Better Mandelbulb/3D-fractal handling (currently flagged as needing iso-surface rendering rather than wireframe)
- Stress-test components for performance benchmarking

When adding new geometry, please include the canonical coordinate derivation in the relevant reference file and a numerical verification snippet — that's the standard the existing references hold to.

## License

MIT.

---

## 📚 Citation

### Academic Citation

If you use this codebase in your research or project, please cite:

```bibtex
@software{wireframe_generation_skill,
  title = {Wireframe Generation Skill: Mathematically rigorous 3D wireframe components for React Three Fiber},
  author = {Drift Johnson},
  year = {2025},
  url = {https://github.com/MushroomFleet/wireframe-generation-skill},
  version = {1.0.0}
}
```

### Donate:

[![Ko-Fi](https://cdn.ko-fi.com/cdn/kofi3.png?v=3)](https://ko-fi.com/driftjohnson)
