import { Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Optional real character model.
 *
 * If `public/models/person.glb` exists it is used for every figure; if it does
 * not, the procedural body is used and nothing else changes. A missing model is
 * the normal state of this repository, not an error.
 *
 * The model is normalised on load — scaled to a consistent height and sat on
 * the floor — because a downloaded character will arrive at whatever scale and
 * origin its author used, and the scenes place figures by their feet.
 *
 * See public/models/README.md for the format, and for the constraint that
 * actually decides this: a mesh served from a public site is downloadable by
 * anyone, so the licence has to permit redistribution. Renderpeople's does not.
 */

const MODEL_URL = '/models/person.glb'
const TARGET_HEIGHT = 1.78

/**
 * One HEAD request for the whole page, not one per figure.
 *
 * `response.ok` is not enough on its own. This is a single-page app, so the
 * host rewrites unknown paths to index.html and a missing model comes back as
 * 200 text/html — the loader then tries to parse a web page as glTF and throws
 * inside the render tree. The content type is what actually answers the
 * question.
 */
let availability: Promise<boolean> | null = null
function checkAvailability(): Promise<boolean> {
  if (!availability) {
    availability = fetch(MODEL_URL, { method: 'HEAD' })
      .then((response) => {
        if (!response.ok) return false
        const type = response.headers.get('content-type') ?? ''
        return !type.includes('text/html')
      })
      .catch(() => false)
  }
  return availability
}

export function useHasPersonModel(): boolean {
  const [has, setHas] = useState(false)
  useEffect(() => {
    let cancelled = false
    void checkAvailability().then((ok) => {
      if (!cancelled) setHas(ok)
    })
    return () => {
      cancelled = true
    }
  }, [])
  return has
}

function Model({
  colour,
  emissive,
  opacity,
}: {
  colour: THREE.Color
  emissive: number
  opacity: number
}) {
  const { scene } = useGLTF(MODEL_URL)

  // Cloned per instance: several figures share one scene graph otherwise, and
  // the second one to mount steals the first one's transform.
  const object = useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    box.getSize(size)
    const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 1
    clone.scale.setScalar(scale)

    // Re-measure after scaling and sit the feet on y = 0.
    const scaled = new THREE.Box3().setFromObject(clone)
    clone.position.y -= scaled.min.y
    clone.position.x -= (scaled.max.x + scaled.min.x) / 2

    clone.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return
      const mesh = child as THREE.Mesh
      mesh.castShadow = true
      // The sequence is lit as one world; a model's own material would arrive
      // with its own lighting assumptions and read as pasted in.
      mesh.material = new THREE.MeshStandardMaterial({
        color: colour,
        emissive: colour,
        emissiveIntensity: emissive,
        roughness: 0.55,
        metalness: 0.05,
        transparent: opacity < 1,
        opacity,
      })
    })
    return clone
  }, [scene, colour, emissive, opacity])

  return <primitive object={object} />
}

export function PersonModel({
  colour,
  emissive,
  opacity,
  fallback,
}: {
  colour: THREE.Color
  emissive: number
  opacity: number
  fallback: ReactNode
}) {
  return (
    <Suspense fallback={fallback}>
      <Model colour={colour} emissive={emissive} opacity={opacity} />
    </Suspense>
  )
}
