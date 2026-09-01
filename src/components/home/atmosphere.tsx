import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { buildPerson, POSES, type Pose } from './person'

/**
 * Shared craft for the narrative: the palette, the light, the figure, and text
 * that exists in the world rather than on top of it.
 *
 * The section runs dark. That is a departure from the cream the rest of the
 * site uses, and a deliberate one — the story opens with someone falling
 * through unlit space and ends with a single warm light, and neither of those
 * works on a pale ground. The reader enters a theatre and comes out again.
 * Light is also the only way this stops looking like a diagram: flat unlit
 * colour has no form, and form is what makes a figure feel like a person.
 */

export const PALETTE = {
  void: new THREE.Color('#0d0b09'),
  deep: new THREE.Color('#161210'),
  ink: new THREE.Color('#6f6255'),
  bone: new THREE.Color('#e8ddcc'),
  rust: new THREE.Color('#c2542a'),
  ember: new THREE.Color('#f0a26a'),
  glass: new THREE.Color('#8fa6a0'),
}

/**
 * The person.
 *
 * Built and posed in person.ts, merged to a single geometry so a crowd costs
 * one draw call each. Posture carries the state: `pose` is the whole point of
 * the component, not a decoration on it.
 */
export function Figure({
  position = [0, 0, 0],
  scale = 1,
  pose = 'standing',
  turn = 0,
  colour = PALETTE.ember,
  emissive = 0.85,
  opacity = 1,
  grounded = true,
}: {
  position?: [number, number, number]
  scale?: number
  pose?: keyof typeof POSES | Pose
  turn?: number
  colour?: THREE.Color
  emissive?: number
  opacity?: number
  /** A soft pool of light under the feet, so nobody is floating. */
  grounded?: boolean
}) {
  const geometry = useMemo(() => buildPerson(typeof pose === 'string' ? POSES[pose] : pose), [pose])

  return (
    <group position={position} rotation={[0, turn, 0]} scale={scale}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color={colour}
          emissive={colour}
          emissiveIntensity={emissive}
          roughness={0.55}
          metalness={0.05}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>
      {grounded ? (
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.7, 28]} />
          <meshBasicMaterial
            color={colour}
            transparent
            opacity={0.09 * opacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
    </group>
  )
}

/** Everyone who is not the patient: the same body, colder and unlit. */
export function OtherFigure({
  position,
  scale = 1,
  opacity = 0.6,
  pose = 'standing',
  turn = 0,
}: {
  position: [number, number, number]
  scale?: number
  opacity?: number
  pose?: keyof typeof POSES | Pose
  turn?: number
}) {
  return (
    <Figure
      position={position}
      scale={scale}
      pose={pose}
      turn={turn}
      colour={PALETTE.ink}
      emissive={0.16}
      opacity={opacity}
      grounded={false}
    />
  )
}

/**
 * A word, as an object in the world.
 *
 * The brief asks for fragments that drift and sink rather than captions that
 * sit on the glass, so these are real geometry in the scene: they catch the
 * light, they are occluded by things in front of them, and they move.
 * `drift` sinks them slowly; `flicker` gives them an uneven, breathing presence.
 */
export function WorldWord({
  children,
  position,
  size = 0.9,
  colour = PALETTE.bone,
  opacity = 1,
  drift = 0,
  flicker = 0,
  anchorX = 'center',
}: {
  children: string
  position: [number, number, number]
  size?: number
  colour?: THREE.Color
  opacity?: number
  drift?: number
  flicker?: number
  anchorX?: 'center' | 'left' | 'right'
}) {
  const group = useRef<THREE.Group>(null)
  const base = useRef(position[1])

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    if (drift) {
      // Sinking, then quietly returning — like something going under water and
      // being remembered again.
      const cycle = ((t * drift * 0.12) % 1) ** 1.4
      group.current.position.y = base.current - cycle * 3.4
      const material = (group.current.children[0] as THREE.Mesh | undefined)?.material as
        THREE.Material | undefined
      if (material) material.opacity = opacity * (1 - cycle)
    }
    if (flicker) {
      const material = (group.current.children[0] as THREE.Mesh | undefined)?.material as
        THREE.Material | undefined
      if (material)
        material.opacity = opacity * (0.55 + 0.45 * Math.sin(t * flicker + base.current))
    }
  })

  return (
    <group ref={group} position={position}>
      <Text
        fontSize={size}
        color={colour}
        anchorX={anchorX}
        anchorY="middle"
        letterSpacing={-0.015}
        /*
         * A dark outline is the difference between a word you can read and a
         * word you can almost read. These float over lights, glass and empty
         * dark within the same scene, so they cannot rely on any one ground.
         */
        outlineWidth={size * 0.045}
        outlineColor="#0d0b09"
        outlineOpacity={0.85}
        material-transparent
        material-opacity={opacity}
        material-depthWrite={false}
      >
        {children}
      </Text>
    </group>
  )
}

/**
 * The light in a scene.
 *
 * One warm key close to the figure so it is modelled rather than silhouetted,
 * one cold rim behind to separate it from the dark, and a very low ambient so
 * the shadows are not pure black. Every scene uses this so the whole sequence
 * feels lit by the same world.
 */
export function SceneLight({
  key: _key,
  intensity = 1,
  colour = PALETTE.ember,
}: {
  key?: string
  intensity?: number
  colour?: THREE.Color
}) {
  return (
    <>
      <ambientLight intensity={0.12} color={PALETTE.bone} />
      <pointLight
        position={[2.5, 3.5, 3]}
        intensity={14 * intensity}
        color={colour}
        distance={26}
        decay={2}
      />
      <pointLight
        position={[-4, 2, -4]}
        intensity={7 * intensity}
        color={PALETTE.glass}
        distance={22}
        decay={2}
      />
    </>
  )
}

/** Slow, uneven motion. Nothing in this story should move mechanically. */
export function useBreath(speed = 0.35, depth = 1) {
  const value = useRef(0)
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed
    value.current = (Math.sin(t) * 0.6 + Math.sin(t * 1.7 + 1.2) * 0.4) * depth
  })
  return value
}
