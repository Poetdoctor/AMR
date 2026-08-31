import { useEffect, useRef, useState } from 'react'
import { Container } from '@/components/Container'
import { BeatPanel } from './BeatPanel'
import { BEATS } from '@/lib/beats'
import { SceneStill } from './SceneStill'

/**
 * The narrative without camera travel.
 *
 * Not a stripped-back version — the same seven beats, the same words, in the
 * same order. Each one gets a still of the shape the 3D path would have moved
 * through, so the page still has a visual rhythm, and beats cross-fade in on
 * scroll rather than the camera flying between them.
 *
 * Reading order does not depend on any of that: with JavaScript running but
 * animation disabled, or with an observer that never fires, every panel is
 * present and legible. The animation only ever removes an opacity class it
 * added itself.
 */
export function FlatNarrative({ animate }: { animate: boolean }) {
  const [visible, setVisible] = useState<Set<string>>(
    new Set(animate ? [] : BEATS.map((b) => b.id)),
  )
  const refs = useRef(new Map<string, HTMLElement>())

  useEffect(() => {
    if (!animate) {
      setVisible(new Set(BEATS.map((b) => b.id)))
      return
    }
    if (typeof IntersectionObserver === 'undefined') {
      // No observer: show everything rather than leaving the page blank.
      setVisible(new Set(BEATS.map((b) => b.id)))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-beat')
            if (id) setVisible((current) => new Set(current).add(id))
          }
        }
      },
      { rootMargin: '0px 0px -15% 0px', threshold: 0.15 },
    )

    for (const element of refs.current.values()) observer.observe(element)
    return () => observer.disconnect()
  }, [animate])

  return (
    <div>
      {BEATS.map((beat, index) => (
        <section
          key={beat.id}
          data-beat={beat.id}
          ref={(element) => {
            if (element) refs.current.set(beat.id, element)
          }}
          className={`border-t border-sand-line py-16 md:py-24 ${
            index % 2 === 1 ? 'bg-cream-deep' : ''
          }`}
        >
          <Container width="wide">
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
              <BeatPanel beat={beat} dimmed={animate && !visible.has(beat.id)} />
              <SceneStill scene={beat.scene} active={!animate || visible.has(beat.id)} />
            </div>
          </Container>
        </section>
      ))}
    </div>
  )
}
