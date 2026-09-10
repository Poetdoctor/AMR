import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import * as THREE from 'three'
import { useScenePhase } from './phase'

/**
 * The figures.
 *
 * A real rigged human rather than geometry assembled from primitives. The model
 * is CC0 (Quaternius, via Poly Pizza) — which is the licence that matters here,
 * because a mesh served from a public website is downloadable by anyone, and
 * most photoreal human scans forbid exactly that. See public/models/README.md.
 *
 * It arrives with a skeleton and eight animation clips, which does more for the
 * storytelling than any amount of extra polygons would: the collapse in beat
 * three is a real animation, scrubbed by the reader's scroll position rather
 * than played at them.
 */

const MODEL_URL = '/models/person.glb'
const TARGET_HEIGHT = 1.78

/**
 * Which clip each beat's posture maps to.
 *
 * `still` freezes a clip at a given point rather than playing it — a person
 * standing in an isolation room should not be walking on the spot, and a
 * collapse should happen when the reader arrives at it, not on a loop.
 */
export type PersonPose =
  | 'standing'
  | 'unsteady'
  | 'bearing'
  | 'collapsing'
  | 'reaching'
  | 'retreating'
  | 'open'
  | 'walking'

interface ClipPlan {
  clip: string
  /** Loop it (ambient), or hold one frame / scrub it against scroll. */
  mode: 'loop' | 'hold' | 'scrub'
  /** For 'hold', where in the clip to freeze, 0–1. */
  at?: number
  speed?: number
}

const POSE_CLIPS: Record<PersonPose, ClipPlan> = {
  standing: { clip: 'Idle', mode: 'loop', speed: 1 },
  // Barely-there motion reads as someone who is not quite steady.
  unsteady: { clip: 'Idle', mode: 'loop', speed: 0.55 },
  // Part-way into the collapse: bent, not yet down.
  bearing: { clip: 'Death', mode: 'hold', at: 0.22 },
  // The reader's scroll drives this one all the way through.
  collapsing: { clip: 'Death', mode: 'scrub' },
  reaching: { clip: 'Punch', mode: 'hold', at: 0.28 },
  retreating: { clip: 'Idle', mode: 'loop', speed: 0.4 },
  open: { clip: 'Idle', mode: 'loop', speed: 0.7 },
  walking: { clip: 'Walk', mode: 'loop', speed: 1 },
}

useGLTF.preload(MODEL_URL)

export function PersonModel({
  pose = 'standing',
  colour,
  emissive,
  opacity,
  /** Staggers looping clips so a crowd is not in lockstep. */
  offset = 0,
}: {
  pose?: PersonPose
  colour: THREE.Color
  emissive: number
  opacity: number
  offset?: number
}) {
  const { scene, animations } = useGLTF(MODEL_URL)
  const phase = useScenePhase()

  // SkeletonUtils.clone, not scene.clone: a plain clone copies the meshes but
  // leaves them bound to the original skeleton, so every figure on screen
  // inherits one pose and they all move as a single puppet.
  const model = useMemo(() => {
    const copy = cloneSkinned(scene) as THREE.Group

    /*
     * Measure the skeleton, not the mesh.
     *
     * Box3.setFromObject reads a mesh's geometry bounds through its world
     * matrix — but a skinned mesh's vertices are placed by bone matrices, not
     * by that matrix. This model stores an 0.08-unit mesh under an armature
     * that scales bones by 69, so measuring the geometry said "eight
     * centimetres tall", the figure was scaled up twenty-two times, and the
     * camera ended up inside a hundred-metre person. Bone positions are where
     * the body actually is.
     */
    copy.updateMatrixWorld(true)
    const bounds = new THREE.Box3()
    const point = new THREE.Vector3()
    copy.traverse((child) => {
      if ((child as THREE.Bone).isBone) bounds.expandByPoint(child.getWorldPosition(point))
    })
    const span = bounds.max.y - bounds.min.y
    // The topmost bone sits inside the skull, so the skeleton spans a little
    // less than the person does.
    const scale = span > 0.001 ? (TARGET_HEIGHT * 0.92) / span : 1
    copy.scale.setScalar(scale)
    copy.position.y -= bounds.min.y * scale

    copy.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.frustumCulled = false
      // The sequence is lit as one world. The model's own material would bring
      // its own lighting assumptions and read as pasted in.
      mesh.material = new THREE.MeshStandardMaterial({
        color: colour,
        emissive: colour,
        emissiveIntensity: emissive,
        roughness: 0.62,
        metalness: 0.03,
        transparent: opacity < 1,
        opacity,
      })
    })
    return copy
  }, [scene, colour, emissive, opacity])

  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model])
  const action = useRef<THREE.AnimationAction | null>(null)
  const plan = POSE_CLIPS[pose]

  useEffect(() => {
    const clip = animations.find((c) => c.name.split('|').pop() === plan.clip) ?? animations[0]
    if (!clip) return
    const next = mixer.clipAction(clip)
    next.reset()
    next.play()
    if (plan.mode !== 'loop') {
      // Held and scrubbed clips must not advance on their own.
      next.paused = true
      next.clampWhenFinished = true
      next.setLoop(THREE.LoopOnce, 1)
    }
    action.current = next
    return () => {
      next.stop()
      mixer.uncacheAction(clip)
    }
  }, [animations, mixer, plan.clip, plan.mode])

  useFrame((_, delta) => {
    const current = action.current
    if (!current) return
    const duration = current.getClip().duration

    if (plan.mode === 'loop') {
      mixer.update(delta * (plan.speed ?? 1))
    } else if (plan.mode === 'hold') {
      current.time = duration * (plan.at ?? 0)
      mixer.update(0)
    } else {
      // Scrubbed: the reader's position in the story is the playhead.
      const t = Math.min(1, Math.max(0, (phase.current - 0.28) / 0.5))
      current.time = duration * (t * t * (3 - 2 * t))
      mixer.update(0)
    }
  })

  // Stagger looping crowds so they are not marching in step.
  useEffect(() => {
    if (plan.mode === 'loop' && action.current && offset) {
      action.current.time = action.current.getClip().duration * offset
    }
  }, [offset, plan.mode])

  return <primitive object={model} />
}
