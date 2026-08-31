import type { Beat } from '@/lib/beats'

/**
 * One beat's words, shared by both paths.
 *
 * The fragments lead and the prose follows, because the direction here is that
 * someone should feel this before they are taught anything. Quotes are set as
 * quotes and never paraphrased — the connective writing is ours, those
 * sentences are not.
 */
export function BeatPanel({ beat, compact = false }: { beat: Beat; compact?: boolean }) {
  return (
    <div>
      <p className="eyebrow mb-3">
        Act {beat.act} · {beat.actLabel}
      </p>
      <h2 className="display-lg max-w-2xl text-ink">{beat.title}</h2>

      {/* The fragments. Large, few, and felt rather than read. */}
      <ul className="mt-6 flex list-none flex-wrap items-baseline gap-x-5 gap-y-2">
        {beat.words.map((word, index) => (
          <li
            key={word}
            className={`font-display leading-none font-semibold tracking-tight ${
              index === 0 ? 'text-rust' : 'text-ink-faint'
            } text-[clamp(1.25rem,3.4vw,2.1rem)]`}
          >
            {word}
          </li>
        ))}
      </ul>

      {beat.quotes.map((quote) => (
        <figure
          key={quote.text.slice(0, 30)}
          className="mt-7 max-w-2xl border-l-2 border-rust pl-6"
        >
          <blockquote>
            <p className="font-display text-lg leading-snug font-semibold text-ink md:text-xl">
              “{quote.text}”
            </p>
          </blockquote>
          <figcaption className="mt-2.5 text-sm text-ink-faint">{quote.attribution}</figcaption>
        </figure>
      ))}

      {!compact ? (
        <div className="prose-amr mt-7 max-w-2xl">
          {beat.body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <details className="mt-6 max-w-2xl">
          <summary className="cursor-pointer text-sm font-semibold text-rust-deep underline-offset-4 hover:underline">
            Read more
          </summary>
          <div className="prose-amr mt-4">
            {beat.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
