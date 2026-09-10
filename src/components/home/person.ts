import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * A person, swept rather than assembled.
 *
 * The previous figure was a bag of capsules butted together, and it read as
 * exactly that: hard seams where a limb met a torso, constant-radius tubes, a
 * sphere for a head. A body is one continuous surface that tapers, so this
 * builds each part by sweeping an elliptical cross-section along a spline with
 * a radius that varies down its length — a real waist, deltoids that widen off
 * the chest, forearms thinner than upper arms, calves that swell and taper to
 * an ankle.
 *
 * Cross-sections are ellipses, not circles. A human torso is roughly half as
 * deep as it is wide, and a circular one is the single thing that makes a
 * procedural figure look like a toy.
 *
 * Everything merges into one geometry, so a crowd is still one draw call each.
 */

export interface Pose {
  /** Forward fold at the waist, radians. */
  stoop?: number
  headDrop?: number
  knees?: number
  /** Arms away from the body. Negative tucks them in. */
  armsOut?: number
  /** Right arm forward, reaching. */
  reach?: number
  /** Weight onto the back foot. */
  step?: number
  shoulders?: number
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

/**
 * Sweeps an ellipse along a curve.
 *
 * `profile` returns the half-width and half-depth at each point, which is where
 * all of the anatomy actually lives: the swell of a calf, the narrowing at a
 * wrist, the flare from waist to ribcage.
 */
function sweep(
  points: THREE.Vector3[],
  profile: (t: number) => [number, number],
  { steps = 22, radial = 14, capStart = true, capEnd = true } = {},
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.4)
  const frames = curve.computeFrenetFrames(steps, false)
  const positions: number[] = []
  const normals: number[] = []
  // UVs are unused by the material, but mergeGeometries returns null when its
  // inputs do not share an identical attribute set — and a null merge here
  // silently fell through to a fallback sphere, which is what a "person" was.
  const uvs: number[] = []
  const indices: number[] = []

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const centre = curve.getPointAt(t)
    const [rx, rz] = profile(t)
    const normal = frames.normals[i]
    const binormal = frames.binormals[i]

    for (let j = 0; j < radial; j++) {
      const angle = (j / radial) * Math.PI * 2
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const offset = normal
        .clone()
        .multiplyScalar(cos * rx)
        .add(binormal.clone().multiplyScalar(sin * rz))
      positions.push(centre.x + offset.x, centre.y + offset.y, centre.z + offset.z)
      const n = offset.clone().normalize()
      normals.push(n.x, n.y, n.z)
      uvs.push(j / radial, t)
    }
  }

  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j
      const b = i * radial + ((j + 1) % radial)
      const c = (i + 1) * radial + ((j + 1) % radial)
      const d = (i + 1) * radial + j
      indices.push(a, b, d, b, c, d)
    }
  }

  // Rounded caps, so nothing is an open pipe.
  const parts: THREE.BufferGeometry[] = []
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  parts.push(geometry)

  const cap = (t: number) => {
    const [rx, rz] = profile(t)
    const centre = curve.getPointAt(t)
    const sphere = new THREE.SphereGeometry(1, radial, 10)
    sphere.scale(rx, (rx + rz) / 2, rz)
    sphere.translate(centre.x, centre.y, centre.z)
    return sphere
  }
  if (capStart) parts.push(cap(0))
  if (capEnd) parts.push(cap(1))

  const merged = mergeGeometries(parts, false)
  parts.forEach((part) => part.dispose())
  return merged ?? geometry
}

/** Blend between two numbers. */
const mix = (a: number, b: number, t: number) => a + (b - a) * t

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

  /* ── Torso ───────────────────────────────────────────────────────────────
   * One sweep from pelvis to the base of the neck, folding forward at the
   * waist. The profile is what gives it a body: hips, a narrowing at the
   * waist, then the ribcage widening again.
   */
  const hipY = 0.9 - knees * 0.16
  const spine: THREE.Vector3[] = []
  const SPINE_STEPS = 8
  for (let i = 0; i <= SPINE_STEPS; i++) {
    const t = i / SPINE_STEPS
    // Fold accumulates up the spine rather than pivoting at one joint.
    const bend = stoop * t * t
    spine.push(V(0, hipY + t * 0.62 * Math.cos(bend), t * 0.62 * Math.sin(bend)))
  }
  parts.push(
    sweep(
      spine,
      (t) => {
        // hips → waist → ribcage → shoulders
        const width = t < 0.3 ? mix(0.17, 0.145, t / 0.3) : mix(0.145, 0.208, (t - 0.3) / 0.7)
        const depth = width * mix(0.72, 0.58, t)
        return [width, depth]
      },
      { steps: 20, radial: 18 },
    ),
  )

  const chest = spine[SPINE_STEPS]
  const shoulderY = chest.y - 0.03 - shoulders * 0.05
  const shoulderZ = chest.z

  /* ── Shoulders ───────────────────────────────────────────────────────────
   * A shallow arc across the top of the chest. Without this the arms hang off
   * a cylinder and the whole figure reads as a doll.
   */
  parts.push(
    sweep(
      [
        V(-0.2, shoulderY - 0.02, shoulderZ),
        V(0, shoulderY + 0.035, shoulderZ),
        V(0.2, shoulderY - 0.02, shoulderZ),
      ],
      (t) => {
        const taper = 0.085 * (1 - Math.abs(t - 0.5) * 0.75)
        return [taper, taper * 0.85]
      },
      { steps: 14, radial: 14 },
    ),
  )

  /* ── Head and neck ───────────────────────────────────────────────────────── */
  const neckAngle = stoop * 0.55 + headDrop
  const neckBase = V(0, shoulderY + 0.02, shoulderZ)
  const headCentre = V(
    0,
    neckBase.y + 0.235 * Math.cos(neckAngle),
    neckBase.z + 0.235 * Math.sin(neckAngle),
  )
  parts.push(
    sweep(
      [
        neckBase,
        V(0, neckBase.y + 0.07 * Math.cos(neckAngle), neckBase.z + 0.07 * Math.sin(neckAngle)),
        V(0, neckBase.y + 0.13 * Math.cos(neckAngle), neckBase.z + 0.13 * Math.sin(neckAngle)),
      ],
      (t) => [mix(0.062, 0.05, t), mix(0.058, 0.048, t)],
      { steps: 8, radial: 12, capEnd: false },
    ),
  )
  // A skull is taller than it is wide and longer than it is broad.
  const head = new THREE.SphereGeometry(1, 22, 18)
  head.scale(0.098, 0.125, 0.112)
  head.rotateX(neckAngle * 0.8)
  head.translate(headCentre.x, headCentre.y, headCentre.z)
  parts.push(head)

  /* ── Arms ────────────────────────────────────────────────────────────────
   * Upper arm and forearm as one continuous sweep through the elbow, so the
   * joint is a bend in a surface rather than two tubes meeting.
   */
  for (const side of [-1, 1] as const) {
    const isReaching = reach > 0 && side === 1
    const out = 0.1 + armsOut
    const sx = side * 0.195

    const shoulderPoint = V(sx, shoulderY - 0.01, shoulderZ)
    const elbow = isReaching
      ? V(sx + side * out * 0.5, shoulderY - 0.24, shoulderZ + 0.2)
      : V(sx + side * (out + 0.03), shoulderY - 0.27 + stoop * 0.04, shoulderZ + stoop * 0.1)
    const wrist = isReaching
      ? V(sx + side * out * 0.4, shoulderY - 0.24 + reach * 0.06, shoulderZ + 0.24 + reach * 0.36)
      : V(sx + side * (out + 0.055), shoulderY - 0.55 + stoop * 0.02, shoulderZ + stoop * 0.24)

    parts.push(
      sweep(
        [shoulderPoint, elbow, wrist],
        (t) => {
          // deltoid → bicep → elbow → forearm → wrist
          const width = t < 0.5 ? mix(0.078, 0.052, t / 0.5) : mix(0.052, 0.032, (t - 0.5) / 0.5)
          return [width, width * 0.92]
        },
        { steps: 20, radial: 13 },
      ),
    )
    // hand
    const hand = new THREE.SphereGeometry(1, 12, 10)
    hand.scale(0.038, 0.065, 0.026)
    hand.translate(wrist.x, wrist.y - 0.06, wrist.z)
    parts.push(hand)
  }

  /* ── Legs ────────────────────────────────────────────────────────────────
   * Thigh through knee to ankle in one sweep, with the calf swelling behind.
   */
  for (const side of [-1, 1] as const) {
    const hx = side * 0.085
    const forward = side === -1 ? step * 0.22 : -step * 0.12
    const hip = V(hx, hipY + 0.02, 0)
    const knee = V(hx, hipY - 0.45, forward + knees * 0.2)
    const ankle = V(hx, 0.075, forward * 0.4 - knees * 0.06)

    parts.push(
      sweep(
        [hip, knee, ankle],
        (t) => {
          // thigh → knee → calf → ankle
          const width =
            t < 0.45
              ? mix(0.105, 0.072, t / 0.45)
              : t < 0.7
                ? mix(0.072, 0.078, (t - 0.45) / 0.25)
                : mix(0.078, 0.042, (t - 0.7) / 0.3)
          return [width, width * 0.94]
        },
        { steps: 22, radial: 14 },
      ),
    )
    // foot
    const foot = new THREE.SphereGeometry(1, 12, 10)
    foot.scale(0.05, 0.038, 0.105)
    foot.translate(hx, 0.038, ankle.z + 0.05)
    parts.push(foot)
  }

  const merged = mergeGeometries(parts, false)
  parts.forEach((part) => part.dispose())
  if (!merged) {
    // Only happens if a part is built with a mismatched attribute set. Say so
    // rather than rendering a sphere and letting somebody wonder why the
    // person looks like a pebble.
    console.error('buildPerson: geometry merge failed — attribute sets differ')
    return new THREE.CapsuleGeometry(0.2, 1.2, 4, 12)
  }
  merged.computeVertexNormals()
  return merged
}

export const PERSON_HEIGHT = 1.78

/** Named for what they mean, not how they look. */
export const POSES: Record<string, Pose> = {
  standing: { armsOut: 0.01 },
  unsteady: { stoop: 0.12, headDrop: 0.14, knees: 0.14, shoulders: 0.22 },
  bearing: { stoop: 0.36, headDrop: 0.32, knees: 0.36, shoulders: 0.6, armsOut: -0.03 },
  collapsing: { stoop: 0.78, headDrop: 0.52, knees: 0.85, shoulders: 0.95, armsOut: -0.05 },
  reaching: { reach: 1.1, stoop: 0.06, headDrop: -0.06, armsOut: 0.02 },
  retreating: { step: 0.5, armsOut: -0.055, shoulders: 0.35, headDrop: 0.18 },
  open: { armsOut: 0.14, headDrop: -0.12, shoulders: -0.18 },
  walking: { knees: 0.2, armsOut: 0.03, stoop: 0.07, step: 0.3 },
}
