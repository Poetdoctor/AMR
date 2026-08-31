import { useMemo, useRef } from 'react'
import type { ReactElement } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { SceneId } from '@/lib/beats'

/**
 * The seven stations the camera travels through.
 *
 * Same visual language as the flat path — the plate, the record, the room —
 * built from primitives and instanced points rather than modelled assets, as
 * CLAUDE.md requires. Nobody on the team is a 3D artist, and none of this
 * needs modelling: a zone of inhibition is a disc, an isolation room is a
 * bounded volume, a susceptibility report is a lattice with a gap in it.
 *
 * What the third dimension adds is that the camera flies *through* them. You
 * pass across the surface of a plate and see the one colony that survived; you
 * cross the threshold into the room and the visitors are left outside it.
 */

export const STATION_GAP = 34
export const SCENE_ORDER: SceneId[] = [
  'recurrence',
  'inhibition',
  'record',
  'room',
  'schedule',
  'person',
  'across',
]

export function stationZ(index: number): number {
  return -index * STATION_GAP
}

const INK = new THREE.Color('#8a7965')
const RUST = new THREE.Color('#b04a22')

function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

/** The plate itself: a thin disc the camera passes across. */
function PlateDisc({ radius = 11 }: { radius?: number }) {
  return (
    <group rotation={[-Math.PI / 2.7, 0, 0]}>
      <mesh>
        <circleGeometry args={[radius, 72]} />
        <meshBasicMaterial color={INK} transparent opacity={0.05} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[radius, 0.05, 8, 96]} />
        <meshBasicMaterial color={INK} transparent opacity={0.45} />
      </mesh>
    </group>
  )
}

/** Colonies scattered on the plate's plane, avoiding a cleared radius. */
function Colonies({
  seed,
  count,
  radius,
  clearRadius,
  colour,
  opacity,
  size,
}: {
  seed: number
  count: number
  radius: number
  clearRadius: number
  colour: THREE.Color
  opacity: number
  size: number
}) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const points = useMemo(() => {
    const random = seeded(seed)
    const out: [number, number, number][] = []
    let guard = 0
    while (out.length < count && guard++ < count * 40) {
      const angle = random() * Math.PI * 2
      const distance = Math.sqrt(random()) * radius
      if (distance < clearRadius) continue
      out.push([Math.cos(angle) * distance, 0, Math.sin(angle) * distance])
    }
    return out
  }, [seed, count, radius, clearRadius])

  useFrame(() => {
    if (!mesh.current) return
    const matrix = new THREE.Matrix4()
    points.forEach((p, i) => {
      matrix.makeScale(size, size, size)
      matrix.setPosition(p[0], p[1], p[2])
      mesh.current!.setMatrixAt(i, matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group rotation={[-Math.PI / 2.7, 0, 0]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, Math.max(1, points.length)]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={colour} transparent opacity={opacity} />
      </instancedMesh>
    </group>
  )
}

/** Beat one: the plate was cleared to the dashed line, and growth crossed back. */
function Recurrence() {
  return (
    <group>
      <PlateDisc />
      <group rotation={[-Math.PI / 2.7, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[6.4, 0.03, 6, 96]} />
          <meshBasicMaterial color={INK} transparent opacity={0.32} />
        </mesh>
      </group>
      <Colonies
        seed={3}
        count={150}
        radius={10.6}
        clearRadius={6.4}
        colour={INK}
        opacity={0.3}
        size={0.16}
      />
      <Colonies
        seed={19}
        count={14}
        radius={5.6}
        clearRadius={1.2}
        colour={RUST}
        opacity={1}
        size={0.2}
      />
    </group>
  )
}

/**
 * Beat two: disk diffusion. The disc at the centre is the antibiotic; the empty
 * ring around it is everything the drug killed. One colony survived inside that
 * ring and is dividing. The patient is not in this picture — which is the beat.
 */
function Inhibition() {
  const survivors = useMemo(() => {
    const random = seeded(23)
    const seedPoint: [number, number, number] = [3.1, 0, -2.2]
    return [
      seedPoint,
      ...Array.from({ length: 6 }, () => {
        const angle = random() * Math.PI * 2
        const distance = 0.5 + random() * 1.1
        return [
          seedPoint[0] + Math.cos(angle) * distance,
          0,
          seedPoint[2] + Math.sin(angle) * distance,
        ] as [number, number, number]
      }),
    ]
  }, [])

  return (
    <group>
      <PlateDisc />
      <Colonies
        seed={7}
        count={190}
        radius={10.6}
        clearRadius={7}
        colour={INK}
        opacity={0.32}
        size={0.16}
      />
      <group rotation={[-Math.PI / 2.7, 0, 0]}>
        {/* the edge of the zone of inhibition */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[7, 0.03, 6, 96]} />
          <meshBasicMaterial color={INK} transparent opacity={0.4} />
        </mesh>
        {/* the antibiotic disk */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.7, 1.7, 0.12, 40]} />
          <meshBasicMaterial color={INK} transparent opacity={0.35} />
        </mesh>
        {survivors.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[i === 0 ? 0.3 : 0.19, 12, 12]} />
            <meshBasicMaterial color={RUST} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/**
 * Beat three: the susceptibility report as a lattice the camera passes along.
 * Every drug tested and recorded — and one column, outlined and empty, where
 * nothing asks how the person is.
 */
function Record() {
  const cells = useMemo(() => {
    const random = seeded(31)
    const out: { p: [number, number, number]; resistant: boolean; faint: boolean }[] = []
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 5; c++) {
        const roll = random()
        out.push({
          p: [(c - 2.6) * 2.1, (3 - r) * 1.5, 0],
          resistant: roll < 0.34,
          faint: roll >= 0.34 && roll < 0.62,
        })
      }
    }
    return out
  }, [])

  return (
    <group>
      {cells.map((cell, i) => (
        <mesh key={i} position={cell.p}>
          <boxGeometry args={[1.1, 1.1, 0.08]} />
          <meshBasicMaterial
            color={cell.resistant ? RUST : INK}
            transparent
            opacity={cell.resistant ? 0.9 : cell.faint ? 0.35 : 0.14}
          />
        </mesh>
      ))}
      {/* the column nobody fills in */}
      <mesh position={[(5 - 2.6) * 2.1, 0, 0]}>
        <boxGeometry args={[1.5, 11, 0.02]} />
        <meshBasicMaterial color={RUST} wireframe transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

/**
 * Beat four: the room. The camera crosses the threshold and the visitors stay
 * on the other side of it, further away with each tier.
 */
function Room() {
  const visitors = useMemo(() => {
    const random = seeded(53)
    return Array.from({ length: 12 }, (_, i) => {
      const tier = Math.floor(i / 4)
      return [
        7.5 + tier * 3.4 + random() * 1.6,
        (i % 4) * 2.6 - 3.9 + random(),
        -2 + random() * 4,
      ] as [number, number, number]
    })
  }, [])

  return (
    <group>
      <mesh position={[-2.5, 0, 0]}>
        <boxGeometry args={[11, 9, 11]} />
        <meshBasicMaterial color={INK} wireframe transparent opacity={0.28} />
      </mesh>
      <mesh position={[-2.5, 0, 0]}>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshBasicMaterial color={RUST} />
      </mesh>
      {/* the threshold: where the gowns and gloves go on */}
      <mesh position={[3.2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[11, 9]} />
        <meshBasicMaterial color={RUST} transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      {visitors.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.26, 10, 10]} />
          <meshBasicMaterial color={INK} transparent opacity={0.42 - Math.floor(i / 4) * 0.11} />
        </mesh>
      ))}
    </group>
  )
}

/** Beat five: every appointment a mark, the journey to it the arc above. */
function Schedule() {
  const visits = useMemo(() => {
    const random = seeded(67)
    return Array.from({ length: 26 }, (_, i) => ({
      x: (i - 12.5) * 1.15,
      height: 0.7 + random() * 3.4,
    }))
  }, [])
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 30, 6]} />
        <meshBasicMaterial color={INK} transparent opacity={0.4} />
      </mesh>
      {visits.map((v, i) => (
        <group key={i} position={[v.x, 0, 0]}>
          <mesh position={[0, v.height / 2, 0]}>
            <cylinderGeometry args={[0.02, 0.02, v.height, 6]} />
            <meshBasicMaterial color={INK} transparent opacity={0.34} />
          </mesh>
          <mesh position={[0, v.height, 0]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshBasicMaterial color={INK} transparent opacity={0.45} />
          </mesh>
        </group>
      ))}
      <mesh position={[visits[0].x, 0, 0]}>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshBasicMaterial color={RUST} />
      </mesh>
      <mesh position={[visits[visits.length - 1].x, 0, 0]}>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshBasicMaterial color={RUST} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

/**
 * Beat six: what medicine measures, drawn to scale against what it does not.
 * The lattice and the plate are small and precise at the centre; the person
 * extends a long way past the edge of both.
 */
function Person() {
  const field = useRef<THREE.InstancedMesh>(null)
  const COUNT = 260
  const points = useMemo(() => {
    const random = seeded(83)
    return Array.from({ length: COUNT }, () => {
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)
      const r = 8 + random() * 9
      return [
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ] as [number, number, number]
    })
  }, [])

  useFrame(() => {
    if (!field.current) return
    const matrix = new THREE.Matrix4()
    points.forEach((p, i) => {
      matrix.makeScale(0.07, 0.07, 0.07)
      matrix.setPosition(p[0], p[1], p[2])
      field.current!.setMatrixAt(i, matrix)
    })
    field.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={field} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color={INK} transparent opacity={0.24} />
      </instancedMesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.4, 0.05, 8, 72]} />
        <meshBasicMaterial color={RUST} />
      </mesh>
      {[-1, 0, 1].map((r) =>
        [-1, 0, 1].map((c) => (
          <mesh key={`${r}${c}`} position={[c * 1.2, r * 1.2, 0]}>
            <boxGeometry args={[0.7, 0.7, 0.06]} />
            <meshBasicMaterial color={INK} transparent opacity={0.32} />
          </mesh>
        )),
      )}
    </group>
  )
}

/** Beat seven: other organisms, other plates, the same pattern on each. */
function Across() {
  const plates = useMemo(
    () => [
      { p: [-7.5, 3, -3] as [number, number, number], r: 4.2, seed: 5 },
      { p: [7, 4, -6] as [number, number, number], r: 3.1, seed: 9 },
      { p: [0, -4.5, 0] as [number, number, number], r: 5.2, seed: 13 },
    ],
    [],
  )
  return (
    <group>
      {plates.map((plate, i) => {
        const random = seeded(plate.seed)
        const zone = plate.r * 0.6
        const dots = Array.from({ length: 30 }, () => {
          const angle = random() * Math.PI * 2
          const distance = zone + random() * (plate.r - zone - 0.2)
          return [Math.cos(angle) * distance, 0, Math.sin(angle) * distance] as [
            number,
            number,
            number,
          ]
        })
        return (
          <group key={i} position={plate.p} rotation={[-Math.PI / 2.7, 0, i * 0.4]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[plate.r, 0.03, 6, 72]} />
              <meshBasicMaterial color={INK} transparent opacity={0.4} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[zone, 0.02, 6, 64]} />
              <meshBasicMaterial color={INK} transparent opacity={0.28} />
            </mesh>
            {dots.map((d, j) => (
              <mesh key={j} position={d}>
                <sphereGeometry args={[0.11, 6, 6]} />
                <meshBasicMaterial color={INK} transparent opacity={0.3} />
              </mesh>
            ))}
            <mesh position={[zone * 0.45, 0, -zone * 0.35]}>
              <sphereGeometry args={[0.2, 10, 10]} />
              <meshBasicMaterial color={RUST} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

const SCENES: Record<SceneId, () => ReactElement> = {
  recurrence: Recurrence,
  inhibition: Inhibition,
  record: Record,
  room: Room,
  schedule: Schedule,
  person: Person,
  across: Across,
}

export function Station({ scene, index }: { scene: SceneId; index: number }) {
  const Shape = SCENES[scene]
  return (
    <group position={[0, 0, stationZ(index)]}>
      <Shape />
    </group>
  )
}
