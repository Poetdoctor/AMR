import { useMemo } from 'react'
import type { ReactElement } from 'react'
import type { SceneId } from '@/lib/beats'

/**
 * The flat rendering of each beat.
 *
 * Drawn from the materials of the subject rather than from generic geometry —
 * a culture plate, a zone of inhibition, a susceptibility report, an isolation
 * room, a schedule of appointments. Still abstract and still procedural, as
 * CLAUDE.md requires: a zone of inhibition is only a circle. It is just a
 * circle that means one particular thing, and someone who has had a resistant
 * infection explained to them will recognise it.
 *
 * Plain SVG, because this is the path served to the devices that could not run
 * WebGL in the first place.
 */

/** Deterministic, so a composition never reshuffles between renders. */
function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const VIEW = 400
const CENTRE = VIEW / 2

/** Colonies scattered on a plate, avoiding a cleared radius at the centre. */
function colonies(seed: number, count: number, plateR: number, clearR: number) {
  const random = seeded(seed)
  const out: { x: number; y: number; r: number }[] = []
  let guard = 0
  while (out.length < count && guard++ < count * 40) {
    const angle = random() * Math.PI * 2
    const distance = Math.sqrt(random()) * plateR
    if (distance < clearR) continue
    out.push({
      x: CENTRE + Math.cos(angle) * distance,
      y: CENTRE + Math.sin(angle) * distance,
      r: 2 + random() * 2.6,
    })
  }
  return out
}

function Plate({ r = 165 }: { r?: number }) {
  return (
    <>
      <circle cx={CENTRE} cy={CENTRE} r={r} className="fill-current" opacity={0.05} />
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={r}
        className="stroke-current"
        fill="none"
        strokeWidth={1.5}
        opacity={0.45}
      />
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={r - 9}
        className="stroke-current"
        fill="none"
        strokeWidth={0.75}
        opacity={0.22}
      />
    </>
  )
}

/**
 * Beat one. The plate was cleared once — the faint inner ring is where the
 * edge of that clearing was — and growth has crossed back over it.
 */
function Recurrence() {
  const old = useMemo(() => colonies(3, 90, 158, 96), [])
  const returning = useMemo(() => colonies(19, 11, 88, 22), [])
  return (
    <>
      <Plate />
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={96}
        className="stroke-current"
        fill="none"
        strokeWidth={1}
        strokeDasharray="4 6"
        opacity={0.3}
      />
      {old.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={c.r} className="fill-current" opacity={0.3} />
      ))}
      {returning.map((c, i) => (
        <circle
          key={`r${i}`}
          cx={c.x}
          cy={c.y}
          r={c.r + 0.6}
          className="fill-current text-rust"
          opacity={0.9}
        />
      ))}
    </>
  )
}

/**
 * Beat two, and the one that carries the most weight: disk diffusion.
 *
 * The disk is the antibiotic. The clear ring around it is the zone of
 * inhibition — everything the drug killed. A single colony has survived inside
 * that zone and is dividing. That is resistance, in the exact form a lab sees
 * it, and the person is nowhere in the picture. Which is the point of the beat.
 */
function Inhibition() {
  const outside = useMemo(() => colonies(7, 150, 160, 104), [])
  const survivors = useMemo(() => {
    const random = seeded(23)
    const seedPoint = { x: CENTRE + 44, y: CENTRE - 30 }
    return [
      { ...seedPoint, r: 4.4 },
      ...Array.from({ length: 5 }, () => {
        const angle = random() * Math.PI * 2
        const distance = 9 + random() * 15
        return {
          x: seedPoint.x + Math.cos(angle) * distance,
          y: seedPoint.y + Math.sin(angle) * distance,
          r: 2.4 + random() * 1.6,
        }
      }),
    ]
  }, [])
  return (
    <>
      <Plate />
      {/* the zone of inhibition */}
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={104}
        className="stroke-current"
        fill="none"
        strokeWidth={1}
        strokeDasharray="3 5"
        opacity={0.4}
      />
      {outside.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={c.r} className="fill-current" opacity={0.32} />
      ))}
      {/* the antibiotic disk */}
      <circle cx={CENTRE} cy={CENTRE} r={26} className="fill-current" opacity={0.12} />
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={26}
        className="stroke-current"
        fill="none"
        strokeWidth={1.5}
        opacity={0.6}
      />
      {survivors.map((c, i) => (
        <circle key={`s${i}`} cx={c.x} cy={c.y} r={c.r} className="fill-current text-rust" />
      ))}
    </>
  )
}

/**
 * Beat three. A susceptibility report: every drug tested, every result
 * recorded, precise and complete. The last column has no marks in it, because
 * nothing in this record asks how the person is.
 */
function Record() {
  const rows = 8
  const cols = 5
  const marks = useMemo(() => {
    const random = seeded(31)
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (random() < 0.34 ? 'R' : random() < 0.5 ? 'I' : 'S')),
    )
  }, [])
  const left = 52
  const top = 66
  const stepX = 46
  const stepY = 32

  return (
    <>
      {marks.map((row, r) => (
        <g key={r}>
          {/* the drug name, as a bar rather than lettering */}
          <rect
            x={left - 38}
            y={top + r * stepY - 3}
            width={26}
            height={5}
            rx={2.5}
            className="fill-current"
            opacity={0.28}
          />
          {row.map((value, c) => {
            const x = left + c * stepX
            const y = top + r * stepY
            if (value === 'R')
              return (
                <rect
                  key={c}
                  x={x}
                  y={y - 8}
                  width={17}
                  height={17}
                  rx={3}
                  className="fill-current text-rust"
                  opacity={0.9}
                />
              )
            if (value === 'I')
              return (
                <rect
                  key={c}
                  x={x}
                  y={y - 8}
                  width={17}
                  height={17}
                  rx={3}
                  className="fill-current"
                  opacity={0.35}
                />
              )
            return (
              <rect
                key={c}
                x={x}
                y={y - 8}
                width={17}
                height={17}
                rx={3}
                className="stroke-current"
                fill="none"
                strokeWidth={1}
                opacity={0.3}
              />
            )
          })}
        </g>
      ))}
      {/* the column nobody fills in */}
      <rect
        x={left + cols * stepX - 4}
        y={top - 22}
        width={40}
        height={rows * stepY + 8}
        rx={8}
        className="stroke-current text-rust"
        fill="none"
        strokeWidth={1.25}
        strokeDasharray="5 5"
        opacity={0.75}
      />
    </>
  )
}

/**
 * Beat four. The room, the threshold, and the people who used to be closer.
 * Distance drawn as distance.
 */
function Room() {
  const visitors = useMemo(() => {
    const random = seeded(53)
    return Array.from({ length: 9 }, (_, i) => {
      const tier = Math.floor(i / 3)
      return {
        x: 250 + tier * 46 + random() * 26,
        y: 110 + (i % 3) * 92 + random() * 24,
        opacity: 0.42 - tier * 0.12,
      }
    })
  }, [])
  return (
    <>
      <rect
        x={54}
        y={92}
        width={168}
        height={216}
        rx={10}
        className="fill-current"
        opacity={0.05}
      />
      <rect
        x={54}
        y={92}
        width={168}
        height={216}
        rx={10}
        className="stroke-current"
        fill="none"
        strokeWidth={1.5}
        opacity={0.5}
      />
      {/* the threshold: the line where the gowns and gloves go on */}
      <line
        x1={222}
        y1={92}
        x2={222}
        y2={308}
        className="stroke-current text-rust"
        strokeWidth={1.5}
        strokeDasharray="6 6"
        opacity={0.8}
      />
      <circle cx={138} cy={200} r={9} className="fill-current text-rust" />
      {visitors.map((v, i) => (
        <circle key={i} cx={v.x} cy={v.y} r={6} className="fill-current" opacity={v.opacity} />
      ))}
    </>
  )
}

/**
 * Beat five. Every appointment as a mark, and the distance travelled to reach
 * it as the height of the arc above it. It stacks up because it stacks up.
 */
function Schedule() {
  const visits = useMemo(() => {
    const random = seeded(67)
    return Array.from({ length: 22 }, (_, i) => ({
      x: 44 + i * 14.6,
      height: 26 + random() * 92,
    }))
  }, [])
  return (
    <>
      <line
        x1={30}
        y1={300}
        x2={370}
        y2={300}
        className="stroke-current"
        strokeWidth={1.25}
        opacity={0.4}
      />
      {visits.map((v, i) => (
        <g key={i}>
          <path
            d={`M ${v.x} 300 Q ${v.x + 7} ${300 - v.height} ${v.x + 14} 300`}
            className="stroke-current"
            fill="none"
            strokeWidth={1}
            opacity={0.3}
          />
          <line
            x1={v.x}
            y1={300}
            x2={v.x}
            y2={310}
            className="stroke-current"
            strokeWidth={1.5}
            opacity={0.5}
          />
        </g>
      ))}
      <circle cx={44} cy={300} r={6} className="fill-current text-rust" />
      <circle cx={44 + 21 * 14.6} cy={300} r={6} className="fill-current text-rust" opacity={0.5} />
    </>
  )
}

/**
 * Beat six. Everything medicine measures, drawn to scale against everything it
 * does not: the plate and the grid are small, precise and complete, and the
 * person extends a long way past the edge of both.
 */
function Person() {
  const field = useMemo(() => {
    const random = seeded(83)
    return Array.from({ length: 90 }, () => {
      const angle = random() * Math.PI * 2
      const distance = 92 + random() * 78
      return { x: CENTRE + Math.cos(angle) * distance, y: CENTRE + Math.sin(angle) * distance }
    })
  }, [])
  return (
    <>
      {field.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.2} className="fill-current" opacity={0.22} />
      ))}
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={176}
        className="stroke-current"
        fill="none"
        strokeWidth={1}
        strokeDasharray="2 7"
        opacity={0.28}
      />
      {/* the measured part */}
      <circle cx={CENTRE} cy={CENTRE} r={54} className="fill-current" opacity={0.07} />
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={54}
        className="stroke-current text-rust"
        fill="none"
        strokeWidth={1.5}
      />
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <rect
            key={`${r}${c}`}
            x={CENTRE - 26 + c * 20}
            y={CENTRE - 26 + r * 20}
            width={13}
            height={13}
            rx={2.5}
            className="fill-current"
            opacity={0.3}
          />
        )),
      )}
    </>
  )
}

/** Beat seven. Different organisms, different plates, the same pattern on each. */
function Across() {
  const plates = [
    { x: 118, y: 132, r: 66, seed: 5 },
    { x: 276, y: 118, r: 50, seed: 9 },
    { x: 200, y: 282, r: 78, seed: 13 },
  ]
  return (
    <>
      {plates.map((plate, i) => {
        const random = seeded(plate.seed)
        const ring = plate.r * 0.62
        const dots = Array.from({ length: 26 }, () => {
          const angle = random() * Math.PI * 2
          const distance = ring + random() * (plate.r - ring - 4)
          return {
            x: plate.x + Math.cos(angle) * distance,
            y: plate.y + Math.sin(angle) * distance,
          }
        })
        return (
          <g key={i}>
            <circle cx={plate.x} cy={plate.y} r={plate.r} className="fill-current" opacity={0.04} />
            <circle
              cx={plate.x}
              cy={plate.y}
              r={plate.r}
              className="stroke-current"
              fill="none"
              strokeWidth={1.25}
              opacity={0.4}
            />
            <circle
              cx={plate.x}
              cy={plate.y}
              r={ring}
              className="stroke-current"
              fill="none"
              strokeWidth={0.75}
              strokeDasharray="3 4"
              opacity={0.32}
            />
            {dots.map((d, j) => (
              <circle key={j} cx={d.x} cy={d.y} r={2.2} className="fill-current" opacity={0.3} />
            ))}
            <circle
              cx={plate.x}
              cy={plate.y}
              r={plate.r * 0.15}
              className="stroke-current"
              fill="none"
              strokeWidth={1}
              opacity={0.5}
            />
            <circle
              cx={plate.x + ring * 0.45}
              cy={plate.y - ring * 0.3}
              r={3.4}
              className="fill-current text-rust"
            />
          </g>
        )
      })}
    </>
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
