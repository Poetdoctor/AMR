import { useMemo } from 'react'
import type { ReactElement } from 'react'
import type { SceneId } from '@/lib/beats'

/**
 * The flat rendering of each beat's scene.
 *
 * Plain SVG on purpose: it draws on anything, costs nothing, and needs no
 * WebGL context — which matters because this is the path served to exactly the
 * devices that could not run the 3D one. The shapes are the same abstractions
 * the camera moves through in the rich version, so switching between the two
 * feels like the same story rather than two different sites.
 *
 * Geometry, never illustration. The isolation beat is a dot inside a shell, not
 * a drawing of a hospital room.
 */

/** Deterministic, so the composition never reshuffles between renders. */
function pseudoRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const VIEW = 400

function Descent() {
  const rings = [0, 1, 2, 3, 4, 5]
  return (
    <>
      {rings.map((i) => (
        <ellipse
          key={i}
          cx={VIEW / 2}
          cy={70 + i * 54}
          rx={130 - i * 8}
          ry={22 - i * 1.5}
          className="stroke-current"
          fill="none"
          strokeWidth={1.25}
          opacity={0.5 - i * 0.06}
        />
      ))}
      <circle cx={VIEW / 2} cy={332} r={7} className="fill-current text-rust" />
      <line
        x1={VIEW / 2}
        y1={70}
        x2={VIEW / 2}
        y2={318}
        className="stroke-current text-rust"
        strokeWidth={1}
        strokeDasharray="3 7"
        opacity={0.6}
      />
    </>
  )
}

function Selection() {
  const dots = useMemo(() => {
    const random = pseudoRandom(11)
    return Array.from({ length: 120 }, () => {
      const x = 40 + random() * (VIEW - 80)
      const y = 40 + random() * (VIEW - 80)
      return { x, y, survives: random() > 0.9 }
    })
  }, [])
  return (
    <>
      {dots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={dot.survives ? 5 : 2.5}
          className={dot.survives ? 'fill-current text-rust' : 'fill-current'}
          opacity={dot.survives ? 1 : 0.16}
        />
      ))}
    </>
  )
}

function Gap() {
  return (
    <>
      <path
        d={`M 150 60 A 150 150 0 0 0 150 340`}
        className="stroke-current"
        fill="none"
        strokeWidth={1.5}
        opacity={0.45}
      />
      <path
        d={`M 250 60 A 150 150 0 0 1 250 340`}
        className="stroke-current"
        fill="none"
        strokeWidth={1.5}
        opacity={0.45}
      />
      <circle cx={126} cy={200} r={6} className="fill-current" opacity={0.5} />
      <circle cx={274} cy={200} r={6} className="fill-current text-rust" />
      <line
        x1={140}
        y1={200}
        x2={260}
        y2={200}
        className="stroke-current text-rust"
        strokeWidth={1}
        strokeDasharray="2 8"
        opacity={0.7}
      />
    </>
  )
}

function Enclosure() {
  const outside = useMemo(() => {
    const random = pseudoRandom(29)
    return Array.from({ length: 14 }, () => {
      const angle = random() * Math.PI * 2
      const distance = 150 + random() * 45
      return { x: 200 + Math.cos(angle) * distance, y: 200 + Math.sin(angle) * distance }
    })
  }, [])
  return (
    <>
      {outside.map((dot, i) => (
        <circle key={i} cx={dot.x} cy={dot.y} r={4} className="fill-current" opacity={0.3} />
      ))}
      <circle
        cx={200}
        cy={200}
        r={112}
        className="stroke-current"
        fill="none"
        strokeWidth={1.25}
        opacity={0.35}
      />
      <circle
        cx={200}
        cy={200}
        r={92}
        className="stroke-current"
        fill="none"
        strokeWidth={1}
        opacity={0.2}
      />
      <circle cx={200} cy={200} r={8} className="fill-current text-rust" />
    </>
  )
}

function Corridor() {
  const steps = [0, 1, 2, 3, 4, 5, 6, 7]
  return (
    <>
      {steps.map((i) => {
        const scale = 1 - i * 0.11
        const size = 150 * scale
        return (
          <rect
            key={i}
            x={200 - size}
            y={200 - size * 0.62}
            width={size * 2}
            height={size * 1.24}
            rx={10}
            className="stroke-current"
            fill="none"
            strokeWidth={1.25}
            opacity={0.42 - i * 0.04}
          />
        )
      })}
      <circle cx={200} cy={200} r={5} className="fill-current text-rust" />
    </>
  )
}

function Convergence() {
  const dots = useMemo(() => {
    const random = pseudoRandom(47)
    return Array.from({ length: 46 }, (_, i) => {
      const angle = (i / 46) * Math.PI * 2
      const distance = 60 + random() * 120
      return {
        x: 200 + Math.cos(angle) * distance,
        y: 200 + Math.sin(angle) * distance,
      }
    })
  }, [])
  return (
    <>
      {dots.map((dot, i) => (
        <line
          key={i}
          x1={dot.x}
          y1={dot.y}
          x2={200 + (dot.x - 200) * 0.32}
          y2={200 + (dot.y - 200) * 0.32}
          className="stroke-current"
          strokeWidth={1}
          opacity={0.28}
        />
      ))}
      <circle
        cx={200}
        cy={200}
        r={54}
        className="stroke-current text-rust"
        fill="none"
        strokeWidth={1.5}
      />
      <circle cx={200} cy={200} r={9} className="fill-current text-rust" />
    </>
  )
}

function Wider() {
  const clusters = [
    { x: 120, y: 140, r: 46 },
    { x: 268, y: 128, r: 34 },
    { x: 200, y: 268, r: 58 },
    { x: 308, y: 250, r: 26 },
  ]
  return (
    <>
      {clusters.map((c, i) => (
        <g key={i}>
          <circle
            cx={c.x}
            cy={c.y}
            r={c.r}
            className="stroke-current"
            fill="none"
            strokeWidth={1.25}
            opacity={0.32}
          />
          <circle cx={c.x} cy={c.y} r={4} className="fill-current" opacity={0.55} />
        </g>
      ))}
      <circle cx={200} cy={268} r={7} className="fill-current text-rust" />
    </>
  )
}

const SCENES: Record<SceneId, () => ReactElement> = {
  descent: Descent,
  selection: Selection,
  gap: Gap,
  enclosure: Enclosure,
  corridor: Corridor,
  convergence: Convergence,
  wider: Wider,
}

export function SceneStill({ scene, active }: { scene: SceneId; active: boolean }) {
  const Shape = SCENES[scene]
  return (
    <div
      className={`relative aspect-square w-full max-w-md justify-self-center rounded-[var(--radius-card)] border border-sand-line bg-cream-deep transition-opacity duration-700 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="h-full w-full text-ink-faint"
        role="img"
        aria-hidden="true"
        focusable="false"
      >
        <Shape />
      </svg>
    </div>
  )
}
