import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Container } from '@/components/Container'
import { BeatPanel } from './BeatPanel'
import { SCENE_ORDER, Station, stationZ } from './scenes3d'
import { BEATS } from '@/lib/beats'

/**
 * The scroll sequence: one camera travelling a fixed path through seven
 * abstract stations, with the beat's words overlaid at each stop.
 *
 * Scroll position drives the camera directly rather than triggering timed
 * animations, so the reader is always in control — stopping stops the camera,
 * scrolling back goes back. Nothing plays at the reader.
 *
 * The words are ordinary DOM above the canvas, not text in the 3D scene. That
 * keeps them selectable, translatable, findable by search-in-page and readable
 * by a screen reader, and it means the canvas can be aria-hidden without hiding
 * any content.
 */

/** Smooths the camera so a trackpad flick does not snap it between stations. */
function CameraRig({ progressRef }: { progressRef: React.RefObject<number> }) {
  const { camera } = useThree()
  const current = useRef(0)

  useFrame((_, delta) => {
    const target = (progressRef.current ?? 0) * stationZ(SCENE_ORDER.length - 1)
    // Frame-rate independent easing: the same feel at 60fps and at 30.
    const alpha = 1 - Math.pow(0.0015, delta)
    current.current = THREE.MathUtils.lerp(current.current, target, alpha)
    camera.position.set(0, 0, current.current + 21)
    camera.lookAt(0, 0, current.current - 8)
  })
  return null
}

/** Pauses rendering when the canvas is off screen or the tab is hidden. */
function useIsVisible(ref: React.RefObject<HTMLElement | null>): boolean {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    })
    observer.observe(element)
    const onVisibility = () => setVisible(!document.hidden && !!element.offsetParent)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [ref])
  return visible
}

export function RichNarrative({ onFallback }: { onFallback: () => void }) {
  const wrapper = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const visible = useIsVisible(wrapper)

  useEffect(() => {
    function onScroll() {
      const element = wrapper.current
      if (!element) return
      const rect = element.getBoundingClientRect()
      const scrollable = element.offsetHeight - window.innerHeight
      progress.current = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div ref={wrapper} className="relative">
      <div className="pointer-events-none sticky top-0 h-dvh w-full" aria-hidden="true">
        <Canvas
          frameloop={visible ? 'always' : 'never'}
          // Capped: a retina phone rendering at 3x for a background of thin
          // lines costs a great deal and shows almost nothing.
          dpr={[1, 1.6]}
          gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
          camera={{ fov: 55, near: 0.1, far: 400, position: [0, 0, 15] }}
          onCreated={({ gl }) => {
            // A lost context must not leave a frozen black rectangle behind.
            gl.domElement.addEventListener('webglcontextlost', (event) => {
              event.preventDefault()
              onFallback()
            })
          }}
        >
          <fog attach="fog" args={['#faf5ea', 20, 90]} />
          <CameraRig progressRef={progress} />
          {SCENE_ORDER.map((scene, index) => (
            <Station key={scene} scene={scene} index={index} />
          ))}
        </Canvas>
      </div>

      {/* The words. Ordinary DOM, pulled up over the sticky canvas. */}
      <div className="-mt-dvh relative">
        {BEATS.map((beat) => (
          <section key={beat.id} data-beat={beat.id} className="flex min-h-dvh items-center py-20">
            <Container width="wide">
              <div className="max-w-2xl rounded-[var(--radius-card)] border border-sand-line/60 bg-cream/94 p-7 shadow-[var(--shadow-card)] backdrop-blur-md md:p-9">
                <BeatPanel beat={beat} />
              </div>
            </Container>
          </section>
        ))}
      </div>
    </div>
  )
}
