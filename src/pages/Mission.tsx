import type { ReactNode } from 'react'
import { Container } from '@/components/Container'
import { PageHeader } from '@/components/PageHeader'
import { Callout } from '@/components/Callout'
import { site } from '@/config/site'
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
  usePageTitle('Mission')

  return (
    <>
      <PageHeader
        eyebrow="Our work"
        title="What we're doing, and why"
        subhead="Three stages, in order. The literature search is finished; we're at the start of the second one, which is where you come in."
      />

      <Container width="wide" className="pb-8">
        <Stage number="01" title="The problem">
          <p>
            Antimicrobial resistance is usually counted: prescriptions written, resistant samples,
            days in hospital, dollars. British Columbia has some of the best of that data anywhere:
            nineteen years of it, fifty-one million prescriptions, a stewardship programme that cut
            antibiotic use in small children by more than half. It is genuinely good work, and it
            describes an organism rather than a person.
          </p>
          <p>
            We spent this spring reading everything we could find on the other side of it, and three
            things stood out. Most of what exists comes from hospital samples, which systematically
            misses the people least likely to end up in a hospital record. The studies that do ask
            patients directly are small, scattered across different countries and different
            infections, and almost none of them are from BC. And the same barriers keep surfacing in
            all of them anyway: shame, isolation, silence, cost, and the plain fact that nobody
            explained the diagnosis.
          </p>
          <p>
            The burden also falls unevenly. Our review kept landing on the same groups: people in
            long-term care, people experiencing homelessness, refugees, Indigenous communities
            living with underfunded infrastructure, cancer patients, newborns, and the healthcare
            workers alongside them. Resistance follows the fault lines that were already there. That
            makes it an equity problem, not just a microbiology one.
          </p>
        </Stage>

        <Stage
          number="02"
          title="What we're doing"
          aside={
            <ul className="grid list-none gap-5 sm:grid-cols-2">
              {[
                {
                  title: 'Ask the people it happened to.',
                  body: 'Surveys, one-to-one interviews and written accounts, from patients, from the family and friends who looked after them, and from the nurses and physicians who treat these infections in BC.',
                },
                {
                  title: 'Name the barriers, in their words.',
                  body: 'Turn what we hear into an honest map of the psychosocial barriers people actually run into, starting from what exists in each community rather than what it lacks.',
                },
                {
                  title: 'Fix the explaining problem.',
                  body: 'With UBC Geering Up we’re building AMR teaching for school-age students, and we publish patient and clinician interviews on our social channels, because “nobody told me” came up too often to ignore.',
                },
                {
                  title: 'Take it back to the bench.',
                  body: 'Use the map to steer our own team’s laboratory work, and publish the whole thing in plain language, free to read, for patients as well as researchers.',
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
          <p>
            The reading is done, and we've been learning from people who know this from the inside.
            Dr. Bob Hancock, Canada Research Chair in Health and Genomics at UBC, walked us through
            the science and where public understanding of it falls short. Dr. Richard Lester, an
            infectious disease physician, showed us how this looks from the clinic. And Sunny Loo,
            who lives with vasculitis and long-term antibiotic dependency and is a patient partner
            on the BC Antimicrobial Stewardship Program, has been shaping what we ask, and how we
            ask it. Now we're going to the people the papers are about.
          </p>
        </Stage>

        <Stage number="03" title="What we hope changes">
          <p>
            That a patient with a resistant infection gets asked how they're coping, not only how
            the wound looks. That nobody spends a week in an isolation room without being told why,
            in words they can use with their own family. That BC has patient-side evidence at all,
            so the next strategy written here can be built for the people it lands hardest on,
            rather than around them. And that the next team of students designing something for AMR
            starts by reading what patients said, because it exists and it's easy to find.
          </p>
          <p>
            We're one undergraduate team with one season. We're not going to fix this. We can make
            the human side of it harder to overlook.
          </p>
        </Stage>
      </Container>

      <Container width="wide" className="pb-20 md:pb-28">
        <Callout
          title="Stage two only works if people talk to us"
          footer={
            site.shareExperienceUrl ? (
              <a className="btn btn-primary" href={site.shareExperienceUrl}>
                Share your experience
              </a>
            ) : (
              <div>
                <span
                  className="btn btn-primary cursor-not-allowed opacity-60"
                  aria-disabled="true"
                >
                  Share your experience
                </span>
                <p className="mt-3 text-sm text-ink-faint">
                  We're setting up the intake form for this. It opens shortly.
                </p>
              </div>
            )
          }
        >
          <p>
            Everything above depends on hearing from people who have lived it. If you have, ten
            minutes of your time changes what we're able to say.
          </p>
        </Callout>
      </Container>
    </>
  )
}
