import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * A person, built from primitives and posed.
 *
 * The earlier figure was a revolved profile — a bowling pin. It read as an
 * object because it had no shoulders, no limbs and no posture, and posture is
 * most of what tells you how somebody is doing. This assembles a body from
 * about fourteen primitives with real proportions (head is a seventh of the
 * height, shoulders wider than hips, arms reaching mid-thigh) and merges the
 * whole thing into one geometry, so a crowd is still one draw call each.
 *
 * Pose is the point. The brief asks for a person who bends under accumulating
 * treatment, reaches toward staff who do not stop, and steps backward from
 * their own family — and none of that is sayable with a capsule.
 */

export interface Pose {
  /** Forward fold at the waist, radians. */
  stoop?: number
  /** Head down. */
  headDrop?: number
  /** Both knees, radians. */
  knees?: number
  /** Arms out from the body. Negative tucks them in. */
  armsOut?: number
  /** One arm forward, reaching. */
  reach?: number
  /** Weight onto the back foot — retreating. */
  step?: number
  /** Overall droop of the shoulders. */
  shoulders?: number
}

const HEIGHT = 1.78

function capsule(radius: number, length: number, segments = 8): THREE.BufferGeometry {
  return new THREE.CapsuleGeometry(radius, length, 4, segments)
}

/** Places a piece: rotate about its own end, then translate into position. */
function place(
  geometry: THREE.BufferGeometry,
  position: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0],
  scale?: [number, number, number],
): THREE.BufferGeometry {
  const cloned = geometry.clone()
  if (scale) cloned.scale(scale[0], scale[1], scale[2])
  const matrix = new THREE.Matrix4()
  matrix.makeRotationFromEuler(new THREE.Euler(rotation[0], rotation[1], rotation[2]))
  matrix.setPosition(position[0], position[1], position[2])
  cloned.applyMatrix4(matrix)
  return cloned
}

/**
 * Builds one figure in one pose. Cache the result — it is not cheap, and the
 * poses in this sequence are fixed per scene rather than animated per frame.
 */
export function buildPerson(pose: Pose = {}): THREE.BufferGeometry {
  const {
    stoop = 0,
    headDrop = 0,
    knees = 0,
    armsOut = 0,
    reach = 0,
    step = 0,
    shoulders = 0,
  } = pose

  const parts: THREE.BufferGeometry[] = []

  // Legs. Knees bend forward, and `step` puts the weight back.
  const hipY = 0.92 - knees * 0.18
  for (const side of [-1, 1] as const) {
    const hipX = side * 0.085
    const thighAngle = knees * 0.5 + (side === -1 ? step * 0.35 : -step * 0.2)
    const shinAngle = -knees * 0.9
    const kneeY = hipY - 0.44 * Math.cos(thighAngle)
    const kneeZ = 0.44 * Math.sin(thighAngle)

    parts.push(place(capsule(0.072, 0.36), [hipX, hipY - 0.22, kneeZ * 0.5], [thighAngle, 0, 0]))
    parts.push(
      place(
        capsule(0.058, 0.36),
        [hipX, kneeY - 0.22, kneeZ + 0.42 * Math.sin(thighAngle + shinAngle) * 0.5],
        [thighAngle + shinAngle, 0, 0],
      ),
    )
    // foot
    parts.push(
      place(
        new THREE.SphereGeometry(0.06, 8, 6),
        [hipX, 0.045, kneeZ + 0.06],
        [0, 0, 0],
        [1, 0.5, 1.9],
      ),
    )
  }

  // Pelvis and torso. The torso is an ellipse in section — wider than deep —
  // which is most of what makes a silhouette read as a body.
  const chestY = hipY + 0.52 * Math.cos(stoop)
  const chestZ = 0.52 * Math.sin(stoop)

  parts.push(place(capsule(0.115, 0.1), [0, hipY, 0], [0, 0, 0], [1.5, 1, 0.85]))
  parts.push(
    place(
      capsule(0.135, 0.34),
      [0, hipY + 0.26 * Math.cos(stoop), 0.26 * Math.sin(stoop)],
      [stoop, 0, 0],
      [1.42, 1, 0.78],
    ),
  )

  // Shoulders: a bar across, so the top of the body has width.
  const shoulderY = chestY + 0.06 - shoulders * 0.05
  const shoulderZ = chestZ
  parts.push(
    place(capsule(0.075, 0.24), [0, shoulderY, shoulderZ], [0, 0, Math.PI / 2], [1, 1, 0.8]),
  )

  // Neck and head. Head drop is the single most legible signal of state.
  const neckAngle = stoop * 0.6 + headDrop
  parts.push(
    place(
      capsule(0.045, 0.07),
      [0, shoulderY + 0.09 * Math.cos(neckAngle), shoulderZ + 0.09 * Math.sin(neckAngle)],
      [neckAngle, 0, 0],
    ),
  )
  parts.push(
    place(
      new THREE.SphereGeometry(0.115, 16, 14),
      [0, shoulderY + 0.24 * Math.cos(neckAngle), shoulderZ + 0.24 * Math.sin(neckAngle)],
      [0, 0, 0],
      [0.92, 1.08, 1],
    ),
  )

  // Arms. One may reach forward independently of the other.
  for (const side of [-1, 1] as const) {
    const shoulderX = side * 0.185
    const isReaching = reach > 0 && side === 1
    const upperAngle = isReaching ? -reach : stoop * 0.5 + 0.05
    const outward = side * (0.12 + armsOut)
    const elbowY = shoulderY - 0.3 * Math.cos(upperAngle)
    const elbowZ = shoulderZ + 0.3 * Math.sin(upperAngle)
    const lowerAngle = isReaching ? -reach * 1.25 : upperAngle + 0.08

    parts.push(
      place(
        capsule(0.05, 0.24),
        [
          shoulderX + outward * 0.35,
          shoulderY - 0.15 * Math.cos(upperAngle),
          shoulderZ + 0.15 * Math.sin(upperAngle),
        ],
        [upperAngle, 0, -side * (0.1 + armsOut)],
      ),
    )
    parts.push(
      place(
        capsule(0.042, 0.24),
        [
          shoulderX + outward * 0.6,
          elbowY - 0.15 * Math.cos(lowerAngle),
          elbowZ + 0.15 * Math.sin(lowerAngle),
        ],
        [lowerAngle, 0, -side * (0.14 + armsOut)],
      ),
    )
  }

  const merged = mergeGeometries(parts, false)
  parts.forEach((part) => part.dispose())
  if (!merged) return new THREE.SphereGeometry(0.2, 8, 8)
  merged.computeVertexNormals()
  return merged
}

export const PERSON_HEIGHT = HEIGHT

/** The poses this story needs, named for what they mean rather than how they look. */
export const POSES: Record<string, Pose> = {
  standing: {},
  unsteady: { stoop: 0.1, headDrop: 0.12, knees: 0.12, shoulders: 0.2 },
  bearing: { stoop: 0.34, headDrop: 0.3, knees: 0.34, shoulders: 0.6, armsOut: -0.04 },
  collapsing: { stoop: 0.72, headDrop: 0.5, knees: 0.78, shoulders: 0.9, armsOut: -0.06 },
  reaching: { reach: 1.15, stoop: 0.08, headDrop: -0.05 },
  retreating: { step: 0.5, armsOut: -0.07, shoulders: 0.35, headDrop: 0.16 },
  open: { armsOut: 0.16, headDrop: -0.1, shoulders: -0.15 },
  walking: { knees: 0.16, armsOut: 0.02, stoop: 0.06 },
}
