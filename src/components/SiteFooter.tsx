import { Link } from './LocaleLink'
import { Container } from './Container'
import { Disclaimer } from './Disclaimer'
import { useT } from '@/lib/i18n'
import type { Dict } from '@/locales/en'

type NavKey = keyof Dict['nav']
type FooterKey = keyof Dict['footer']

const COLUMNS = [
  {
    heading: 'read',
    links: [
      { to: '/learn', nav: 'learn' },
      { to: '/stories', nav: 'stories' },
      { to: '/', footer: 'narrative' },
    ],
  },
  {
    heading: 'use',
    links: [
      { to: '/tool', footer: 'toolLong' },
      { to: '/community', nav: 'community' },
    ],
  },
  {
    heading: 'about',
    links: [
      { to: '/team', nav: 'team' },
      { to: '/mission', nav: 'mission' },
    ],
  },
] as const satisfies readonly {
  heading: FooterKey
  links: readonly ({ to: string } & ({ nav: NavKey } | { footer: FooterKey }))[]
}[]

export function SiteFooter() {
  const t = useT()
  const label = (link: (typeof COLUMNS)[number]['links'][number]) =>
    'nav' in link ? t.nav[link.nav] : t.footer[link.footer]

  return (
    <footer className="print-hide mt-24 border-t border-sand-line bg-cream-deep">
      <Container width="wide">
        <div className="py-14 md:py-16">
          <Disclaimer className="mb-12" />

          <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-ink">
                {t.site.name}
              </p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">{t.site.blurb}</p>
            </div>

            {COLUMNS.map((column) => (
              <nav key={column.heading} aria-label={t.footer[column.heading]}>
                <h2 className="eyebrow mb-4">{t.footer[column.heading]}</h2>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={label(link)}>
                      <Link
                        to={link.to}
                        className="text-sm text-ink-soft underline-offset-4 hover:text-rust-deep hover:underline"
                      >
                        {label(link)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <hr className="rule my-10" />

          <div className="flex flex-col gap-4 text-sm text-ink-faint sm:flex-row sm:items-center sm:justify-between">
            <p>
              {t.site.credit} · {new Date().getFullYear()}
            </p>
            <p>{t.site.noTrackers}</p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
