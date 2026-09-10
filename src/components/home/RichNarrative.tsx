import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { Container } from '@/components/Container'
import { BeatPanel } from './BeatPanel'
import { SCENE_ORDER, Station, stationZ, STATION_GAP } from './scenes3d'
import { CameraStation } from './phase'
import { PALETTE } from './atmosphere'
import { BEATS } from '@/lib/beats'

/**
 * The narrative, as one continuous camera move through eleven lit scenes.
 *
 * Scroll drives the camera directly rather than triggering timed animations, so
 * the reader is always in control: stopping stops it, scrolling back goes back.
 * Nothing plays at anybody, which matters for a story about not being listened
 * to.
 *
 * The section runs dark and the rest of the site does not. That is deliberate —
 * it opens with someone falling through unlit space and closes on a single warm
 * light, and neither works on cream. The reader enters a theatre and comes back
 * out of it.
 */

/** How many stations either side of the camera stay mounted. */
const NEAR = 1

function CameraRig({
  progressRef,
  stationRef,
  onStation,
}: {
  progressRef: React.RefObject<number>
  stationRef: { current: number }
  onStation: (index: number) => void
}) {
  const { camera } = useThree()
  const current = useRef(0)
  const reported = useRef(-1)

  useFrame((state, delta) => {
    const progress = progressRef.current ?? 0
    const target = progress * stationZ(SCENE_ORDER.length - 1)
    const alpha = 1 - Math.pow(0.0018, delta)
    current.current = THREE.MathUtils.lerp(current.current, target, alpha)

    // A slow drift so the frame is never perfectly still — a locked-off camera
    // reads as a rendering, and a breathing one reads as a place.
    const t = state.clock.elapsedTime
    camera.position.set(Math.sin(t * 0.14) * 0.45, Math.sin(t * 0.11) * 0.3, current.current + 17)
    camera.lookAt(Math.sin(t * 0.09) * 0.2, 0, current.current - 9)

    // Fractional station position: what every scene animates against.
    stationRef.current = -current.current / STATION_GAP
    const index = Math.round(stationRef.current)
    if (index !== reported.current) {
      reported.current = index
      onStation(index)
    }
  })
  return null
}

function useIsVisible(ref: React.RefObject<HTMLElement | null>): boolean {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    })
    observer.observe(element)
    const onVisibility = () => setVisible(!document.hidden)
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
  const [station, setStation] = useState(0)
  const cameraStation = useRef(0)

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
    <div ref={wrapper} className="relative bg-[#0d0b09]">
      <div className="pointer-events-none sticky top-0 h-dvh w-full" aria-hidden="true">
        <Canvas
          frameloop={visible ? 'always' : 'never'}
          dpr={[1, 1.5]}
          shadows="soft"
          gl={{
            antialias: false, // the composer's own pass handles edges more cheaply
            powerPreference: 'high-performance',
            alpha: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            // ACES compresses the midtones hard, which is right for highlights
            // and wrong for a scene lit mostly by one warm source. Lifting the
            // exposure puts the modelling back into the figure.
            toneMappingExposure: 1.45,
          }}
          camera={{ fov: 52, near: 0.1, far: 260, position: [0, 0, 17] }}
          onCreated={({ gl, scene }) => {
            scene.background = PALETTE.void
            // Dense enough that the next scene down the corridor is genuinely gone,
            // not faintly readable through the dark.
            scene.fog = new THREE.FogExp2(PALETTE.void.getHex(), 0.034)
            gl.domElement.addEventListener('webglcontextlost', (event) => {
              event.preventDefault()
              onFallback()
            })
          }}
        >
          <CameraRig progressRef={progress} stationRef={cameraStation} onStation={setStation} />
          <CameraStation.Provider value={cameraStation}>
            {SCENE_ORDER.map((scene, index) => (
              <Station
                key={scene}
                scene={scene}
                index={index}
                active={Math.abs(index - station) <= NEAR}
              />
            ))}
          </CameraStation.Provider>

          {/*
            Bloom is what makes a warm point of light read as a light rather
            than a dot, and this story ends on one. Kept at low resolution with
            a high threshold so only the emissive things bloom, not the whole
            frame.
          */}
          <EffectComposer enableNormalPass={false}>
            <Bloom
              intensity={0.85}
              luminanceThreshold={0.55}
              luminanceSmoothing={0.3}
              mipmapBlur
              radius={0.7}
            />
            <Vignette offset={0.24} darkness={0.72} />
            <Noise opacity={0.035} />
          </EffectComposer>
        </Canvas>
      </div>

      {/*
        The words, as ordinary DOM above the canvas — selectable, translatable,
        searchable, and readable by a screen reader. Never text in the scene.
      */}
      <div className="relative -mt-[100dvh]">
        {BEATS.map((beat) => (
          <section
            key={beat.id}
            data-beat={beat.id}
            /*
             * Bottom-aligned, not centred. The scene is the point; the words sit
             * under it like a subtitle rather than covering the thing they are
             * describing. Previously the card was centred and full-height, so a
             * reader parked on a beat saw almost none of the scene — it only
             * appeared in the gaps, which is backwards.
             */
            className="flex min-h-dvh items-end pb-[8vh]"
          >
            <Container width="wide">
              <div className="max-w-[27rem] rounded-2xl border border-cream/12 bg-[#0d0b09]/72 p-6 text-cream shadow-[0_20px_60px_-24px_rgba(0,0,0,0.95)] backdrop-blur-lg">
                <BeatPanel beat={beat} compact onDark />
              </div>
            </Container>
          </section>
        ))}
      </div>
    </div>
  )
}
