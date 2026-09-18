import { Link } from '@/components/LocaleLink'
import type { Story } from '@/lib/content'

/**
 * Quote-led card. Testimony leads; the attribution line sits underneath it,
 * which is also why a missing portrait costs this design nothing.
 */
export function StoryCard({ story }: { story: Story }) {
  return (
    <article className="card flex h-full flex-col p-7 transition-shadow hover:shadow-[var(--shadow-card-lift)] md:p-9">
      <blockquote className="border-s-2 border-rust ps-5 md:ps-6">
        <p className="font-display text-xl leading-snug font-semibold text-ink md:text-2xl">
          “{story.signatureQuote}”
        </p>
      </blockquote>

      <p className="mt-5 text-sm font-medium text-rust-deep">{story.displayName}</p>
      {/* The context line describes the person, so it only adds something once a
          name is being shown. Under anonymous attribution it would both repeat
          the display name and narrow down who this is. */}
      {story.attribution === 'name' ? (
        <p className="mt-1 text-sm leading-relaxed text-ink-faint">{story.context}</p>
      ) : null}

      <p className="mt-5 flex-1 text-[0.9375rem] leading-relaxed text-ink-soft">{story.summary}</p>

      <Link
        to={`/stories/${story.slug}`}
        className="mt-6 text-sm font-semibold text-rust-deep underline-offset-4 hover:underline"
      >
        Read the full account
        <span className="sr-only">{` from ${story.displayName}`}</span>
        <span aria-hidden="true"> →</span>
      </Link>
    </article>
  )
}
