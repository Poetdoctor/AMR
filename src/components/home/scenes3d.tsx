import { useMemo, useRef } from 'react'
import type { ReactElement } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { SceneId } from '@/lib/beats'
import { Figure, OtherFigure, PALETTE, SceneLight, WorldWord } from './atmosphere'

/**
 * Eleven scenes. One person.
 *
 * The direction, and the two corrections that produced it: the first version
 * was generic geometry, the second was culture plates and zones of inhibition.
 * Both were about the wrong thing. What the interviews contain is fear,
 * uncertainty, isolation, misunderstanding, exhaustion and wanting to be seen,
 * so the weighting is roughly 70% human experience, 20% the system around it,
 * 10% biology — and the reader should feel it before being taught anything.
 * The organism appears once, in beat eight, smaller than the words wrapped
 * around it.
 *
 * Everything is procedural, as CLAUDE.md requires: lathe profiles, instanced
 * points, displaced planes, generated text. Nothing is a modelled asset. What
 * changed is that it is now lit, which is the difference between a diagram of
 * a person and a person.
 */

export const STATION_GAP = 56
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
  'breath',
]

export function stationZ(index: number): number {
  return -index * STATION_GAP
}

function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

/** Dust in the light. Present in most scenes; it makes the air feel occupied. */
function Motes({
  count = 900,
  spread = 26,
  colour = PALETTE.bone,
}: {
  count?: number
  spread?: number
  colour?: THREE.Color
}) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const motes = useMemo(() => {
    const random = seeded(5)
    return Array.from({ length: count }, () => ({
      p: [
        (random() - 0.5) * spread,
        (random() - 0.5) * spread * 0.7,
        (random() - 0.5) * spread,
      ] as [number, number, number],
      size: 0.008 + random() * 0.03,
      speed: 0.05 + random() * 0.16,
      phase: random() * Math.PI * 2,
    }))
  }, [count, spread])

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    const matrix = new THREE.Matrix4()
    motes.forEach((mote, i) => {
      const drift = Math.sin(t * mote.speed + mote.phase) * 0.7
      matrix.makeScale(mote.size, mote.size, mote.size)
      matrix.setPosition(
        mote.p[0] + drift,
        mote.p[1] + Math.cos(t * mote.speed * 0.7) * 0.5,
        mote.p[2],
      )
      mesh.current!.setMatrixAt(i, matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshBasicMaterial color={colour} transparent opacity={0.22} />
    </instancedMesh>
  )
}

/* ─── 1 ─────────────────────────────────────────────────────────────────────
 * The fall. A lit path in unlit space, and the floor going out of level.
 * Nothing dramatic — a sinking, not a collapse.
 */
function Fall() {
  const world = useRef<THREE.Group>(null)
  const figure = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (world.current) world.current.rotation.z = Math.sin(t * 0.19) * 0.075
    if (figure.current) figure.current.rotation.z = -Math.sin(t * 0.19) * 0.045
  })

  return (
    <group>
      <SceneLight intensity={0.85} />
      <Motes count={700} spread={30} />
      <group ref={world}>
        {/* the path, glowing faintly from within */}
        <mesh position={[0, -1.6, -14]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[3.4, 62]} />
          <meshStandardMaterial
            color={PALETTE.deep}
            emissive={PALETTE.bone}
            emissiveIntensity={0.06}
            roughness={0.85}
          />
        </mesh>
        {Array.from({ length: 30 }, (_, i) => (
          <mesh key={i} position={[0, -1.57, 8 - i * 2.2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.4, 0.02]} />
            <meshBasicMaterial
              color={PALETTE.bone}
              transparent
              opacity={Math.max(0, 0.3 - i * 0.011)}
            />
          </mesh>
        ))}
        <group ref={figure}>
          <Figure position={[0, -1.6, 0]} />
        </group>
      </group>

      <WorldWord position={[-4.6, 2.6, 3]} size={1.05} drift={1} colour={PALETTE.ember}>
        Hope
      </WorldWord>
      <WorldWord position={[3.9, 1.5, 1]} size={0.95} drift={0.8}>
        Again?
      </WorldWord>
      <WorldWord position={[-2.4, 0.2, -2]} size={1.15} drift={0.6} colour={PALETTE.rust}>
        Fear
      </WorldWord>
    </group>
  )
}

/* ─── 2 ─────────────────────────────────────────────────────────────────────
 * The rollercoaster. The ground moves; the person does not.
 */
function Rollercoaster() {
  const terrain = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => new THREE.PlaneGeometry(80, 44, 110, 60), [])

  useFrame((state) => {
    if (!terrain.current) return
    const t = state.clock.elapsedTime * 0.42
    const position = geometry.attributes.position
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i)
      const y = position.getY(i)
      // Long swells: hope, despair, encouragement, back down again.
      const z =
        Math.sin(x * 0.19 + t) * 2.3 +
        Math.sin(y * 0.26 - t * 0.66) * 1.4 +
        Math.sin((x + y) * 0.09 + t * 0.4) * 0.9
      position.setZ(i, z)
    }
    position.needsUpdate = true
    geometry.computeVertexNormals()
  })

  return (
    <group>
      <SceneLight intensity={0.7} />
      <Motes count={500} spread={30} />
      <mesh
        ref={terrain}
        geometry={geometry}
        rotation={[-Math.PI / 2.05, 0, 0]}
        position={[0, -4.4, -4]}
      >
        <meshStandardMaterial
          color={PALETTE.deep}
          emissive={PALETTE.ink}
          emissiveIntensity={0.16}
          roughness={0.9}
          wireframe
        />
      </mesh>
      <Figure position={[0, -1.9, 5]} />
      <WorldWord position={[-6.5, 3.3, -2]} size={0.8} flicker={0.8} colour={PALETTE.ember}>
        Happiness
      </WorldWord>
      <WorldWord position={[5.4, 1.1, -5]} size={0.8} flicker={0.6} colour={PALETTE.rust}>
        Despair
      </WorldWord>
      <WorldWord position={[-4.2, -0.4, -8]} size={0.75} flicker={0.7}>
        Encouraged
      </WorldWord>
      <WorldWord position={[4.1, -2.2, -11]} size={0.75} flicker={0.5} colour={PALETTE.rust}>
        Back in the dumps
      </WorldWord>
    </group>
  )
}

/* ─── 3 ─────────────────────────────────────────────────────────────────────
 * The invisible weight. Every course of treatment, gathering, until it bends
 * somebody. Norma collapsed from this, not from the infection.
 */
function Weight() {
  const cloud = useRef<THREE.InstancedMesh>(null)
  const figure = useRef<THREE.Group>(null)
  const COUNT = 2600

  const particles = useMemo(() => {
    const random = seeded(17)
    return Array.from({ length: COUNT }, () => ({
      angle: random() * Math.PI * 2,
      radius: 0.6 + random() * 5.2,
      height: 0.6 + random() * 5,
      size: 0.02 + random() * 0.07,
      speed: 0.1 + random() * 0.4,
      phase: random() * Math.PI * 2,
    }))
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (cloud.current) {
      const matrix = new THREE.Matrix4()
      // The cloud descends over the beat: it does not hang, it settles.
      const settle = Math.min(1, t / 14)
      particles.forEach((p, i) => {
        const angle = p.angle + t * p.speed * 0.16
        const radius = p.radius * (1 - settle * 0.28)
        matrix.makeScale(p.size, p.size, p.size)
        matrix.setPosition(
          Math.cos(angle) * radius,
          p.height * (1 - settle * 0.42) + Math.sin(t * 0.4 + p.phase) * 0.12,
          Math.sin(angle) * radius,
        )
        cloud.current!.setMatrixAt(i, matrix)
      })
      cloud.current.instanceMatrix.needsUpdate = true
    }
    if (figure.current) {
      figure.current.rotation.z = THREE.MathUtils.damp(figure.current.rotation.z, 0.42, 0.18, delta)
      figure.current.position.y = THREE.MathUtils.damp(figure.current.position.y, -2.4, 0.15, delta)
    }
  })

  return (
    <group>
      <SceneLight intensity={0.65} colour={PALETTE.rust} />
      <instancedMesh ref={cloud} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[1, 5, 5]} />
        <meshStandardMaterial
          color={PALETTE.ink}
          emissive={PALETTE.ink}
          emissiveIntensity={0.5}
          transparent
          opacity={0.55}
        />
      </instancedMesh>
      <group ref={figure} position={[0, -1.7, 0]}>
        <Figure />
      </group>
      <WorldWord position={[-5, 4.6, 2]} size={0.7} flicker={0.4}>
        Another course
      </WorldWord>
      <WorldWord position={[4.4, 3.2, 1]} size={0.7} flicker={0.5}>
        And another
      </WorldWord>
      <WorldWord position={[0, -4.6, 3]} size={1.1} colour={PALETTE.rust}>
        Enough
      </WorldWord>
    </group>
  )
}

/* ─── 4 ─────────────────────────────────────────────────────────────────────
 * The hospital that doesn't see you. Everyone competent, everyone busy, and
 * the words arriving on time while the person carrying them is not asked
 * anything. The camera sits at their height.
 */
function Corridor() {
  const staff = useRef<THREE.Group>(null)
  const words = useRef<THREE.Group>(null)

  const people = useMemo(() => {
    const random = seeded(37)
    return Array.from({ length: 22 }, () => ({
      x: (random() - 0.5) * 8.5,
      z: -random() * 60,
      speed: 7 + random() * 9,
      scale: 0.92 + random() * 0.26,
    }))
  }, [])

  useFrame((_, delta) => {
    staff.current?.children.forEach((child, i) => {
      child.position.z += people[i].speed * delta
      if (child.position.z > 16) child.position.z = -58
    })
    words.current?.children.forEach((child) => {
      child.position.z += 9 * delta
      if (child.position.z > 14) child.position.z = -46
    })
  })

  return (
    <group>
      <SceneLight intensity={0.55} colour={PALETTE.glass} />
      <Motes count={400} spread={20} />
      {/* pools of ceiling light, receding */}
      {Array.from({ length: 16 }, (_, i) => (
        <pointLight
          key={i}
          position={[0, 4.2, 8 - i * 4.4]}
          intensity={162}
          color={PALETTE.bone}
          distance={33}
          decay={2}
        />
      ))}
      <mesh position={[0, -1.9, -26]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[13, 78]} />
        <meshStandardMaterial color={PALETTE.deep} roughness={0.7} metalness={0.1} />
      </mesh>
      {[-6.5, 6.5].map((x) => (
        <mesh
          key={x}
          position={[x, 1.4, -26]}
          rotation={[0, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
        >
          <planeGeometry args={[78, 7]} />
          <meshStandardMaterial color={PALETTE.deep} roughness={0.95} />
        </mesh>
      ))}

      <group ref={staff}>
        {people.map((p, i) => (
          <group key={i} position={[p.x, -1.9, p.z]}>
            <OtherFigure position={[0, 0, 0]} scale={p.scale} opacity={0.55} />
          </group>
        ))}
      </group>

      <group ref={words}>
        {['Diagnosis', 'Prescription', 'Test', 'Procedure'].map((word, i) => (
          <group key={word} position={[i % 2 === 0 ? -3.4 : 3.4, 0.6 + (i % 3) * 1.1, -12 * i - 4]}>
            <Text
              fontSize={0.62}
              color={PALETTE.bone}
              anchorX="center"
              anchorY="middle"
              material-transparent
              material-opacity={0.5}
              material-depthWrite={false}
            >
              {word}
            </Text>
          </group>
        ))}
      </group>

      <Figure position={[0, -1.9, 3]} />
    </group>
  )
}

/* ─── 5 ─────────────────────────────────────────────────────────────────────
 * The missing explanation. A machine overhead too large to see the whole of,
 * throwing procedures down at somebody who was never told why.
 */
function Machine() {
  const ring = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)

  const objects = useMemo(() => {
    const random = seeded(59)
    return Array.from({ length: 46 }, (_, i) => ({
      angle: (i / 46) * Math.PI * 2,
      radius: 3 + random() * 4.6,
      height: -1.4 + random() * 6.5,
      size: 0.14 + random() * 0.34,
      long: random() > 0.55,
      spin: (random() - 0.5) * 2,
    }))
  }, [])

  useFrame((_, delta) => {
    if (ring.current) ring.current.rotation.y += delta * 0.26
    if (inner.current) inner.current.rotation.y -= delta * 0.42
  })

  return (
    <group>
      <SceneLight intensity={0.5} colour={PALETTE.glass} />
      <Motes count={600} spread={22} />
      {/* the machine, cut off by the top of the frame on purpose */}
      <group position={[0, 9.5, 0]}>
        <mesh>
          <boxGeometry args={[22, 6, 22]} />
          <meshStandardMaterial color={PALETTE.deep} roughness={0.6} metalness={0.35} />
        </mesh>
        {Array.from({ length: 26 }, (_, i) => {
          const random = seeded(i + 3)
          return (
            <mesh key={i} position={[(random() - 0.5) * 18, -3.1, (random() - 0.5) * 18]}>
              <cylinderGeometry args={[0.06, 0.06, 1.4 + random() * 2.4, 6]} />
              <meshStandardMaterial
                color={PALETTE.ink}
                emissive={PALETTE.glass}
                emissiveIntensity={0.4}
              />
            </mesh>
          )
        })}
      </group>
      <pointLight
        position={[0, 5, 0]}
        intensity={396}
        color={PALETTE.glass}
        distance={48}
        decay={2}
      />

      <group ref={ring}>
        {objects.slice(0, 26).map((o, i) => (
          <mesh
            key={i}
            position={[Math.cos(o.angle) * o.radius, o.height, Math.sin(o.angle) * o.radius]}
            rotation={[o.angle * o.spin, o.angle, o.spin]}
          >
            {o.long ? (
              <cylinderGeometry args={[0.03, 0.03, o.size * 7, 6]} />
            ) : (
              <boxGeometry args={[o.size, o.size, o.size]} />
            )}
            <meshStandardMaterial color={PALETTE.bone} roughness={0.4} metalness={0.5} />
          </mesh>
        ))}
      </group>
      <group ref={inner}>
        {objects.slice(26).map((o, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(o.angle) * o.radius * 0.55,
              o.height * 0.6,
              Math.sin(o.angle) * o.radius * 0.55,
            ]}
            rotation={[o.angle, 0, o.spin]}
          >
            <boxGeometry args={[o.size * 0.7, o.size * 0.7, o.size * 0.7]} />
            <meshStandardMaterial color={PALETTE.ink} roughness={0.5} metalness={0.3} />
          </mesh>
        ))}
      </group>

      <Figure position={[0, -2.6, 0]} scale={0.9} />
      <WorldWord position={[-5.2, -0.6, 4]} size={0.62} flicker={0.5}>
        Why this?
      </WorldWord>
      <WorldWord position={[5, -1.4, 3]} size={0.62} flicker={0.4}>
        Why now?
      </WorldWord>
      <WorldWord position={[0, -4.4, 4]} size={0.8} colour={PALETTE.rust}>
        Nobody said
      </WorldWord>
    </group>
  )
}

/* ─── 6 ─────────────────────────────────────────────────────────────────────
 * Isolation. The strongest scene, and the only one with real glass in it.
 *
 * The room does not change. Panes form between the person and everyone else,
 * one after another. The family are still there, still lit, still close enough
 * to see — and the thoughts settle onto the glass as marks that will not come
 * off.
 */
function Glass() {
  const panes = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!panes.current) return
    // They arrive one at a time, easing, so no single moment is the moment.
    const t = state.clock.elapsedTime
    panes.current.children.forEach((child, i) => {
      const local = Math.max(0, Math.min(1, (t - i * 2.2) / 2.6))
      const eased = local * local * (3 - 2 * local)
      child.scale.y = Math.max(0.001, eased)
      child.visible = eased > 0.01
    })
  })

  const visitors: [number, number, number][] = [
    [6.6, -2, 1.8],
    [8.2, -2, -2.4],
    [6.1, -2, -5.2],
    [9.1, -2, 4.2],
  ]

  return (
    <group position={[1.5, 0.4, 0]} scale={0.6}>
      <SceneLight intensity={0.55} />
      <Motes count={350} spread={16} />

      {/* the room: warm, and completely ordinary */}
      <mesh position={[-2, -2.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[11, 13]} />
        <meshStandardMaterial color={PALETTE.deep} roughness={0.85} />
      </mesh>
      <pointLight
        position={[-2.5, 2.4, 1]}
        intensity={288}
        color={PALETTE.ember}
        distance={39}
        decay={2}
      />
      {[
        [-7.4, 0.6, 0, Math.PI / 2],
        [-2, 0.6, -6.4, 0],
      ].map(([x, y, z, ry], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, ry, 0]}>
          <planeGeometry args={[13, 7]} />
          <meshStandardMaterial color={PALETTE.deep} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* the panes */}
      <group ref={panes}>
        {[3.4, 4.3, 5.2].map((x) => (
          <mesh key={x} position={[x, 0.4, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[13, 7]} />
            <MeshTransmissionMaterial
              samples={4}
              resolution={128}
              transmission={0.97}
              roughness={0.14}
              thickness={0.5}
              ior={1.3}
              chromaticAberration={0.06}
              anisotropy={0.2}
              distortion={0.15}
              distortionScale={0.3}
              temporalDistortion={0.05}
              color={PALETTE.glass}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* the thoughts, settled on the glass */}
      <WorldWord
        position={[3.45, 2.3, 2.6]}
        size={0.44}
        colour={PALETTE.bone}
        opacity={0.5}
        flicker={0.3}
      >
        Am I dangerous?
      </WorldWord>
      <WorldWord
        position={[3.45, 0.4, -2.2]}
        size={0.44}
        colour={PALETTE.bone}
        opacity={0.45}
        flicker={0.25}
      >
        Am I contagious?
      </WorldWord>
      <WorldWord
        position={[3.45, -1.4, 3.4]}
        size={0.46}
        colour={PALETTE.rust}
        opacity={0.6}
        flicker={0.2}
      >
        Am I dirty?
      </WorldWord>

      <Figure position={[-2, -2, 0]} />
      {visitors.map((p, i) => (
        <OtherFigure key={i} position={p} scale={0.98} opacity={0.6} />
      ))}
      {/* the people outside are lit too. They did not leave. */}
      <pointLight
        position={[7.5, 1.5, 0]}
        intensity={144}
        color={PALETTE.glass}
        distance={36}
        decay={2}
      />
    </group>
  )
}

/* ─── 7 ─────────────────────────────────────────────────────────────────────
 * The loneliness. A dark ocean, one small island, and then the lights of
 * everyone else who is also alone. As the reader goes on, lines find their way
 * between them: the community that does not exist yet, but could.
 */
function Ocean() {
  const water = useRef<THREE.Mesh>(null)
  const lights = useRef<THREE.InstancedMesh>(null)
  const links = useRef<THREE.LineSegments>(null)
  const COUNT = 220
  const geometry = useMemo(() => new THREE.PlaneGeometry(140, 140, 90, 90), [])

  const others = useMemo(() => {
    const random = seeded(71)
    return Array.from({ length: COUNT }, () => {
      const angle = random() * Math.PI * 2
      const distance = 11 + random() * 52
      return {
        p: new THREE.Vector3(Math.cos(angle) * distance, -2.1, Math.sin(angle) * distance),
        phase: random() * Math.PI * 2,
        speed: 0.25 + random() * 0.5,
      }
    })
  }, [])

  // Each light reaches for its nearest neighbours. Nobody is connected to
  // everybody; that is not what this is.
  const linkGeometry = useMemo(() => {
    const points: THREE.Vector3[] = []
    others.forEach((a, i) => {
      const near = others
        .map((b, j) => ({ b, j, d: a.p.distanceTo(b.p) }))
        .filter((x) => x.j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 2)
      near.forEach(({ b }) => {
        points.push(a.p.clone(), b.p.clone())
      })
    })
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [others])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (water.current) {
      const position = geometry.attributes.position
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i)
        const y = position.getY(i)
        position.setZ(i, Math.sin(x * 0.09 + t * 0.4) * 0.35 + Math.sin(y * 0.13 - t * 0.3) * 0.25)
      }
      position.needsUpdate = true
    }
    if (lights.current) {
      const matrix = new THREE.Matrix4()
      others.forEach((light, i) => {
        // Appearing one at a time, each in its own rhythm.
        const arrive = Math.max(0, Math.min(1, (t - 1 - i * 0.045) / 1.6))
        const pulse = 0.6 + 0.4 * Math.sin(t * light.speed + light.phase)
        const size = 0.16 * pulse * arrive
        matrix.makeScale(size, size, size)
        matrix.setPosition(light.p.x, light.p.y, light.p.z)
        lights.current!.setMatrixAt(i, matrix)
      })
      lights.current.instanceMatrix.needsUpdate = true
    }
    if (links.current) {
      const material = links.current.material as THREE.LineBasicMaterial
      material.opacity = Math.max(0, Math.min(0.16, (t - 12) * 0.02))
    }
  })

  return (
    <group>
      <ambientLight intensity={1} color={PALETTE.glass} />
      <mesh ref={water} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]}>
        <meshStandardMaterial color={PALETTE.void} roughness={0.25} metalness={0.6} />
      </mesh>
      <mesh position={[0, -2.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.6, 40]} />
        <meshStandardMaterial color={PALETTE.deep} roughness={0.9} />
      </mesh>
      <pointLight
        position={[0, 1.4, 0]}
        intensity={162}
        color={PALETTE.ember}
        distance={27}
        decay={2}
      />

      <lineSegments ref={links} geometry={linkGeometry}>
        <lineBasicMaterial color={PALETTE.ember} transparent opacity={0} />
      </lineSegments>
      <instancedMesh ref={lights} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={PALETTE.ember} />
      </instancedMesh>

      <Figure position={[0, -2.3, 0]} />
      <WorldWord position={[0, 2.6, 4]} size={0.7} opacity={0.55} flicker={0.3}>
        Nobody else
      </WorldWord>
    </group>
  )
}

/* ─── 8 ─────────────────────────────────────────────────────────────────────
 * The monster is a word.
 *
 * A large dark mass built entirely out of language, orbiting. As the reader
 * goes on, the words fall away — and what they were wrapped around is one
 * organism, very small. The only biology in the whole sequence, and the beat
 * exists to show the difference in scale.
 */
function Monster() {
  const shell = useRef<THREE.Group>(null)
  const debris = useRef<THREE.InstancedMesh>(null)
  const organism = useRef<THREE.Mesh>(null)
  const COUNT = 900

  const words = useMemo(
    () =>
      ['SUPERBUG', 'UNTREATABLE', 'DOOMED', 'INFECTIOUS', 'SUPERBUG', 'UNTREATABLE'].map(
        (word, i) => {
          const random = seeded(89 + i)
          const theta = random() * Math.PI * 2
          const phi = Math.acos(2 * random() - 1)
          const r = 5.4
          return {
            word,
            p: [
              r * Math.sin(phi) * Math.cos(theta),
              r * Math.sin(phi) * Math.sin(theta) * 0.7,
              r * Math.cos(phi),
            ] as [number, number, number],
            delay: i * 0.9,
          }
        },
      ),
    [],
  )

  const fragments = useMemo(() => {
    const random = seeded(89)
    return Array.from({ length: COUNT }, () => {
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)
      const r = 4.4 + random() * 2.4
      return {
        dir: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.sin(phi) * Math.sin(theta),
          Math.cos(phi),
        ),
        r,
        size: 0.05 + random() * 0.16,
        delay: random() * 6,
      }
    })
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (shell.current) shell.current.rotation.y += 0.0016
    if (debris.current) {
      const matrix = new THREE.Matrix4()
      fragments.forEach((f, i) => {
        // The words peel away and drift outwards, thinning as they go.
        const shed = Math.max(0, Math.min(1, (t - 6 - f.delay) / 7))
        const radius = f.r * (1 + shed * 3.4)
        const size = f.size * (1 - shed)
        matrix.makeScale(size, size, size)
        matrix.setPosition(f.dir.x * radius, f.dir.y * radius * 0.75, f.dir.z * radius)
        debris.current!.setMatrixAt(i, matrix)
      })
      debris.current.instanceMatrix.needsUpdate = true
    }
    if (organism.current) {
      // What was underneath all of it, breathing.
      const reveal = Math.max(0, Math.min(1, (t - 9) / 4))
      const material = organism.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.4 + reveal * 2.2
      organism.current.scale.setScalar(0.85 + Math.sin(t * 0.8) * 0.05)
      organism.current.rotation.z = t * 0.25
    }
  })

  return (
    <group>
      <ambientLight intensity={0.08} />
      <pointLight
        position={[0, 0, 4]}
        intensity={180}
        color={PALETTE.rust}
        distance={42}
        decay={2}
      />
      <group ref={shell}>
        <instancedMesh ref={debris} args={[undefined, undefined, COUNT]}>
          <boxGeometry args={[1, 0.45, 0.14]} />
          <meshStandardMaterial color={PALETTE.ink} roughness={0.8} transparent opacity={0.75} />
        </instancedMesh>
        {words.map((w, i) => (
          <group key={i} position={w.p}>
            <Text
              fontSize={0.72}
              color={PALETTE.bone}
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.06}
              material-transparent
              material-opacity={0.45}
              material-depthWrite={false}
            >
              {w.word}
            </Text>
          </group>
        ))}
      </group>

      {/* one organism. Nothing else in this story is biology. */}
      <mesh ref={organism}>
        <capsuleGeometry args={[0.1, 0.22, 6, 14]} />
        <meshStandardMaterial
          color={PALETTE.ember}
          emissive={PALETTE.ember}
          emissiveIntensity={0.4}
          roughness={0.3}
        />
      </mesh>
    </group>
  )
}

/* ─── 9 ─────────────────────────────────────────────────────────────────────
 * The world beyond the hospital. Work, school, money, getting there — with
 * appointments pinned all the way through, and the path between them tangling.
 */
function World() {
  const group = useRef<THREE.Group>(null)

  const places = useMemo(
    () => [
      { p: [-8, 2.6, -4] as [number, number, number], s: 2.4 },
      { p: [7, 3.8, -9] as [number, number, number], s: 1.8 },
      { p: [-6, -3, 4] as [number, number, number], s: 2.1 },
      { p: [8.4, -2, 3] as [number, number, number], s: 1.6 },
      { p: [0.5, 5, -2] as [number, number, number], s: 2 },
    ],
    [],
  )

  const pins = useMemo(() => {
    const random = seeded(97)
    return Array.from({ length: 46 }, () => {
      const place = places[Math.floor(random() * places.length)]
      return [
        place.p[0] + (random() - 0.5) * place.s * 2.4,
        place.p[1] + (random() - 0.5) * place.s * 2.4,
        place.p[2] + (random() - 0.5) * place.s * 2.4,
      ] as [number, number, number]
    })
  }, [places])

  // The route between them, drawn as one continuous tangle.
  const routeGeometry = useMemo(() => {
    const random = seeded(101)
    const points: THREE.Vector3[] = []
    for (let i = 0; i < 60; i++) {
      const place = places[i % places.length]
      points.push(
        new THREE.Vector3(
          place.p[0] + (random() - 0.5) * 3,
          place.p[1] + (random() - 0.5) * 3,
          place.p[2] + (random() - 0.5) * 3,
        ),
      )
    }
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.4)
    return new THREE.TubeGeometry(curve, 320, 0.035, 6, false)
  }, [places])

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.045
  })

  return (
    <group>
      <SceneLight intensity={0.55} />
      <Motes count={500} spread={26} />
      <group ref={group}>
        {places.map((place, i) => (
          <mesh key={i} position={place.p}>
            <boxGeometry args={[place.s, place.s, place.s]} />
            <meshStandardMaterial
              color={PALETTE.deep}
              emissive={PALETTE.ink}
              emissiveIntensity={0.22}
              roughness={0.75}
              transparent
              opacity={0.85}
            />
          </mesh>
        ))}
        <mesh geometry={routeGeometry}>
          <meshStandardMaterial
            color={PALETTE.ink}
            emissive={PALETTE.ink}
            emissiveIntensity={0.3}
            roughness={0.6}
          />
        </mesh>
        {pins.map((pin, i) => (
          <mesh key={i} position={pin}>
            <sphereGeometry args={[0.11, 10, 10]} />
            <meshStandardMaterial
              color={PALETTE.rust}
              emissive={PALETTE.rust}
              emissiveIntensity={1.6}
            />
          </mesh>
        ))}
      </group>
      <Figure position={[0, -2.4, 7]} scale={0.95} />
    </group>
  )
}

/* ─── 10 ────────────────────────────────────────────────────────────────────
 * The whole person.
 *
 * Everything the story has been through, brought back and turned around one
 * person. The words arrive from the scenes they came from and settle into
 * orbit. The person is the centre. The infection is not.
 */
function Whole() {
  const orbit = useRef<THREE.Group>(null)
  const swarm = useRef<THREE.InstancedMesh>(null)
  const COUNT = 1400

  const points = useMemo(() => {
    const random = seeded(103)
    return Array.from({ length: COUNT }, (_, i) => {
      const angle = (i / COUNT) * Math.PI * 2 * 5
      const radius = 3.4 + (i / COUNT) * 7
      return {
        angle,
        radius,
        y: (random() - 0.5) * 6,
        size: 0.03 + random() * 0.09,
        warm: random() > 0.68,
        speed: 0.1 + random() * 0.2,
      }
    })
  }, [])

  const arriving = useMemo(
    () =>
      [
        { word: 'Understanding', from: [-9, 4, -3] as [number, number, number] },
        { word: 'Support', from: [8, 3, -5] as [number, number, number] },
        { word: 'Communication', from: [-7, -4, 4] as [number, number, number] },
        { word: 'Education', from: [9, -3, 2] as [number, number, number] },
        { word: 'Connection', from: [0, 6, -6] as [number, number, number] },
        { word: 'Care', from: [0, -6, 5] as [number, number, number] },
      ].map((w, i) => ({
        ...w,
        to: [
          Math.cos((i / 6) * Math.PI * 2) * 4.6,
          Math.sin((i / 6) * Math.PI * 2) * 2.2,
          Math.sin((i / 6) * Math.PI * 2) * 2.6,
        ] as [number, number, number],
        delay: i * 0.7,
      })),
    [],
  )

  const wordRefs = useRef<(THREE.Group | null)[]>([])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (orbit.current) orbit.current.rotation.y += delta * 0.075
    if (swarm.current) {
      const matrix = new THREE.Matrix4()
      const colour = new THREE.Color()
      points.forEach((p, i) => {
        const angle = p.angle + t * p.speed * 0.1
        matrix.makeScale(p.size, p.size, p.size)
        matrix.setPosition(Math.cos(angle) * p.radius, p.y, Math.sin(angle) * p.radius)
        swarm.current!.setMatrixAt(i, matrix)
        swarm.current!.setColorAt(i, colour.copy(p.warm ? PALETTE.ember : PALETTE.ink))
      })
      swarm.current.instanceMatrix.needsUpdate = true
      if (swarm.current.instanceColor) swarm.current.instanceColor.needsUpdate = true
    }
    // Each word travels in from the scene it belongs to and takes its place.
    arriving.forEach((w, i) => {
      const node = wordRefs.current[i]
      if (!node) return
      const progress = Math.max(0, Math.min(1, (t - 1 - w.delay) / 3.4))
      const eased = 1 - Math.pow(1 - progress, 3)
      node.position.set(
        w.from[0] + (w.to[0] - w.from[0]) * eased,
        w.from[1] + (w.to[1] - w.from[1]) * eased,
        w.from[2] + (w.to[2] - w.from[2]) * eased,
      )
      const text = node.children[0] as THREE.Mesh | undefined
      const material = text?.material as THREE.Material | undefined
      if (material) material.opacity = eased * 0.85
    })
  })

  return (
    <group>
      <SceneLight intensity={1.15} />
      <group ref={orbit}>
        <instancedMesh ref={swarm} args={[undefined, undefined, COUNT]}>
          <sphereGeometry args={[1, 7, 7]} />
          <meshStandardMaterial roughness={0.4} emissiveIntensity={0.6} />
        </instancedMesh>
      </group>
      {arriving.map((w, i) => (
        <group
          key={w.word}
          ref={(node) => {
            wordRefs.current[i] = node
          }}
        >
          <Text
            fontSize={0.5}
            color={PALETTE.bone}
            anchorX="center"
            anchorY="middle"
            material-transparent
            material-opacity={0}
            material-depthWrite={false}
          >
            {w.word}
          </Text>
        </group>
      ))}
      <pointLight
        position={[0, 1.5, 3]}
        intensity={360}
        color={PALETTE.ember}
        distance={48}
        decay={2}
      />
      <Figure position={[0, -1.9, 0]} scale={1.45} emissive={1.7} />
    </group>
  )
}

/* ─── 11 ────────────────────────────────────────────────────────────────────
 * The last thing.
 *
 * No recommendations, no data, no action items. Dark, one warm light, and
 * Sunny's sentence. Then every light from the ocean returns, and the reader
 * realises they were never looking at one patient.
 */
function Breath() {
  const light = useRef<THREE.PointLight>(null)
  const many = useRef<THREE.InstancedMesh>(null)
  const COUNT = 700

  const lights = useMemo(() => {
    const random = seeded(211)
    return Array.from({ length: COUNT }, () => {
      const angle = random() * Math.PI * 2
      const distance = 6 + random() * 46
      return {
        p: [
          Math.cos(angle) * distance,
          (random() - 0.5) * 16,
          Math.sin(angle) * distance - random() * 20,
        ] as [number, number, number],
        phase: random() * Math.PI * 2,
        delay: 4 + random() * 7,
      }
    })
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    // Breathing: in a little longer than out, the way it actually goes.
    if (light.current) {
      const breath = 0.5 + 0.5 * Math.sin(t * 0.42 - Math.PI / 2)
      light.current.intensity = 5 + breath * 9
    }
    if (many.current) {
      const matrix = new THREE.Matrix4()
      lights.forEach((l, i) => {
        const arrive = Math.max(0, Math.min(1, (t - l.delay) / 3))
        const pulse = 0.55 + 0.45 * Math.sin(t * 0.4 + l.phase)
        const size = 0.13 * arrive * pulse
        matrix.makeScale(size, size, size)
        matrix.setPosition(l.p[0], l.p[1], l.p[2])
        many.current!.setMatrixAt(i, matrix)
      })
      many.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group>
      <ambientLight intensity={0.03} />
      <pointLight
        ref={light}
        position={[0, 0.4, 2.4]}
        intensity={144}
        color={PALETTE.ember}
        distance={39}
        decay={2}
      />
      <instancedMesh ref={many} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={PALETTE.ember} />
      </instancedMesh>
      <Figure position={[0, -1.7, 0]} scale={1.15} emissive={1.4} />
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
  breath: Breath,
}

/**
 * Only the stations near the camera are mounted.
 *
 * Eleven lit scenes with transmission glass and tens of thousands of instanced
 * points is far more than any phone should hold at once, and the ones far down
 * the corridor are invisible anyway. This is the single biggest thing keeping
 * the sequence affordable on the devices CLAUDE.md is worried about.
 */
export function Station({
  scene,
  index,
  active,
}: {
  scene: SceneId
  index: number
  active: boolean
}) {
  const Shape = SCENES[scene]
  if (!active) return null
  return (
    <group position={[0, 0, stationZ(index)]}>
      <Shape />
    </group>
  )
}
