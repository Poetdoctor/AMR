import { useMemo, useRef } from 'react'
import type { ReactElement } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { SceneId } from '@/lib/beats'

/**
 * Ten scenes, one person.
 *
 * The brief, and the correction that produced it: an earlier version of this
 * page drew bacteria, plates and zones of inhibition. Accurate, and the exact
 * mistake almost every AMR page makes — it turns the story into an organism.
 * What the interviews contain is fear, uncertainty, isolation, exhaustion and
 * wanting to be seen, so the weighting here is roughly 70% human experience,
 * 20% the system around it, 10% biology. The bacterium appears once, in beat
 * eight, and it is smaller than the words people wrap around it.
 *
 * There is one figure throughout: a standing form, deliberately featureless.
 * It leans, sinks, is enclosed and is finally turned towards. Everyone else is
 * the same form, dimmer. Nothing is modelled — every scene is primitives and
 * instanced points, as CLAUDE.md requires — but the geometry is now of a person
 * rather than of a pathogen.
 */

export const STATION_GAP = 34
export const SCENE_ORDER: SceneId[] = [
  'fall',
  'rollercoaster',
  'weight',
  'corridor',
  'machine',
  'glass',
  'ocean',
  'monster',
  'world',
  'whole',
]

export function stationZ(index: number): number {
  return -index * STATION_GAP
}

const INK = new THREE.Color('#8a7965')
const RUST = new THREE.Color('#b04a22')
const WARM = new THREE.Color('#e58a55')

function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

/**
 * The person.
 *
 * A tapered column and a head — enough to read as somebody standing, with
 * nothing that says who. `lean` tilts them, `weight` presses them down. Rust
 * marks the patient; everyone else is ink.
 */
function Figure({
  position = [0, 0, 0],
  scale = 1,
  colour = RUST,
  opacity = 1,
  lean = 0,
  sink = 0,
}: {
  position?: [number, number, number]
  scale?: number
  colour?: THREE.Color
  opacity?: number
  lean?: number
  sink?: number
}) {
  return (
    <group
      position={[position[0], position[1] - sink, position[2]]}
      rotation={[lean, 0, lean * 0.5]}
      scale={scale}
    >
      <mesh position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.22, 0.9, 4, 12]} />
        <meshBasicMaterial color={colour} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.2, 14, 14]} />
        <meshBasicMaterial color={colour} transparent opacity={opacity} />
      </mesh>
    </group>
  )
}

/** Beat 1 — a narrow path in the dark, and the floor beginning to tilt. */
function Fall() {
  const path = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!path.current) return
    // The tilt is small and slow. A dramatic fall would be a different story.
    path.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.22) * 0.07
  })
  return (
    <group ref={path}>
      <mesh position={[0, -1.2, -6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 46]} />
        <meshBasicMaterial color={INK} transparent opacity={0.14} side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: 22 }, (_, i) => (
        <mesh key={i} position={[0, -1.18, 6 - i * 2.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.2, 0.03]} />
          <meshBasicMaterial color={INK} transparent opacity={0.24 - i * 0.008} />
        </mesh>
      ))}
      <Figure position={[0, -1.2, 0]} lean={0.06} />
    </group>
  )
}

/** Beat 2 — the ground moves; the person does not. */
function Rollercoaster() {
  const terrain = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => new THREE.PlaneGeometry(64, 30, 72, 34), [])

  useFrame((state) => {
    if (!terrain.current) return
    const t = state.clock.elapsedTime * 0.5
    const position = geometry.attributes.position
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i)
      const y = position.getY(i)
      // Long swells rather than noise: hope, despair, encouragement, back down.
      const z = Math.sin(x * 0.22 + t) * 1.9 + Math.sin(y * 0.3 - t * 0.7) * 1.1
      position.setZ(i, z)
    }
    position.needsUpdate = true
  })

  return (
    <group>
      <mesh
        ref={terrain}
        geometry={geometry}
        rotation={[-Math.PI / 2.1, 0, 0]}
        position={[0, -3.4, 0]}
      >
        <meshBasicMaterial color={INK} wireframe transparent opacity={0.3} />
      </mesh>
      <Figure position={[0, -1.4, 4]} />
    </group>
  )
}

/** Beat 3 — every course of treatment, gathering, until it bends someone. */
function Weight() {
  const cloud = useRef<THREE.InstancedMesh>(null)
  const figure = useRef<THREE.Group>(null)
  const COUNT = 300
  const points = useMemo(() => {
    const random = seeded(17)
    return Array.from({ length: COUNT }, () => ({
      angle: random() * Math.PI * 2,
      radius: 1.4 + random() * 3.4,
      height: 1 + random() * 3.6,
      speed: 0.2 + random() * 0.5,
    }))
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (cloud.current) {
      const matrix = new THREE.Matrix4()
      points.forEach((p, i) => {
        const angle = p.angle + t * p.speed * 0.25
        matrix.makeScale(0.07, 0.07, 0.07)
        matrix.setPosition(
          Math.cos(angle) * p.radius,
          p.height + Math.sin(t * 0.5 + p.angle) * 0.2,
          Math.sin(angle) * p.radius,
        )
        cloud.current!.setMatrixAt(i, matrix)
      })
      cloud.current.instanceMatrix.needsUpdate = true
    }
    if (figure.current) {
      // The posture gives way slowly, and stays given way.
      const target = 0.34
      figure.current.rotation.z = THREE.MathUtils.damp(
        figure.current.rotation.z,
        target,
        0.35,
        delta,
      )
    }
  })

  return (
    <group>
      <instancedMesh ref={cloud} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color={INK} transparent opacity={0.4} />
      </instancedMesh>
      <group ref={figure} position={[0, -1.6, 0]}>
        <Figure />
      </group>
    </group>
  )
}

/** Beat 4 — everyone is moving, and nobody stops. */
function Corridor() {
  const staff = useRef<THREE.Group>(null)
  const people = useMemo(() => {
    const random = seeded(37)
    return Array.from({ length: 16 }, () => ({
      x: (random() - 0.5) * 9,
      z: -random() * 44,
      speed: 4 + random() * 5,
      scale: 0.9 + random() * 0.3,
    }))
  }, [])

  useFrame((state, delta) => {
    if (!staff.current) return
    staff.current.children.forEach((child, i) => {
      child.position.z += people[i].speed * delta
      if (child.position.z > 14) child.position.z = -46
    })
    void state
  })

  return (
    <group>
      {/* the corridor */}
      {[-5.5, 5.5].map((x) => (
        <mesh key={x} position={[x, 1, -16]}>
          <planeGeometry args={[0.02, 8]} />
          <meshBasicMaterial color={INK} transparent opacity={0.2} />
        </mesh>
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} position={[0, -1.4, 4 - i * 3.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[11, 0.03]} />
          <meshBasicMaterial color={INK} transparent opacity={0.18} />
        </mesh>
      ))}
      <group ref={staff}>
        {people.map((p, i) => (
          <group key={i} position={[p.x, -1.4, p.z]}>
            <Figure scale={p.scale} colour={INK} opacity={0.34} />
          </group>
        ))}
      </group>
      {/* the person, standing still in the middle of it */}
      <Figure position={[0, -1.4, 2]} />
    </group>
  )
}

/** Beat 5 — procedures arriving, none of them explained. */
function Machine() {
  const ring = useRef<THREE.Group>(null)
  const objects = useMemo(() => {
    const random = seeded(59)
    return Array.from({ length: 26 }, (_, i) => ({
      angle: (i / 26) * Math.PI * 2,
      radius: 3.4 + random() * 3.4,
      height: -1 + random() * 5,
      size: 0.16 + random() * 0.3,
      long: random() > 0.6,
    }))
  }, [])

  useFrame((_, delta) => {
    if (ring.current) ring.current.rotation.y += delta * 0.32
  })

  return (
    <group>
      {/* the machine above, too big to see the whole of */}
      <mesh position={[0, 7.5, 0]}>
        <boxGeometry args={[16, 5, 16]} />
        <meshBasicMaterial color={INK} wireframe transparent opacity={0.16} />
      </mesh>
      <group ref={ring}>
        {objects.map((o, i) => (
          <mesh
            key={i}
            position={[Math.cos(o.angle) * o.radius, o.height, Math.sin(o.angle) * o.radius]}
            rotation={[o.angle, o.angle * 2, 0]}
          >
            {o.long ? (
              <cylinderGeometry args={[0.035, 0.035, o.size * 6, 6]} />
            ) : (
              <boxGeometry args={[o.size, o.size, o.size]} />
            )}
            <meshBasicMaterial color={INK} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
      <Figure position={[0, -1.8, 0]} scale={0.85} />
    </group>
  )
}

/**
 * Beat 6 — the strongest one.
 *
 * The room does not change. Walls appear between the person and everybody
 * else, and the people outside are still close enough to see.
 */
function Glass() {
  const walls = useRef<THREE.Group>(null)
  const visitors = useMemo(
    () => [
      { p: [6.4, -1.4, 1.5] as [number, number, number] },
      { p: [7.6, -1.4, -2.2] as [number, number, number] },
      { p: [5.9, -1.4, -4.6] as [number, number, number] },
      { p: [8.4, -1.4, 3.4] as [number, number, number] },
    ],
    [],
  )

  useFrame((state) => {
    if (!walls.current) return
    // The panes ease in rather than snapping: nobody notices the moment.
    const t = Math.min(1, state.clock.elapsedTime / 4)
    walls.current.children.forEach((child, i) => {
      const local = Math.max(0, Math.min(1, t * 3 - i * 0.7))
      child.scale.y = local
      ;(child as THREE.Mesh).visible = local > 0.01
    })
  })

  return (
    <group>
      {/* the room */}
      <mesh position={[-1, 0.6, 0]}>
        <boxGeometry args={[9, 6, 11]} />
        <meshBasicMaterial color={INK} wireframe transparent opacity={0.22} />
      </mesh>
      <group ref={walls}>
        {[3.6, 4.2, 4.8].map((x, i) => (
          <mesh key={x} position={[x, 0.6, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[11, 6]} />
            <meshBasicMaterial
              color={WARM}
              transparent
              opacity={0.09 - i * 0.02}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
      <Figure position={[-1, -1.4, 0]} />
      {visitors.map((v, i) => (
        <Figure key={i} position={v.p} colour={INK} opacity={0.4} scale={0.95} />
      ))}
    </group>
  )
}

/** Beat 7 — alone, and then the lights of everybody else who is alone. */
function Ocean() {
  const lights = useRef<THREE.InstancedMesh>(null)
  const COUNT = 90
  const points = useMemo(() => {
    const random = seeded(71)
    return Array.from({ length: COUNT }, () => {
      const angle = random() * Math.PI * 2
      const distance = 9 + random() * 26
      return {
        p: [Math.cos(angle) * distance, -1.5 + random() * 0.5, Math.sin(angle) * distance] as [
          number,
          number,
          number,
        ],
        phase: random() * Math.PI * 2,
      }
    })
  }, [])

  useFrame((state) => {
    if (!lights.current) return
    const t = state.clock.elapsedTime
    const matrix = new THREE.Matrix4()
    points.forEach((point, i) => {
      // Each one appears in its own time, not on a shared beat.
      const pulse = 0.55 + 0.45 * Math.sin(t * 0.5 + point.phase)
      const size = 0.1 * pulse
      matrix.makeScale(size, size, size)
      matrix.setPosition(point.p[0], point.p[1], point.p[2])
      lights.current!.setMatrixAt(i, matrix)
    })
    lights.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <mesh position={[0, -1.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.4, 40]} />
        <meshBasicMaterial color={INK} transparent opacity={0.14} />
      </mesh>
      <instancedMesh ref={lights} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={WARM} />
      </instancedMesh>
      <Figure position={[0, -1.85, 0]} />
    </group>
  )
}

/**
 * Beat 8 — the only biology in the whole sequence, and it is tiny.
 *
 * A large dark mass made of orbiting fragments — the words. Inside it,
 * something very small. The point of the beat is the difference in scale.
 */
function Monster() {
  const shell = useRef<THREE.Group>(null)
  const COUNT = 260
  const fragments = useMemo(() => {
    const random = seeded(89)
    return Array.from({ length: COUNT }, () => {
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)
      const r = 4.6 + random() * 2.2
      return {
        p: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ] as [number, number, number],
        size: 0.1 + random() * 0.3,
      }
    })
  }, [])
  const mesh = useRef<THREE.InstancedMesh>(null)

  useFrame((state, delta) => {
    if (shell.current) shell.current.rotation.y += delta * 0.12
    if (!mesh.current) return
    const matrix = new THREE.Matrix4()
    const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.4) * 0.06
    fragments.forEach((f, i) => {
      matrix.makeScale(f.size, f.size, f.size)
      matrix.setPosition(f.p[0] * breathe, f.p[1] * breathe, f.p[2] * breathe)
      mesh.current!.setMatrixAt(i, matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <group ref={shell}>
        <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={INK} transparent opacity={0.42} />
        </instancedMesh>
      </group>
      {/* what is actually in there */}
      <mesh>
        <capsuleGeometry args={[0.12, 0.26, 4, 10]} />
        <meshBasicMaterial color={RUST} />
      </mesh>
    </group>
  )
}

/** Beat 9 — a life, with appointments pinned all the way through it. */
function World() {
  const places = useMemo(
    () => [
      { p: [-6, 1.6, -3] as [number, number, number], s: 1.6 },
      { p: [5.4, 2.4, -6] as [number, number, number], s: 1.2 },
      { p: [-4.4, -2.2, 3] as [number, number, number], s: 1.4 },
      { p: [6.2, -1.4, 2.4] as [number, number, number], s: 1.1 },
      { p: [0.6, 3.4, 1] as [number, number, number], s: 1.3 },
    ],
    [],
  )
  const pins = useMemo(() => {
    const random = seeded(97)
    return Array.from({ length: 26 }, () => {
      const from = places[Math.floor(random() * places.length)]
      return [
        from.p[0] + (random() - 0.5) * 3.4,
        from.p[1] + (random() - 0.5) * 2.6,
        from.p[2] + (random() - 0.5) * 3.4,
      ] as [number, number, number]
    })
  }, [places])

  return (
    <group>
      {places.map((place, i) => (
        <mesh key={i} position={place.p}>
          <boxGeometry args={[place.s, place.s, place.s]} />
          <meshBasicMaterial color={INK} wireframe transparent opacity={0.3} />
        </mesh>
      ))}
      {pins.map((pin, i) => (
        <mesh key={i} position={pin}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color={RUST} transparent opacity={0.75} />
        </mesh>
      ))}
      <Figure position={[0, -1.4, 4]} scale={0.9} />
    </group>
  )
}

/**
 * Beat 10 — everything that has happened, orbiting one person.
 *
 * Same geometry as the earlier scenes, brought back and turned around them.
 * The person is at the centre. The infection is not.
 */
function Whole() {
  const orbit = useRef<THREE.Group>(null)
  const COUNT = 200
  const mesh = useRef<THREE.InstancedMesh>(null)
  const points = useMemo(() => {
    const random = seeded(103)
    return Array.from({ length: COUNT }, (_, i) => {
      const angle = (i / COUNT) * Math.PI * 2 * 3
      const radius = 3 + (i / COUNT) * 6
      return {
        p: [Math.cos(angle) * radius, (random() - 0.5) * 5, Math.sin(angle) * radius] as [
          number,
          number,
          number,
        ],
        size: 0.05 + random() * 0.12,
        warm: random() > 0.72,
      }
    })
  }, [])

  useFrame((_, delta) => {
    if (orbit.current) orbit.current.rotation.y += delta * 0.1
    if (!mesh.current) return
    const matrix = new THREE.Matrix4()
    points.forEach((point, i) => {
      matrix.makeScale(point.size, point.size, point.size)
      matrix.setPosition(point.p[0], point.p[1], point.p[2])
      mesh.current!.setMatrixAt(i, matrix)
      mesh.current!.setColorAt(i, point.warm ? WARM : INK)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  })

  return (
    <group>
      <group ref={orbit}>
        <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial transparent opacity={0.6} />
        </instancedMesh>
      </group>
      <Figure position={[0, -1.4, 0]} scale={1.25} />
    </group>
  )
}

const SCENES: Record<SceneId, () => ReactElement> = {
  fall: Fall,
  rollercoaster: Rollercoaster,
  weight: Weight,
  corridor: Corridor,
  machine: Machine,
  glass: Glass,
  ocean: Ocean,
  monster: Monster,
  world: World,
  whole: Whole,
}

export function Station({ scene, index }: { scene: SceneId; index: number }) {
  const Shape = SCENES[scene]
  return (
    <group position={[0, 0, stationZ(index)]}>
      <Shape />
    </group>
  )
}
