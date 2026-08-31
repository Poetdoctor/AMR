import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

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
 * A lathe-turned form rather than a capsule, so the silhouette has shoulders
 * and a taper and reads as somebody rather than a pill. Lit and emissive, so it
 * holds its own against the dark without being a flat sticker.
 */
export function Figure({
  position = [0, 0, 0],
  scale = 1,
  lean = 0,
  colour = PALETTE.ember,
  emissive = 1.1,
  opacity = 1,
}: {
  position?: [number, number, number]
  scale?: number
  lean?: number
  colour?: THREE.Color
  emissive?: number
  opacity?: number
}) {
  const body = useMemo(() => {
    // Half-profile of a standing figure, revolved.
    const points: THREE.Vector2[] = []
    const profile: [number, number][] = [
      [0.0, 0.0],
      [0.19, 0.03],
      [0.22, 0.35],
      [0.26, 0.72],
      [0.24, 1.02],
      [0.16, 1.16],
      [0.1, 1.22],
      [0.13, 1.3],
      [0.17, 1.4],
      [0.15, 1.5],
      [0.0, 1.55],
    ]
    for (const [x, y] of profile) points.push(new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(points, 28)
  }, [])

  return (
    <group position={position} rotation={[0, 0, lean]} scale={scale}>
      <mesh geometry={body} castShadow>
        <meshStandardMaterial
          color={colour}
          emissive={colour}
          emissiveIntensity={emissive}
          roughness={0.45}
          metalness={0.05}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>
    </group>
  )
}

/** Everyone who is not the patient: the same form, unlit and colder. */
export function OtherFigure({
  position,
  scale = 1,
  opacity = 0.5,
}: {
  position: [number, number, number]
  scale?: number
  opacity?: number
}) {
  return (
    <Figure
      position={position}
      scale={scale}
      colour={PALETTE.ink}
      emissive={0.12}
      opacity={opacity}
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
  opacity = 0.85,
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
        letterSpacing={-0.02}
        outlineWidth={0}
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
