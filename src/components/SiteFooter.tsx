import { Link } from 'react-router-dom'
import { Container } from './Container'
import { Disclaimer } from './Disclaimer'

const COLUMNS = [
  {
    heading: 'Read',
    links: [
      { to: '/learn', label: 'Learn' },
      { to: '/stories', label: 'Stories' },
      { to: '/', label: 'The narrative' },
    ],
  },
  {
    heading: 'Use',
    links: [
      { to: '/tool', label: 'Prepare for a visit' },
      { to: '/community', label: 'Community' },
    ],
  },
  {
    heading: 'About',
    links: [
      { to: '/team', label: 'Team' },
      { to: '/mission', label: 'Mission' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="print-hide mt-24 border-t border-sand-line bg-cream-deep">
      <Container width="wide">
        <div className="py-14 md:py-16">
          <Disclaimer className="mb-12" />

          <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-ink">
                AMR — the human side
              </p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
                A Human Practices project by iGEM UBC, on the psychosocial impact of antimicrobial
                resistance.
              </p>
            </div>

            {COLUMNS.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <h2 className="eyebrow mb-4">{column.heading}</h2>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-ink-soft underline-offset-4 hover:text-rust-deep hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <hr className="rule my-10" />

          <div className="flex flex-col gap-4 text-sm text-ink-faint sm:flex-row sm:items-center sm:justify-between">
            <p>iGEM UBC Human Practices · {new Date().getFullYear()}</p>
            <p>No analytics. No trackers. Nothing you type here is recorded.</p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
