import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/Container'
import { FlatNarrative } from '@/components/home/FlatNarrative'
import { NarrativeBoundary } from '@/components/home/NarrativeBoundary'
import { useCapability, readFlatPreference, writeFlatPreference } from '@/lib/capability'
import { usePageTitle } from '@/lib/usePageTitle'

/**
 * Home: the narrative.
 *
 * Two paths through the same seven beats. The flat one is the default and
 * always works; the 3D scroll sequence is layered on only for visitors whose
 * device and preferences can carry it (see lib/capability.ts). Both render the
 * same words from lib/beats.ts, so the quieter version can never lose content.
 *
 * The switch is also offered on the page, because detection gets it wrong — a
 * capable phone that is hot and throttling, or someone who simply finds the
 * movement unpleasant without having set a system preference.
 */
/*
 * Loaded only when the 3D path is actually going to run. three.js and its
 * friends are a large download, and the people on the still path are by
 * definition the ones least able to afford it — so they never fetch it.
 */
const RichNarrative = lazy(() =>
  import('@/components/home/RichNarrative').then((m) => ({ default: m.RichNarrative })),
)

export default function Home() {
  usePageTitle()
  const capability = useCapability()
  const [preferFlat, setPreferFlat] = useState(true)

  useEffect(() => setPreferFlat(readFlatPreference()), [])

  const [crashed, setCrashed] = useState(false)
  const rich = capability.rich && !preferFlat && !crashed
  const canChoose = capability.reason === 'ok' || preferFlat

  // A lost WebGL context or a render error drops to the still version for the
  // rest of the visit rather than flickering between the two.
  const dropToFlat = useCallback(() => setCrashed(true), [])

  return (
    <>
      <section className="border-b border-sand-line bg-cream-deep py-20 md:py-28">
        <Container width="wide">
          <p className="eyebrow mb-6">iGEM UBC · Human Practices</p>
          <h1 className="display-xl max-w-4xl text-ink">
            Antimicrobial resistance is counted carefully. The people are not.
          </h1>
          <p className="lede mt-8 max-w-2xl">
            Seven things patients and clinicians told us, in the order they tend to happen. It takes
            about five minutes to read.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a className="btn btn-primary" href="#beat-hook">
              Start reading
            </a>
            {canChoose ? (
              <button
                type="button"
                onClick={() => {
                  const next = !preferFlat
                  setPreferFlat(next)
                  writeFlatPreference(next)
                }}
                className="text-sm font-semibold text-rust-deep underline-offset-4 hover:underline"
              >
                {preferFlat ? 'Try the moving version' : 'Switch to the still version'}
              </button>
            ) : null}
          </div>

          {capability.reason === 'reduced-motion' ? (
            <p className="mt-6 max-w-xl text-sm text-ink-faint">
              Your device asks for reduced motion, so this is the still version. Nothing is missing
              from it.
            </p>
          ) : null}
        </Container>
      </section>

      <div id="beat-hook">
        {rich ? (
          <NarrativeBoundary onError={dropToFlat} fallback={<FlatNarrative animate={false} />}>
            <Suspense fallback={<FlatNarrative animate={false} />}>
              <RichNarrative onFallback={dropToFlat} />
            </Suspense>
          </NarrativeBoundary>
        ) : (
          <FlatNarrative animate={capability.reason !== 'reduced-motion'} />
        )}
      </div>

      <section className="border-t border-sand-line py-16 md:py-24">
        <Container width="wide">
          <h2 className="display-md text-ink">Where to go from here</h2>
          <ul className="mt-8 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                to: '/learn',
                label: 'Learn',
                blurb: 'What resistance actually is, and why nobody explained it.',
              },
              {
                to: '/stories',
                label: 'Stories',
                blurb: 'The full accounts these seven beats are drawn from.',
              },
              {
                to: '/community',
                label: 'Community',
                blurb: 'Both patients told us no community exists. This is our attempt at one.',
              },
              {
                to: '/tool',
                label: 'Visit prep',
                blurb: 'Write your questions before the appointment. Nothing leaves your browser.',
              },
              {
                to: '/mission',
                label: 'Mission',
                blurb: 'What we are doing about it, and what we hope changes.',
              },
              { to: '/team', label: 'Team', blurb: 'The six people reading your story.' },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="card flex h-full flex-col p-6 transition-shadow hover:shadow-[var(--shadow-card-lift)]"
                >
                  <span className="font-display text-lg font-bold text-ink">{item.label}</span>
                  <span className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">
                    {item.blurb}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  )
}
