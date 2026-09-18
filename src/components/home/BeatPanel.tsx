import type { Beat } from '@/lib/beats'

/**
 * One beat's words, shared by both paths.
 *
 * The fragments lead and the prose follows, because the direction here is that
 * someone should feel this before they are taught anything. Quotes are set as
 * quotes and never paraphrased — the connective writing is ours, those
 * sentences are not.
 */
export function BeatPanel({
  beat,
  compact = false,
  onDark = false,
}: {
  beat: Beat
  compact?: boolean
  /** The 3D path runs on a dark ground, so the type has to invert with it. */
  onDark?: boolean
}) {
  const heading = onDark ? 'text-cream' : 'text-ink'
  const muted = onDark ? 'text-cream/55' : 'text-ink-faint'
  const quoteText = onDark ? 'text-cream' : 'text-ink'
  const prose = onDark ? 'text-cream/75' : ''
  const accent = onDark ? 'text-[var(--color-rust-light)]' : 'text-rust'
  return (
    <div>
      <p className={`eyebrow mb-3 ${onDark ? '!text-[var(--color-rust-light)]' : ''}`}>
        Act {beat.act} · {beat.actLabel}
      </p>
      <h2 className={`max-w-2xl ${heading} ${compact ? 'display-md' : 'display-lg'}`}>
        {beat.title}
      </h2>

      {/* The fragments. Large, few, and felt rather than read. */}
      <ul
        className={`flex list-none flex-wrap items-baseline gap-x-4 gap-y-1 ${compact ? 'mt-3' : 'mt-6'}`}
      >
        {beat.words.map((word, index) => (
          <li
            key={word}
            className={`font-display leading-none font-semibold tracking-tight ${
              index === 0 ? accent : muted
            } ${compact ? 'text-[clamp(1rem,2.2vw,1.4rem)]' : 'text-[clamp(1.25rem,3.4vw,2.1rem)]'}`}
          >
            {word}
          </li>
        ))}
      </ul>

      {(compact ? beat.quotes.slice(0, 1) : beat.quotes).map((quote) => (
        <figure
          key={quote.text.slice(0, 30)}
          className="mt-7 max-w-2xl border-s-2 border-rust ps-6"
        >
          <blockquote>
            <p
              className={`font-display text-lg leading-snug font-semibold md:text-xl ${quoteText}`}
            >
              “{quote.text}”
            </p>
          </blockquote>
          <figcaption className={`mt-2.5 text-sm ${muted}`}>{quote.attribution}</figcaption>
        </figure>
      ))}

      {!compact ? (
        <div className={`prose-amr mt-7 max-w-2xl ${prose}`}>
          {beat.body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <details className="mt-5 max-w-2xl">
          <summary
            className={`cursor-pointer text-sm font-semibold underline-offset-4 hover:underline ${onDark ? 'text-[var(--color-rust-light)]' : 'text-rust-deep'}`}
          >
            Read more
          </summary>
          <div className={`prose-amr mt-4 ${prose}`}>
            {beat.quotes.slice(1).map((quote) => (
              <figure key={quote.text.slice(0, 30)} className="border-s-2 border-rust ps-4">
                <blockquote>
                  <p className={`font-display leading-snug font-semibold ${quoteText}`}>
                    “{quote.text}”
                  </p>
                </blockquote>
                <figcaption className={`mt-2 text-sm ${muted}`}>{quote.attribution}</figcaption>
              </figure>
            ))}
            {beat.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
