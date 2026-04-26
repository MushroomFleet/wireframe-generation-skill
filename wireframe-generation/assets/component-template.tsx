import { useMemo, useRef } from 'react'
import { useFrame, type GroupProps } from '@react-three/fiber'
import * as THREE from 'three'

const PHI = (1 + Math.sqrt(5)) / 2

interface WireframeProps extends GroupProps {
  radius?: number
  color?: string
  rotationSpeed?: number
}

/**
 * <ShapeName>Wireframe — <one-line description>.
 *
 * Vertices: <how derived, e.g. cyclic permutations of (0, ±1, ±φ)>
 * Counts: <V vertices, E edges, F faces>
 * Notes: <e.g. dual of …, scaled to fit a sphere of `radius`>
 */
export function ShapeWireframe({
  radius = 1,
  color = '#ffffff',
  rotationSpeed = 0,
  ...groupProps
}: WireframeProps) {
  const groupRef = useRef<THREE.Group>(null)

  const geometry = useMemo(() => {
    // Step 1: define vertices using canonical formulas (no decimals from memory).
    const vertices: number[][] = [
      // ...
    ]

    // Step 2: derive edges. Either hard-code from a reference, or compute by distance.
    const edgeLength = 2 // replace with the correct edge length for this shape
    const edges: [number, number][] = []
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        const [x1, y1, z1] = vertices[i]
        const [x2, y2, z2] = vertices[j]
        const d = Math.hypot(x1 - x2, y1 - y2, z1 - z2)
        if (Math.abs(d - edgeLength) < 1e-4) edges.push([i, j])
      }
    }

    // Step 3: scale to target radius.
    const circumradius = 1 // replace with actual circumradius for this shape's coords
    const scale = radius / circumradius

    // Step 4: pack into a Float32 position buffer (2 endpoints × 3 coords per edge).
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
  }, [radius])

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
