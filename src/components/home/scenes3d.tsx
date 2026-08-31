import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { SceneId } from '@/lib/beats'

/**
 * The seven stations the camera travels through.
 *
 * Abstract and procedural, per CLAUDE.md: primitives, particle fields and
 * simple geometry, generated in code. Nobody on the team is a 3D artist, and
 * six unique modelled environments is not buildable in a season — nor is it
 * needed. Camera travel through space is what carries the narrative; the
 * isolation beat does not have to look like a hospital room to land.
 *
 * Each station matches the SVG still on the flat path, so switching between
 * the two feels like the same story rather than two different sites.
 */

export const STATION_GAP = 34
export const SCENE_ORDER: SceneId[] = [
  'descent',
  'selection',
  'gap',
  'enclosure',
  'corridor',
  'convergence',
  'wider',
]

/** Station i sits at this depth. The camera walks from the first to the last. */
export function stationZ(index: number): number {
  return -index * STATION_GAP
}

const INK = new THREE.Color('#8a7965')
const RUST = new THREE.Color('#b04a22')

/** Deterministic, so the geometry is identical on every load and every device. */
function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

function Descent() {
  const group = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.06
  })
  return (
    <group ref={group}>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[0, 6 - i * 2.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[5.2 - i * 0.35, 0.035, 8, 96]} />
          <meshBasicMaterial color={INK} transparent opacity={0.5 - i * 0.05} />
        </mesh>
      ))}
      <mesh position={[0, -9, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color={RUST} />
      </mesh>
    </group>
  )
}

/**
 * The mechanism, shown rather than described: a dense field where almost every
 * point is dim, and a handful are not. Those are the ones that survived.
 */
function Selection() {
  const dim = useRef<THREE.InstancedMesh>(null)
  const survivors = useRef<THREE.InstancedMesh>(null)
  const DIM = 420
  const ALIVE = 14

  const layout = useMemo(() => {
    const random = seeded(11)
    const place = (count: number, spread: number) =>
      Array.from({ length: count }, () => [
        (random() - 0.5) * spread,
        (random() - 0.5) * spread * 0.7,
        (random() - 0.5) * spread * 0.5,
      ])
    return { dim: place(DIM, 22), alive: place(ALIVE, 16) }
  }, [])

  useFrame(() => {
    const matrix = new THREE.Matrix4()
    for (const [mesh, points, scale] of [
      [dim, layout.dim, 0.06],
      [survivors, layout.alive, 0.22],
    ] as const) {
      if (!mesh.current) continue
      points.forEach((p, i) => {
        matrix.makeScale(scale, scale, scale)
        matrix.setPosition(p[0], p[1], p[2])
        mesh.current!.setMatrixAt(i, matrix)
      })
      mesh.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group>
      <instancedMesh ref={dim} args={[undefined, undefined, DIM]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color={INK} transparent opacity={0.18} />
      </instancedMesh>
      <instancedMesh ref={survivors} args={[undefined, undefined, ALIVE]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color={RUST} />
      </instancedMesh>
    </group>
  )
}

function Gap() {
  return (
    <group>
      <mesh position={[-3.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[5, 0.04, 8, 96, Math.PI]} />
        <meshBasicMaterial color={INK} transparent opacity={0.45} />
      </mesh>
      <mesh position={[3.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[5, 0.04, 8, 96, Math.PI]} />
        <meshBasicMaterial color={INK} transparent opacity={0.45} />
      </mesh>
      <mesh position={[-1.1, 0, 0]}>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshBasicMaterial color={INK} transparent opacity={0.6} />
      </mesh>
      <mesh position={[1.1, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color={RUST} />
      </mesh>
    </group>
  )
}

function Enclosure() {
  const shell = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (shell.current) shell.current.rotation.y += delta * 0.08
  })
  const outside = useMemo(() => {
    const random = seeded(29)
    return Array.from({ length: 18 }, () => {
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)
      const r = 9 + random() * 3
      return [
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ]
    })
  }, [])
  return (
    <group>
      <mesh ref={shell}>
        <sphereGeometry args={[6.2, 16, 10]} />
        <meshBasicMaterial color={INK} wireframe transparent opacity={0.3} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial color={RUST} />
      </mesh>
      {outside.map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshBasicMaterial color={INK} transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  )
}

/** The appointments: the same frame again, and again, receding. */
function Corridor() {
  return (
    <group>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[0, 0, -i * 2.4]}>
          <torusGeometry args={[4.6 - i * 0.16, 0.03, 6, 4, Math.PI * 2]} />
          <meshBasicMaterial color={INK} transparent opacity={0.4 - i * 0.03} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshBasicMaterial color={RUST} />
      </mesh>
    </group>
  )
}

function Convergence() {
  const group = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.z += delta * 0.04
  })
  const spokes = useMemo(() => {
    const random = seeded(47)
    return Array.from({ length: 54 }, (_, i) => {
      const angle = (i / 54) * Math.PI * 2
      const outer = 5.5 + random() * 3.5
      return { angle, outer }
    })
  }, [])
  return (
    <group ref={group}>
      {spokes.map((s, i) => {
        const inner = 2.4
        const length = s.outer - inner
        const mid = inner + length / 2
        return (
          <mesh
            key={i}
            position={[Math.cos(s.angle) * mid, Math.sin(s.angle) * mid, 0]}
            rotation={[0, 0, s.angle + Math.PI / 2]}
          >
            <boxGeometry args={[0.025, length, 0.025]} />
            <meshBasicMaterial color={INK} transparent opacity={0.3} />
          </mesh>
        )
      })}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.04, 8, 64]} />
        <meshBasicMaterial color={RUST} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshBasicMaterial color={RUST} />
      </mesh>
    </group>
  )
}

function Wider() {
  const clusters = useMemo(
    () => [
      { p: [-5.5, 2.4, -2], r: 2.6 },
      { p: [4.6, 3.2, -4], r: 1.9 },
      { p: [0, -3.2, 0], r: 3.4 },
      { p: [6.2, -2.6, -3], r: 1.5 },
    ],
    [],
  )
  return (
    <group>
      {clusters.map((c, i) => (
        <group key={i} position={c.p as [number, number, number]}>
          <mesh rotation={[Math.PI / 2.6, 0, 0]}>
            <torusGeometry args={[c.r, 0.03, 8, 64]} />
            <meshBasicMaterial color={INK} transparent opacity={0.34} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshBasicMaterial
              color={i === 2 ? RUST : INK}
              transparent
              opacity={i === 2 ? 1 : 0.55}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

const SCENES: Record<SceneId, () => React.ReactElement> = {
  descent: Descent,
  selection: Selection,
  gap: Gap,
  enclosure: Enclosure,
  corridor: Corridor,
  convergence: Convergence,
  wider: Wider,
}

export function Station({ scene, index }: { scene: SceneId; index: number }) {
  const Shape = SCENES[scene]
  return (
    <group position={[0, 0, stationZ(index)]}>
      <Shape />
    </group>
  )
}
