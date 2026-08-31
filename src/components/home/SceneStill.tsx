import { useMemo } from 'react'
import type { ReactElement } from 'react'
import type { SceneId } from '@/lib/beats'

/**
 * The flat rendering of each beat.
 *
 * Same ten scenes as the 3D path and the same person at the centre of them —
 * a standing form that leans, sinks, is walled in, and is finally surrounded
 * rather than isolated. Plain SVG, because this is the path served to the
 * devices that could not run WebGL, and because none of this needs a GPU.
 *
 * The proportions are the brief's: mostly human experience, some system, very
 * little biology. Beat eight is the only one with an organism in it, and it is
 * the smallest thing on the canvas.
 */

function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const VIEW = 400
const CENTRE = VIEW / 2

/** The person. Featureless on purpose: it should be anybody. */
function Figure({
  x,
  y,
  scale = 1,
  lean = 0,
  rust = true,
  opacity = 1,
}: {
  x: number
  y: number
  scale?: number
  lean?: number
  rust?: boolean
  opacity?: number
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${lean}) scale(${scale})`} opacity={opacity}>
      <circle
        cx={0}
        cy={-30}
        r={7.5}
        className={rust ? 'fill-current text-rust' : 'fill-current'}
      />
      <rect
        x={-6}
        y={-21}
        width={12}
        height={30}
        rx={6}
        className={rust ? 'fill-current text-rust' : 'fill-current'}
      />
    </g>
  )
}

/** Beat 1 — a narrow path, and the floor not quite level any more. */
function Fall() {
  return (
    <g transform={`rotate(3 ${CENTRE} ${CENTRE})`}>
      <path d="M 158 344 L 186 128 L 214 128 L 242 344 Z" className="fill-current" opacity={0.09} />
      {Array.from({ length: 12 }, (_, i) => {
        const t = i / 12
        const halfWidth = 42 - t * 28
        const y = 344 - t * 216
        return (
          <line
            key={i}
            x1={CENTRE - halfWidth}
            y1={y}
            x2={CENTRE + halfWidth}
            y2={y}
            className="stroke-current"
            strokeWidth={1}
            opacity={0.26 - t * 0.16}
          />
        )
      })}
      <Figure x={CENTRE} y={300} lean={5} />
    </g>
  )
}

/** Beat 2 — the ground moves; the person does not. */
function Rollercoaster() {
  const path = useMemo(() => {
    const points: string[] = []
    for (let x = 0; x <= VIEW; x += 8) {
      const y = 250 + Math.sin(x * 0.022) * 46 + Math.sin(x * 0.055) * 18
      points.push(`${x === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`)
    }
    return points.join(' ')
  }, [])
  const lower = useMemo(() => {
    const points: string[] = []
    for (let x = 0; x <= VIEW; x += 8) {
      const y = 292 + Math.sin(x * 0.019 + 1.4) * 34
      points.push(`${x === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`)
    }
    return points.join(' ')
  }, [])
  return (
    <>
      <path d={`${path} L ${VIEW} 400 L 0 400 Z`} className="fill-current" opacity={0.07} />
      <path d={path} className="stroke-current" fill="none" strokeWidth={1.5} opacity={0.45} />
      <path d={lower} className="stroke-current" fill="none" strokeWidth={1} opacity={0.24} />
      <Figure x={CENTRE} y={248} />
    </>
  )
}

/** Beat 3 — it accumulates, and then it bends someone. */
function Weight() {
  const cloud = useMemo(() => {
    const random = seeded(17)
    return Array.from({ length: 130 }, () => {
      const angle = random() * Math.PI * 2
      const distance = random() * 120
      return {
        x: CENTRE + Math.cos(angle) * distance,
        y: 132 + Math.sin(angle) * distance * 0.42,
        r: 1.6 + random() * 3,
      }
    })
  }, [])
  return (
    <>
      {cloud.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={c.r} className="fill-current" opacity={0.28} />
      ))}
      <line
        x1={70}
        y1={318}
        x2={330}
        y2={318}
        className="stroke-current"
        strokeWidth={1}
        opacity={0.3}
      />
      <Figure x={CENTRE} y={316} lean={26} />
    </>
  )
}

/** Beat 4 — everyone moving, nobody stopping. */
function Corridor() {
  const staff = useMemo(() => {
    const random = seeded(37)
    return Array.from({ length: 7 }, (_, i) => ({
      x: 70 + random() * 260,
      y: 150 + i * 26 + random() * 12,
      scale: 0.5 + (i / 7) * 0.55,
      opacity: 0.14 + (i / 7) * 0.22,
    }))
  }, [])
  return (
    <>
      <path
        d="M 118 340 L 176 118 L 224 118 L 282 340"
        className="stroke-current"
        fill="none"
        strokeWidth={1}
        opacity={0.28}
      />
      {Array.from({ length: 8 }, (_, i) => {
        const t = i / 8
        const y = 340 - t * 222
        const half = 82 - t * 58
        return (
          <line
            key={i}
            x1={CENTRE - half}
            y1={y}
            x2={CENTRE + half}
            y2={y}
            className="stroke-current"
            strokeWidth={1}
            opacity={0.2 - t * 0.1}
          />
        )
      })}
      {staff.map((s, i) => (
        <g key={i}>
          {/* trailing marks: they are always already leaving */}
          <line
            x1={s.x - 26}
            y1={s.y}
            x2={s.x}
            y2={s.y}
            className="stroke-current"
            strokeWidth={1}
            opacity={s.opacity * 0.7}
          />
          <Figure x={s.x} y={s.y} scale={s.scale} rust={false} opacity={s.opacity + 0.16} />
        </g>
      ))}
      <Figure x={CENTRE} y={330} />
    </>
  )
}

/** Beat 5 — it arrives, and it does not explain itself. */
function Machine() {
  const objects = useMemo(() => {
    const random = seeded(59)
    return Array.from({ length: 22 }, (_, i) => {
      const angle = (i / 22) * Math.PI * 2
      const distance = 76 + random() * 62
      return {
        x: CENTRE + Math.cos(angle) * distance,
        y: 208 + Math.sin(angle) * distance * 0.5,
        long: random() > 0.55,
        rotate: random() * 180,
      }
    })
  }, [])
  return (
    <>
      <rect x={44} y={26} width={312} height={86} rx={6} className="fill-current" opacity={0.06} />
      <rect
        x={44}
        y={26}
        width={312}
        height={86}
        rx={6}
        className="stroke-current"
        fill="none"
        strokeWidth={1}
        opacity={0.28}
      />
      {Array.from({ length: 9 }, (_, i) => (
        <line
          key={i}
          x1={64 + i * 34}
          y1={112}
          x2={64 + i * 34}
          y2={140 + (i % 3) * 16}
          className="stroke-current"
          strokeWidth={1}
          opacity={0.22}
        />
      ))}
      {objects.map((o, i) => (
        <g key={i} transform={`rotate(${o.rotate} ${o.x} ${o.y})`}>
          {o.long ? (
            <rect
              x={o.x - 11}
              y={o.y - 1.5}
              width={22}
              height={3}
              rx={1.5}
              className="fill-current"
              opacity={0.45}
            />
          ) : (
            <rect
              x={o.x - 4}
              y={o.y - 4}
              width={8}
              height={8}
              rx={1.5}
              className="fill-current"
              opacity={0.45}
            />
          )}
        </g>
      ))}
      <Figure x={CENTRE} y={300} scale={0.85} />
    </>
  )
}

/** Beat 6 — the room does not change. Everything between it and the world does. */
function Glass() {
  return (
    <>
      <rect x={40} y={96} width={168} height={208} rx={8} className="fill-current" opacity={0.05} />
      <rect
        x={40}
        y={96}
        width={168}
        height={208}
        rx={8}
        className="stroke-current"
        fill="none"
        strokeWidth={1.5}
        opacity={0.45}
      />
      {[214, 232, 250].map((x, i) => (
        <rect
          key={x}
          x={x}
          y={96}
          width={5}
          height={208}
          className="fill-current text-rust"
          opacity={0.22 - i * 0.05}
        />
      ))}
      <Figure x={124} y={230} />
      {[
        { x: 296, y: 150, o: 0.4 },
        { x: 344, y: 208, o: 0.3 },
        { x: 300, y: 268, o: 0.24 },
        { x: 352, y: 118, o: 0.18 },
      ].map((v, i) => (
        <Figure key={i} x={v.x} y={v.y} scale={0.9} rust={false} opacity={v.o} />
      ))}
    </>
  )
}

/** Beat 7 — alone, and then all the others who are also alone. */
function Ocean() {
  const lights = useMemo(() => {
    const random = seeded(71)
    return Array.from({ length: 34 }, () => {
      const angle = random() * Math.PI * 2
      const distance = 86 + random() * 108
      return {
        x: CENTRE + Math.cos(angle) * distance,
        y: 236 + Math.sin(angle) * distance * 0.45,
        r: 2 + random() * 2.6,
      }
    })
  }, [])
  return (
    <>
      <line
        x1={0}
        y1={236}
        x2={VIEW}
        y2={236}
        className="stroke-current"
        strokeWidth={1}
        opacity={0.16}
      />
      {lights.map((l, i) => (
        <g key={i}>
          {i % 4 === 0 ? (
            <line
              x1={CENTRE}
              y1={236}
              x2={l.x}
              y2={l.y}
              className="stroke-current text-rust"
              strokeWidth={0.75}
              strokeDasharray="2 6"
              opacity={0.25}
            />
          ) : null}
          <circle cx={l.x} cy={l.y} r={l.r} className="fill-current text-rust" opacity={0.55} />
        </g>
      ))}
      <ellipse cx={CENTRE} cy={264} rx={34} ry={9} className="fill-current" opacity={0.14} />
      <Figure x={CENTRE} y={262} />
    </>
  )
}

/** Beat 8 — the only organism in the whole story, and the smallest thing here. */
function Monster() {
  const fragments = useMemo(() => {
    const random = seeded(89)
    return Array.from({ length: 220 }, () => {
      const angle = random() * Math.PI * 2
      const distance = 58 + random() * 96
      return {
        x: CENTRE + Math.cos(angle) * distance,
        y: CENTRE + Math.sin(angle) * distance,
        s: 2 + random() * 7,
        rotate: random() * 90,
      }
    })
  }, [])
  return (
    <>
      {fragments.map((f, i) => (
        <rect
          key={i}
          x={f.x}
          y={f.y}
          width={f.s}
          height={f.s * 0.5}
          rx={1}
          transform={`rotate(${f.rotate} ${f.x} ${f.y})`}
          className="fill-current"
          opacity={0.34}
        />
      ))}
      {/* what all of that is actually about */}
      <rect
        x={CENTRE - 4}
        y={CENTRE - 2}
        width={8}
        height={4}
        rx={2}
        className="fill-current text-rust"
      />
    </>
  )
}

/** Beat 9 — a life, with appointments pinned all through it. */
function World() {
  const places = [
    { x: 74, y: 108, s: 46 },
    { x: 250, y: 78, s: 36 },
    { x: 92, y: 244, s: 40 },
    { x: 276, y: 210, s: 52 },
    { x: 186, y: 156, s: 32 },
  ]
  const pins = useMemo(() => {
    const random = seeded(97)
    return Array.from({ length: 22 }, () => {
      const place = places[Math.floor(random() * places.length)]
      return {
        x: place.x + random() * place.s,
        y: place.y + random() * place.s,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <>
      {places.map((p, i) => (
        <rect
          key={i}
          x={p.x}
          y={p.y}
          width={p.s}
          height={p.s}
          rx={4}
          className="stroke-current"
          fill="none"
          strokeWidth={1.25}
          opacity={0.3}
        />
      ))}
      {pins.map((pin, i) => (
        <circle
          key={i}
          cx={pin.x}
          cy={pin.y}
          r={3.4}
          className="fill-current text-rust"
          opacity={0.75}
        />
      ))}
      <Figure x={196} y={336} scale={0.95} />
    </>
  )
}

/** Beat 10 — everything that happened, turned towards one person. */
function Whole() {
  const orbit = useMemo(() => {
    const random = seeded(103)
    return Array.from({ length: 150 }, (_, i) => {
      const angle = (i / 150) * Math.PI * 6
      const radius = 62 + (i / 150) * 108
      return {
        x: CENTRE + Math.cos(angle) * radius,
        y: CENTRE + Math.sin(angle) * radius * 0.72,
        r: 1.4 + random() * 2.6,
        warm: random() > 0.72,
      }
    })
  }, [])
  return (
    <>
      {orbit.map((o, i) => (
        <circle
          key={i}
          cx={o.x}
          cy={o.y}
          r={o.r}
          className={o.warm ? 'fill-current text-rust' : 'fill-current'}
          opacity={o.warm ? 0.6 : 0.24}
        />
      ))}
      <Figure x={CENTRE} y={CENTRE + 22} scale={1.4} />
    </>
  )
}

/** Beat 11 — one light, and then everyone else who was also alone. */
function Breath() {
  const many = useMemo(() => {
    const random = seeded(211)
    return Array.from({ length: 130 }, () => {
      const angle = random() * Math.PI * 2
      const distance = 60 + random() * 150
      return {
        x: CENTRE + Math.cos(angle) * distance,
        y: CENTRE + Math.sin(angle) * distance * 0.8,
        r: 1.4 + random() * 2.4,
        o: 0.2 + random() * 0.5,
      }
    })
  }, [])
  return (
    <>
      {many.map((l, i) => (
        <circle
          key={i}
          cx={l.x}
          cy={l.y}
          r={l.r}
          className="fill-current text-rust"
          opacity={l.o}
        />
      ))}
      <circle
        cx={CENTRE}
        cy={CENTRE - 6}
        r={54}
        className="fill-current text-rust"
        opacity={0.07}
      />
      <circle cx={CENTRE} cy={CENTRE - 6} r={30} className="fill-current text-rust" opacity={0.1} />
      <Figure x={CENTRE} y={CENTRE + 26} scale={1.2} />
    </>
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
