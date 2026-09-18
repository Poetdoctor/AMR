import { Suspense, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { PersonModel, type PersonPose } from './PersonModel'
import { presence, useScenePhase } from './phase'
import { useI18n } from '@/lib/i18n'

/**
 * The font this language's 3D words are drawn with.
 *
 * `undefined` means troika's built-in face, which covers Latin and nothing
 * else — it draws no glyph at all for a character it lacks, silently. Every
 * non-Latin language carries its own subset; see scripts/build-narrative-fonts.mjs.
 */
export const useNarrativeFont = () => useI18n().locale.narrativeFont ?? undefined

/**
 * -1 in a right-to-left language, 1 otherwise.
 *
 * Multiply an x position by it to put a word on the other side of the frame.
 *
 * Only the text moves. The scene itself is a picture, and pictures are not
 * mirrored for right-to-left any more than photographs are — and flipping a lit
 * 3D scene with a negative scale reverses every face's winding order, which
 * breaks backface culling and shadows for a gain nobody asked for.
 *
 * What does have to move is the words, because the reading card moves: it sits
 * at the inline start of its container, so it crosses to the right on its own,
 * and words left where they were would end up underneath it.
 */
export const useMirror = () => (useI18n().locale.dir === 'rtl' ? -1 : 1)

/** drei forwards the troika instance; these two uniforms are driven per frame. */
type TroikaText = THREE.Object3D & { fillOpacity: number; outlineOpacity: number }

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
  emissive = 0.3,
  opacity = 1,
  grounded = true,
  offset = 0,
}: {
  position?: [number, number, number]
  scale?: number
  pose?: PersonPose
  turn?: number
  colour?: THREE.Color
  emissive?: number
  opacity?: number
  /** A soft pool under the feet, so nobody is floating. */
  grounded?: boolean
  /** Staggers looping animations so a crowd is not in lockstep. */
  offset?: number
}) {
  return (
    <group position={position} rotation={[0, turn, 0]} scale={scale}>
      <Suspense fallback={null}>
        <PersonModel
          pose={pose}
          colour={colour}
          emissive={emissive}
          opacity={opacity}
          offset={offset}
        />
      </Suspense>
      {grounded ? (
        <>
          {/* contact: dark right under the feet, warm just beyond it */}
          <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.34, 24]} />
            <meshBasicMaterial
              color="#000000"
              transparent
              opacity={0.5 * opacity}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.85, 28]} />
            <meshBasicMaterial
              color={colour}
              transparent
              opacity={0.07 * opacity}
              depthWrite={false}
            />
          </mesh>
        </>
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
  offset = 0,
}: {
  position: [number, number, number]
  scale?: number
  opacity?: number
  pose?: PersonPose
  turn?: number
  offset?: number
}) {
  return (
    <Figure
      position={position}
      scale={scale}
      pose={pose}
      turn={turn}
      offset={offset}
      colour={PALETTE.ink}
      emissive={0.05}
      opacity={opacity}
      grounded={false}
    />
  )
}

/**
 * The floor.
 *
 * A large plane that fades to nothing at its edges rather than ending on a
 * visible line, so the space reads as continuing past the frame instead of
 * being a stage set. Receives shadow.
 */
export function Ground({
  y = 0,
  size = 90,
  colour = PALETTE.deep,
  opacity = 1,
}: {
  y?: number
  size?: number
  colour?: THREE.Color
  opacity?: number
}) {
  // A radial alpha ramp, generated once — cheaper and softer than fogging the
  // plane's own edges, and it works at any camera height.
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 256
    const context = canvas.getContext('2d')
    if (!context) return null
    const gradient = context.createRadialGradient(128, 128, 10, 128, 128, 128)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.55, 'rgba(255,255,255,0.55)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 256, 256)
    const map = new THREE.CanvasTexture(canvas)
    map.colorSpace = THREE.SRGBColorSpace
    return map
  }, [])

  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial
        color={colour}
        roughness={0.92}
        metalness={0.04}
        transparent
        opacity={opacity}
        alphaMap={texture ?? undefined}
      />
    </mesh>
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
  const text = useRef<TroikaText | null>(null)
  const seed = useRef(position[0] * 1.7 + position[1] * 0.9)
  const phase = useScenePhase()
  const font = useNarrativeFont()
  const mirror = useMirror()

  /*
   * Deliberately only a small float now.
   *
   * These used to sink 3.4 units and fade out, which looked good in isolation
   * and was wrong in practice: a word left its slot, slid across the frame and
   * collided with the subject, the reading card and the other fragments. Worse,
   * the fade only ever reached the fill material — troika renders the outline
   * with a second material — so a word half-way through the cycle was an empty
   * outline with no letters inside it, which is what "not rendering right"
   * looked like.
   *
   * Legibility is the whole job here. A gentle drift keeps the frame alive
   * without any of that.
   */
  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    const amount = drift || flicker ? 0.075 : 0
    if (amount) group.current.position.y = position[1] + Math.sin(t * 0.5 + seed.current) * amount

    // A word belongs to its own beat, and only its own beat.
    const shown =
      opacity *
      presence(phase.current) *
      (flicker ? 0.62 + 0.38 * Math.sin(t * flicker + seed.current) : 1)
    if (text.current) {
      text.current.fillOpacity = shown
      text.current.outlineOpacity = shown * 0.85
    }
  })

  return (
    <group ref={group} position={[position[0] * mirror, position[1], position[2]]}>
      <Text
        ref={(node: TroikaText | null) => {
          text.current = node
        }}
        /*
         * These are thoughts, not objects in the room, so they are not subject
         * to the room. Without this a piston, a strut or a passing shoulder
         * lands across a word and it stops being readable — and the reader has
         * no way to know a word was ever there.
         */
        renderOrder={20}
        material-depthTest={false}
        font={font}
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
        outlineOpacity={0}
        fillOpacity={0}
        material-transparent
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
