import { useState } from 'react'
import type { Beat, Quote } from '@/lib/beats'
import { useT } from '@/lib/i18n'

/**
 * One beat's words, shared by both paths.
 *
 * The fragments lead and the prose follows, because the direction here is that
 * someone should feel this before they are taught anything. Quotes are set as
 * quotes and never paraphrased — the connective writing is ours, those
 * sentences are not.
 */
/**
 * One quote.
 *
 * When `original` is present the text on screen is a translation of something
 * somebody actually said, and the caption says so with the original one click
 * away. On a project arguing that patients are not listened to properly,
 * silently replacing their words with our rendering of them would be the wrong
 * thing to do — and the original is marked `lang="en"` so a screen reader
 * switches voice for it rather than reading English with French phonetics.
 */
function QuoteFigure({
  quote,
  className,
  quoteText,
  muted,
}: {
  quote: Quote
  className: string
  quoteText: string
  muted: string
}) {
  const t = useT()
  return (
    <figure className={className}>
      <blockquote>
        <p className={`font-display leading-snug font-semibold ${quoteText}`}>“{quote.text}”</p>
      </blockquote>
      <figcaption className={`mt-2.5 text-sm ${muted}`}>
        {quote.attribution}
        {quote.original ? ` · ${t.narrative.translatedQuote}` : null}
      </figcaption>
      {quote.original ? (
        <details className="mt-2">
          <summary className={`cursor-pointer text-sm underline-offset-4 hover:underline ${muted}`}>
            {t.narrative.showOriginal}
          </summary>
          <p lang="en" className={`mt-2 text-sm leading-relaxed italic ${muted}`}>
            “{quote.original}”
          </p>
        </details>
      ) : null}
    </figure>
  )
}

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
  const t = useT()
  const [expanded, setExpanded] = useState(false)
  return (
    <div>
      <p className={`eyebrow mb-3 ${onDark ? '!text-[var(--color-rust-light)]' : ''}`}>
        {t.narrative.act.replace('{n}', String(beat.act))} · {beat.actLabel}
      </p>
      <h2 className={`max-w-2xl ${heading} ${compact ? 'display-md' : 'display-lg'}`}>
        {beat.title}
      </h2>

      {/* The fragments. Large, few, and felt rather than read. */}
      <ul
        className={`flex list-none flex-wrap items-baseline gap-x-4 gap-y-1 ${compact ? 'mt-3' : 'mt-6'}`}
      >
        {beat.words.map((word) => (
          <li
            key={word}
            className={`font-display leading-none font-semibold tracking-tight ${accent} ${compact ? 'text-[clamp(1rem,2.2vw,1.4rem)]' : 'text-[clamp(1.25rem,3.4vw,2.1rem)]'}`}
          >
            {word}
          </li>
        ))}
      </ul>

      {(compact ? beat.quotes.slice(0, 1) : beat.quotes).map((quote) => (
        <QuoteFigure
          key={quote.text.slice(0, 30)}
          quote={quote}
          className="mt-7 max-w-2xl border-s-2 border-rust ps-6"
          quoteText={`text-lg md:text-xl ${quoteText}`}
          muted={muted}
        />
      ))}

      {!compact ? (
        <div className={`prose-amr mt-7 max-w-2xl ${prose}`}>
          {beat.body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <details
          className="mt-5 max-w-2xl"
          onToggle={(event) => setExpanded(event.currentTarget.open)}
        >
          <summary
            className={`cursor-pointer text-sm font-semibold underline-offset-4 hover:underline ${onDark ? 'text-[var(--color-rust-light)]' : 'text-rust-deep'}`}
          >
            {expanded ? t.narrative.readLess : t.narrative.readMore}
          </summary>
          <div className={`prose-amr mt-4 ${prose}`}>
            {beat.quotes.slice(1).map((quote) => (
              <QuoteFigure
                key={quote.text.slice(0, 30)}
                quote={quote}
                className="border-s-2 border-rust ps-4"
                quoteText={quoteText}
                muted={muted}
              />
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
