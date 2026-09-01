import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Scroll-driven timing.
 *
 * Everything in the sequence used to run on `clock.elapsedTime`, which meant a
 * slow reader arrived after the event: the collapse had already happened, the
 * glass had already closed, the words had already landed. An animation that
 * finishes before you get there is not narrative, it is wallpaper.
 *
 * So each station exposes a `phase` — 0 before the reader approaches, 1 once
 * they are on it — derived from where the camera actually is. Scrolling back
 * runs it backwards. Stopping stops it. The reader is doing the animating.
 *
 * Ambient motion (dust drifting, a slow rotation, breathing) stays on the
 * clock, because that is atmosphere rather than story and should not freeze
 * when somebody pauses to read.
 */

/** Where the camera is, in fractional station numbers. */
export const CameraStation = createContext<{ current: number }>({ current: 0 })
export const useCameraStation = () => useContext(CameraStation)

/** How far this station's story has run, 0–1. */
const ScenePhase = createContext<{ current: number }>({ current: 1 })
export const useScenePhase = () => useContext(ScenePhase)

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

export function StationPhase({ index, children }: { index: number; children: ReactNode }) {
  const camera = useCameraStation()
  const phase = useRef(0)

  useFrame(() => {
    // Begins as the reader comes within a station's distance and completes a
    // little past it, so the beat resolves while its words are still on screen.
    phase.current = clamp01((camera.current - index + 1.05) / 1.35)
  })

  const value = useMemo(() => phase, [])
  return <ScenePhase.Provider value={value}>{children}</ScenePhase.Provider>
}

/** Ease-out. Things in this story arrive quickly and settle slowly. */
export function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/** Ease-in-out, for anything that should feel deliberate on both ends. */
export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Maps a phase into a sub-window of itself, so beats can stage their events. */
export function stage(phase: number, from: number, to: number): number {
  return clamp01((phase - from) / (to - from))
}
