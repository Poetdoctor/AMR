import type { ReactNode } from 'react'
import { Container } from '@/components/Container'
import { PageHeader } from '@/components/PageHeader'
import { Callout } from '@/components/Callout'
import { site } from '@/config/site'
import { UntranslatedNotice } from '@/components/UntranslatedNotice'
import { useT } from '@/lib/i18n'
import { usePageTitle } from '@/lib/usePageTitle'

function Stage({
  number,
  title,
  children,
  aside,
}: {
  number: string
  title: string
  /** Body copy — held to a readable measure. */
  children: ReactNode
  /** Optional full-column content (card grids and the like) below the copy. */
  aside?: ReactNode
}) {
  return (
    <section className="grid gap-6 border-t border-sand-line py-12 md:grid-cols-[7rem_1fr] md:gap-10 md:py-16">
      <div className="md:pt-2">
        <span aria-hidden="true" className="font-display text-5xl leading-none font-bold text-rust">
          {number}
        </span>
      </div>
      <div>
        <h2 className="display-lg text-ink">
          <span className="sr-only">{`Stage ${number} — `}</span>
          {title}
        </h2>
        <div className="prose-amr mt-6 max-w-2xl">{children}</div>
        {aside ? <div className="mt-10">{aside}</div> : null}
      </div>
    </section>
  )
}

export default function Mission() {
  const t = useT()
  usePageTitle(t.titles.mission)

  return (
    <>
      <UntranslatedNotice />
      <PageHeader
        eyebrow={t.pages.mission.eyebrow}
        title={t.pages.mission.title}
        subhead={t.pages.mission.subhead}
      />

      <Container width="wide" className="pb-8">
        <Stage number="01" title={t.pages.mission.s1Title}>
          <p>{t.pages.mission.s1a}</p>
          <p>{t.pages.mission.s1b}</p>
          <p>{t.pages.mission.s1c}</p>
        </Stage>

        <Stage
          number="02"
          title={t.pages.mission.s2Title}
          aside={
            <ul className="grid list-none gap-5 sm:grid-cols-2">
              {[
                {
                  title: t.pages.mission.card1Title,
                  body: t.pages.mission.card1Body,
                },
                {
                  title: t.pages.mission.card2Title,
                  body: t.pages.mission.card2Body,
                },
                {
                  title: t.pages.mission.card3Title,
                  body: t.pages.mission.card3Body,
                },
                {
                  title: t.pages.mission.card4Title,
                  body: t.pages.mission.card4Body,
                },
              ].map((item) => (
                <li key={item.title} className="card p-6">
                  <h3 className="font-display text-lg leading-snug font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-soft">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          }
        >
          <p>{t.pages.mission.s2a}</p>
        </Stage>

        <Stage number="03" title={t.pages.mission.s3Title}>
          <p>{t.pages.mission.s3a}</p>
          <p>{t.pages.mission.s3b}</p>
        </Stage>
      </Container>

      <Container width="wide" className="pb-20 md:pb-28">
        <Callout
          title={t.pages.mission.calloutTitle}
          footer={
            site.shareExperienceUrl ? (
              <a className="btn btn-primary" href={site.shareExperienceUrl}>
                {t.pages.mission.share}
              </a>
            ) : (
              <div>
                <span
                  className="btn btn-primary cursor-not-allowed opacity-60"
                  aria-disabled="true"
                >
                  {t.pages.mission.share}
                </span>
                <p className="mt-3 text-sm text-ink-faint">{t.pages.mission.shareSoon}</p>
              </div>
            )
          }
        >
          <p>{t.pages.mission.calloutBody}</p>
        </Callout>
      </Container>
    </>
  )
}
