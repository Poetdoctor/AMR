import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { Container } from '@/components/Container'
import { BeatPanel } from './BeatPanel'
import { SCENE_ORDER, Station, stationZ, STATION_GAP } from './scenes3d'
import { CameraStation } from './phase'
import { PALETTE } from './atmosphere'
import { getBeats } from '@/lib/beats'
import { useI18n } from '@/lib/i18n'

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

/*
 * How quickly the camera catches up with the scroll position: the fraction it
 * still has left to travel after one second.
 *
 * This was 0.0018 — caught up in well under half a second, so a flick of the
 * wheel threw the whole frame forward. Reviewers found the travel too fast to
 * take in. At 0.05 it settles over about a second: the reader still drives it,
 * but it moves like somebody walking rather than being yanked.
 */
const CATCH_UP = 0.05

function CameraRig({
  targetRef,
  stationRef,
  onStation,
}: {
  /** The station the scroll position asks for, fractional. */
  targetRef: React.RefObject<number>
  stationRef: { current: number }
  onStation: (index: number) => void
}) {
  const { camera } = useThree()
  const current = useRef(0)
  const reported = useRef(-1)

  useFrame((state, delta) => {
    const target = stationZ(targetRef.current ?? 0)
    const alpha = 1 - Math.pow(CATCH_UP, delta)
    current.current = THREE.MathUtils.lerp(current.current, target, alpha)

    // A slow drift so the frame is never perfectly still — a locked-off camera
    // reads as a rendering, and a breathing one reads as a place. Half the
    // speed it was: at the old rate the sway read as panning.
    const t = state.clock.elapsedTime
    camera.position.set(Math.sin(t * 0.07) * 0.45, Math.sin(t * 0.055) * 0.3, current.current + 17)
    camera.lookAt(Math.sin(t * 0.045) * 0.2, 0, current.current - 6)

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
  const { locale } = useI18n()
  const beats = getBeats(locale.code)
  const wrapper = useRef<HTMLDivElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const target = useRef(0)
  const visible = useIsVisible(wrapper)
  const [station, setStation] = useState(0)
  const cameraStation = useRef(0)

  /*
   * Scroll position to station.
   *
   * Each beat's card rests at the bottom of its own section, so "the camera is
   * at station i" should mean "card i is at rest". Those rest points are
   * measured rather than assumed, which lets the sections be any height: the
   * first is one screen, so its card is there the moment the narrative starts,
   * and the rest are taller so that each beat takes longer to scroll through
   * and the camera covers less ground per turn of the wheel.
   */
  useEffect(() => {
    let rests: number[] = []
    function measure() {
      const sections = overlay.current?.children
      if (!sections) return
      rests = Array.from(sections, (section) => {
        const element = section as HTMLElement
        return element.offsetTop + element.offsetHeight - window.innerHeight
      })
    }
    function onScroll() {
      const element = wrapper.current
      if (!element || rests.length === 0) return
      const scrolled = -element.getBoundingClientRect().top
      const last = rests.length - 1
      let station = 0
      if (scrolled >= rests[last]) station = last
      else if (scrolled > rests[0]) {
        const i = rests.findIndex((rest) => rest > scrolled) - 1
        station = i + (scrolled - rests[i]) / (rests[i + 1] - rests[i])
      }
      target.current = station
    }
    function onResize() {
      measure()
      onScroll()
    }
    onResize()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
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
          <CameraRig targetRef={target} stationRef={cameraStation} onStation={setStation} />
          <CameraStation.Provider value={cameraStation}>
            {SCENE_ORDER.map((scene, index) => (
              <Station
                key={scene}
                scene={scene}
                index={index}
                words={beats[index]?.words ?? []}
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
              intensity={0.7}
              luminanceThreshold={0.78}
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
      <div ref={overlay} className="relative -mt-[100dvh]">
        {beats.map((beat, index) => (
          <section
            key={beat.id}
            data-beat={beat.id}
            /*
             * Bottom-aligned, not centred. The scene is the point; the words sit
             * under it like a subtitle rather than covering the thing they are
             * describing. Previously the card was centred and full-height, so a
             * reader parked on a beat saw almost none of the scene — it only
             * appeared in the gaps, which is backwards.
             *
             * One and a half screens per beat after the first: the extra half
             * is where the camera travels with no card in the way.
             */
            className={`flex items-end pb-[8vh] ${index === 0 ? 'min-h-dvh' : 'min-h-[150dvh]'}`}
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
