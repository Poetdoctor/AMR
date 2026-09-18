import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Link } from '@/components/LocaleLink'
import { Container } from '@/components/Container'
import { FlatNarrative } from '@/components/home/FlatNarrative'
import { NarrativeBoundary } from '@/components/home/NarrativeBoundary'
import { UntranslatedNotice } from '@/components/UntranslatedNotice'
import { useCapability, readFlatPreference, writeFlatPreference } from '@/lib/capability'
import { isNarrativeTranslated } from '@/lib/beats'
import { useI18n, useT } from '@/lib/i18n'
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
  const t = useT()
  const { locale } = useI18n()
  usePageTitle()
  const capability = useCapability()
  const [preferFlat, setPreferFlat] = useState(true)

  useEffect(() => setPreferFlat(readFlatPreference()), [])

  const [crashed, setCrashed] = useState(false)
  /*
   * A language whose script the 3D path cannot draw never gets offered it, and
   * the toggle disappears with it — there is nothing to switch to. See
   * `richNarrative` in lib/locales.ts: troika does not apply GPOS mark
   * attachment, so Gurmukhi comes out with its vowel signs detached.
   */
  const scriptRenders = locale.richNarrative
  const rich = scriptRenders && capability.rich && !preferFlat && !crashed
  const canChoose = scriptRenders && (capability.reason === 'ok' || preferFlat)

  // A lost WebGL context or a render error drops to the still version for the
  // rest of the visit rather than flickering between the two.
  const dropToFlat = useCallback(() => setCrashed(true), [])

  return (
    <>
      <UntranslatedNotice when={!isNarrativeTranslated(locale.code)} />
      <section className="border-b border-sand-line bg-cream-deep py-20 md:py-28">
        <Container width="wide">
          <p className="eyebrow mb-6">{t.home.eyebrow}</p>
          <h1 className="display-xl max-w-4xl text-ink">{t.home.title}</h1>
          <p className="lede mt-8 max-w-2xl">{t.home.lede}</p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a className="btn btn-primary" href="#beat-hook">
              {t.home.start}
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
                {preferFlat ? t.home.tryMoving : t.home.tryStill}
              </button>
            ) : null}
          </div>

          {capability.reason === 'reduced-motion' ? (
            <p className="mt-6 max-w-xl text-sm text-ink-faint">{t.home.reducedMotion}</p>
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
          <h2 className="display-md text-ink">{t.home.onward}</h2>
          <ul className="mt-8 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { to: '/learn', label: t.nav.learn, blurb: t.home.cards.learn },
              { to: '/stories', label: t.nav.stories, blurb: t.home.cards.stories },
              { to: '/community', label: t.nav.community, blurb: t.home.cards.community },
              { to: '/tool', label: t.nav.tool, blurb: t.home.cards.tool },
              { to: '/mission', label: t.nav.mission, blurb: t.home.cards.mission },
              { to: '/team', label: t.nav.team, blurb: t.home.cards.team },
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
