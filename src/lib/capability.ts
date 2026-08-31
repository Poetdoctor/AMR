import { useEffect, useState } from 'react'

/**
 * Decides whether this visitor gets the 3D scroll sequence or the flat version.
 *
 * The flat version is not a degraded experience — it carries the same seven
 * beats and the same words. It is simply the one that always works, so it is
 * also the default: this returns false until the checks have actually run,
 * rather than starting a WebGL context and backing out.
 *
 * A phone that stutters through a narrative about being unwell is worse than
 * one that reads it calmly, and the people most likely to be on an old handset
 * are not a group this project can afford to serve badly.
 */

export interface Capability {
  /** True only when the 3D path is both wanted and likely to run well. */
  rich: boolean
  reason: 'reduced-motion' | 'no-webgl' | 'low-power' | 'save-data' | 'ok' | 'checking'
}

function detect(): Capability {
  if (typeof window === 'undefined') return { rich: false, reason: 'checking' }

  // 1. Asked not to. This one is not a heuristic and is never overridden.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return { rich: false, reason: 'reduced-motion' }

  // 2. On a metered connection, don't pull down a 3D bundle.
  const connection = (navigator as { connection?: { saveData?: boolean } }).connection
  if (connection?.saveData) return { rich: false, reason: 'save-data' }

  // 3. Enough machine to hold a steady frame rate. deviceMemory and
  //    hardwareConcurrency are coarse and absent on Safari, so a missing value
  //    is not treated as a failure — only a present, low one is.
  const memory = (navigator as { deviceMemory?: number }).deviceMemory
  const cores = navigator.hardwareConcurrency
  if ((memory !== undefined && memory <= 4) || (cores !== undefined && cores <= 4))
    return { rich: false, reason: 'low-power' }

  // 4. WebGL has to actually exist. Checked last because it costs a context.
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    if (!gl) return { rich: false, reason: 'no-webgl' }
    ;(gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    return { rich: false, reason: 'no-webgl' }
  }

  return { rich: true, reason: 'ok' }
}

export function useCapability(): Capability {
  const [capability, setCapability] = useState<Capability>({ rich: false, reason: 'checking' })

  useEffect(() => {
    setCapability(detect())

    // Someone can turn motion off while the page is open. Honour it live
    // rather than making them reload.
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setCapability(detect())
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return capability
}

/**
 * Lets anyone switch to the flat version, whatever the detection decided.
 *
 * Detection gets it wrong — a capable phone that is hot and throttling, or
 * someone who simply finds the movement unpleasant but has not set a system
 * preference. The escape hatch is visible on the page rather than buried.
 */
const PREFERENCE_KEY = 'amr.home.flat.v1'

export function readFlatPreference(): boolean {
  try {
    return window.localStorage.getItem(PREFERENCE_KEY) === 'yes'
  } catch {
    return false
  }
}

export function writeFlatPreference(flat: boolean): void {
  try {
    if (flat) window.localStorage.setItem(PREFERENCE_KEY, 'yes')
    else window.localStorage.removeItem(PREFERENCE_KEY)
  } catch {
    /* Private window — the choice just won't persist. */
  }
}
