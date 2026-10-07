import { Link } from '@/components/LocaleLink'
import { Container } from '@/components/Container'
import { site } from '@/config/site'
import { useT } from '@/lib/i18n'

/**
 * Where the narrative stops, said in so many words.
 *
 * Reviewers could not tell the story had ended: the last scene simply gave way
 * to a grid of six equal links. So the ending is marked, and what follows is
 * ordered by what a reader who recognised themselves needs first — something
 * to take to the next appointment, an explanation, and somebody to talk to —
 * before the rest of the site.
 *
 * Shared by both paths, so the still and moving versions end on the same
 * words.
 */
export function NarrativeEnd({ fromDark = false }: { fromDark?: boolean }) {
  const t = useT()
  const crisis = site.crisisResource
  const health = site.healthLine
  /** The sentence, with its number as the thing you tap. */
  const sentence = (template: string, name: string, tel: string, href: string) => {
    const [before, after = ''] = template.replace('{name}', name).split('{tel}')
    return (
      <>
        {before}
        <a
          href={href}
          className="font-semibold whitespace-nowrap text-rust-deep underline underline-offset-4"
        >
          {tel}
        </a>
        {after}
      </>
    )
  }

  return (
    <>
      {/* The theatre's lights coming back up, rather than a hard edge. */}
      {fromDark ? (
        <div aria-hidden="true" className="h-28 bg-gradient-to-b from-[#0d0b09] to-cream" />
      ) : null}

      <section aria-labelledby="narrative-end" className="border-t border-sand-line py-16 md:py-24">
        <Container width="wide">
          <div className="mx-auto max-w-3xl text-center">
            <span aria-hidden="true" className="mx-auto mb-6 block h-0.5 w-16 bg-rust" />
            <p className="eyebrow">{t.home.end.eyebrow}</p>
            <h2 id="narrative-end" className="display-lg mt-4 text-ink">
              {t.home.end.title}
            </h2>
            <p className="lede mx-auto mt-5 max-w-2xl">{t.home.end.lede}</p>
          </div>

          <h3 className="display-md mt-14 text-ink">{t.home.end.practical}</h3>
          <ul className="mt-6 grid list-none gap-5 lg:grid-cols-3">
            <li>
              <Link
                to="/tool"
                className="card flex h-full flex-col p-6 transition-shadow hover:shadow-[var(--shadow-card-lift)]"
              >
                <span className="font-display text-xl font-bold text-ink">
                  {t.home.end.toolTitle}
                </span>
                <span className="mt-2 leading-relaxed text-ink-soft">{t.home.cards.tool}</span>
              </Link>
            </li>
            <li>
              <Link
                to="/learn"
                className="card flex h-full flex-col p-6 transition-shadow hover:shadow-[var(--shadow-card-lift)]"
              >
                <span className="font-display text-xl font-bold text-ink">
                  {t.home.end.learnTitle}
                </span>
                <span className="mt-2 leading-relaxed text-ink-soft">{t.home.cards.learn}</span>
              </Link>
            </li>
            <li className="callout flex h-full flex-col p-6">
              <p className="font-display text-xl font-bold text-ink">{t.home.end.talkTitle}</p>
              <p className="mt-3 leading-relaxed text-ink-soft">
                {sentence(t.home.end.crisis, crisis.name, crisis.tel, `tel:${crisis.tel}`)}
              </p>
              <p className="mt-3 leading-relaxed text-ink-soft">
                {sentence(t.home.end.health, health.name, health.display, `tel:${health.tel}`)}
              </p>
            </li>
          </ul>

          <h3 className="mt-14 font-display text-xl font-bold text-ink">{t.home.end.more}</h3>
          <ul className="mt-5 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { to: '/stories', label: t.nav.stories, blurb: t.home.cards.stories },
              { to: '/community', label: t.nav.community, blurb: t.home.cards.community },
              { to: '/mission', label: t.nav.mission, blurb: t.home.cards.mission },
              { to: '/team', label: t.nav.team, blurb: t.home.cards.team },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="card flex h-full flex-col p-5 transition-shadow hover:shadow-[var(--shadow-card-lift)]"
                >
                  <span className="font-display text-lg font-bold text-ink">{item.label}</span>
                  <span className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  )
}
