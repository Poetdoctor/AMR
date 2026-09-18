import { Link } from '@/components/LocaleLink'
import { Container } from './Container'
import { PageHeader } from './PageHeader'

/**
 * Placeholder for routes whose section is scheduled later in the build order
 * (see CLAUDE.md). The route exists so the shell is complete and navigable;
 * the page states plainly what will live here rather than showing a blank.
 */
export function ComingSoon({
  eyebrow,
  title,
  subhead,
  summary,
}: {
  eyebrow: string
  title: string
  subhead: string
  summary: string[]
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} subhead={subhead} />
      <Container width="wide" className="py-16 md:py-24">
        <div className="callout p-7 md:p-9">
          <p className="eyebrow mb-4">In progress</p>
          <p className="prose-amr">This section is being built. When it opens, it will hold:</p>
          <ul className="mt-5 space-y-3">
            {summary.map((item) => (
              <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink-soft">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rust"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn btn-ghost" to="/mission">
              Read what we're doing
            </Link>
            <Link className="btn btn-ghost" to="/team">
              Meet the team
            </Link>
          </div>
        </div>
      </Container>
    </>
  )
}
