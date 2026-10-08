import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Container } from '@/components/Container'
import { FlatNarrative } from '@/components/home/FlatNarrative'
import { NarrativeBoundary } from '@/components/home/NarrativeBoundary'
import { NarrativeEnd } from '@/components/home/NarrativeEnd'
import { sceneArtwork } from '@/components/home/SceneStill'
import { UntranslatedNotice } from '@/components/UntranslatedNotice'
import { useCapability, readFlatPreference, writeFlatPreference } from '@/lib/capability'
import { isNarrativeTranslated } from '@/lib/beats'
import { useI18n, useT } from '@/lib/i18n'
import { usePageTitle } from '@/lib/usePageTitle'

/**
 * Home: the narrative.
 *
 * Two paths through the same eleven beats. The flat one is the default and
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

  const glass = sceneArtwork('glass')
  const explainer = rich
    ? t.home.movingExplainer
    : capability.reason === 'reduced-motion'
      ? t.home.reducedMotion
      : t.home.stillExplainer

  return (
    <>
      <UntranslatedNotice when={!isNarrativeTranslated(locale.code)} />
      <section className="border-b border-sand-line bg-cream-deep py-16 md:py-24">
        <Container width="wide">
          {/*
            On a phone: heading, who it is for, the picture, then the rest — so
            the picture of what this is about is on the first screen. On a wide
            screen the heading spans the top and the picture takes its own
            column beside the words.
          */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:grid-rows-[auto_auto_1fr] lg:gap-x-16">
            <div className="lg:col-span-2">
              <p className="eyebrow mb-6">{t.home.eyebrow}</p>
              <h1 className="display-xl max-w-4xl text-ink">{t.home.title}</h1>
            </div>

            <p className="max-w-2xl font-display text-xl leading-snug font-semibold text-ink md:text-2xl lg:col-start-1 lg:row-start-2">
              {t.home.audience}
            </p>

            {glass ? (
              <figure className="w-full max-w-sm justify-self-center lg:col-start-2 lg:row-span-2 lg:row-start-2 lg:max-w-md">
                <img
                  src={glass.src}
                  alt={glass.alt}
                  width={896}
                  height={896}
                  fetchPriority="high"
                  decoding="async"
                  className="aspect-square w-full rounded-[var(--radius-card)] border border-sand-line bg-cream object-cover"
                />
                <figcaption className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {t.home.heroCaption}
                </figcaption>
              </figure>
            ) : null}

            <p className="lede max-w-2xl lg:col-start-1 lg:row-start-3 lg:self-start">
              {t.home.lede}
            </p>
          </div>

          <section aria-labelledby="before-you-start" className="mt-14">
            <h2 id="before-you-start" className="display-md text-ink">
              {t.home.before.title}
            </h2>
            <ul className="mt-6 grid list-none gap-5 md:grid-cols-3">
              {[
                { title: t.home.before.whyTitle, body: t.home.before.whyBody },
                { title: t.home.before.whatTitle, body: t.home.before.whatBody },
                { title: t.home.before.riskTitle, body: t.home.before.riskBody },
              ].map((item) => (
                <li key={item.title} className="card p-6">
                  <h3 className="font-display text-xl font-bold text-ink">{item.title}</h3>
                  <p className="mt-2.5 leading-relaxed text-ink-soft">{item.body}</p>
                </li>
              ))}
            </ul>
          </section>

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
                className="font-semibold text-rust-deep underline underline-offset-4"
              >
                {preferFlat ? t.home.tryMoving : t.home.tryStill}
              </button>
            ) : null}
          </div>

          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink-soft">{explainer}</p>
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

      <NarrativeEnd fromDark={rich} />
    </>
  )
}
