import type { Beat } from '@/lib/beats'

/**
 * One beat's words.
 *
 * Shared by both paths — the flat version stacks these down the page, and the
 * 3D version overlays the same component on the moving scene. That is what
 * keeps the two versions honest: there is no copy that only exists in one.
 */
export function BeatPanel({ beat, dimmed = false }: { beat: Beat; dimmed?: boolean }) {
  return (
    <div
      className={
        dimmed ? 'opacity-0 transition-opacity duration-700' : 'transition-opacity duration-700'
      }
    >
      <p className="eyebrow mb-4">{beat.eyebrow}</p>
      <h2 className="display-lg max-w-2xl text-ink">{beat.heading}</h2>

      {beat.quote ? (
        <figure className="mt-8 max-w-2xl border-l-2 border-rust pl-6">
          <blockquote>
            <p className="font-display text-xl leading-snug font-semibold text-ink md:text-2xl">
              “{beat.quote.text}”
            </p>
          </blockquote>
          <figcaption className="mt-3 text-sm text-ink-faint">{beat.quote.attribution}</figcaption>
        </figure>
      ) : null}

      <div className="prose-amr mt-7 max-w-2xl">
        {beat.body.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
    </div>
  )
}
