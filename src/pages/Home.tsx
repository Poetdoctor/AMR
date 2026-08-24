import { Link } from 'react-router-dom'
import { Container } from '@/components/Container'
import { usePageTitle } from '@/lib/usePageTitle'

/**
 * Phase 1 landing.
 *
 * The full six-beat narrative — camera-travel scrollytelling with a mandatory
 * flat 2D fallback — is the last thing in the build order (CLAUDE.md, phase 7).
 * What's here is the static shell it grows out of: beat 1's hook, and the routes
 * out to the rest of the site. Kept deliberately small so phase 7 replaces it
 * rather than fighting it.
 */

const ENTRANCES = [
  {
    to: '/learn',
    label: 'Learn',
    blurb:
      'What resistance actually is, what the precautions are for, and why nobody explained it.',
  },
  {
    to: '/stories',
    label: 'Stories',
    blurb: 'Testimony from people who have lived with a resistant infection, in their own words.',
  },
  {
    to: '/tool',
    label: 'Visit prep',
    blurb: 'A private worksheet for your next appointment. Nothing you type leaves your browser.',
  },
  {
    to: '/community',
    label: 'Community',
    blurb:
      'Somewhere to say it out loud, under any name you like. Read by a person before it posts.',
  },
]

export default function Home() {
  usePageTitle()

  return (
    <>
      <section className="border-b border-sand-line bg-cream-deep py-20 md:py-32">
        <Container width="wide">
          <p className="eyebrow mb-6">iGEM UBC · Human Practices</p>
          <h1 className="display-xl max-w-4xl text-ink">
            Antimicrobial resistance is counted carefully. The people are not.
          </h1>

          <figure className="mt-12 max-w-2xl border-l-2 border-rust pl-6 md:pl-8">
            <blockquote>
              <p className="font-display text-2xl leading-snug font-semibold text-ink md:text-[1.75rem]">
                “A sinking feeling is what you feel first: I've had this before and oh no, it's
                happening again.”
              </p>
            </blockquote>
            <figcaption className="mt-4 text-sm text-ink-faint">
              Norma Washburn, who lives with a resistant infection
            </figcaption>
          </figure>

          <p className="lede mt-12 max-w-2xl">
            A resistant infection is not one bad day. It is a cycle — hope, then despair,
            encouragement, and back down again — and most of it happens where no one is counting.
            We're a student team asking the people it happened to what it was actually like.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link className="btn btn-primary" to="/mission">
              What we're doing, and why
            </Link>
            <Link className="btn btn-ghost" to="/team">
              Meet the team
            </Link>
          </div>
        </Container>
      </section>

      <Container width="wide" className="py-16 md:py-24">
        <h2 className="display-md text-ink">Where to go from here</h2>
        <ul className="mt-8 grid list-none gap-5 sm:grid-cols-2">
          {ENTRANCES.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="card flex h-full flex-col p-7 transition-shadow hover:shadow-[var(--shadow-card-lift)]"
              >
                <span className="font-display text-xl font-bold tracking-tight text-ink">
                  {item.label}
                </span>
                <span className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-soft">
                  {item.blurb}
                </span>
                <span aria-hidden="true" className="mt-5 text-sm font-semibold text-rust-deep">
                  Open →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  )
}
