import { useState } from 'react'

/**
 * Photo slot for CMS-supplied images.
 *
 * Photos arrive through the Decap media library, which means at any given
 * moment an entry may not have one yet. Rather than a broken image icon or a
 * collapsed layout, an empty or failed source renders a deliberate, on-brand
 * placeholder panel — an intentional state, not a bug.
 *
 * `aspect` should match the source assets rather than crop them: the team
 * portraits are all 3:2 landscape, the Jamboree photo is a wide panorama.
 * Pass `width`/`height` (the intrinsic pixel size) so the browser reserves the
 * right box before the image loads and the page doesn't jump.
 */
export function ImageFrame({
  src,
  alt,
  aspect = 'aspect-[3/2]',
  width,
  height,
  eager = false,
  placeholderLabel = 'Photo coming soon',
  className = '',
}: {
  src?: string
  alt: string
  aspect?: string
  width?: number
  height?: number
  /** Set on above-the-fold images so they aren't lazy-loaded. */
  eager?: boolean
  placeholderLabel?: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const usable = Boolean(src) && !failed

  return (
    <div className={`relative overflow-hidden bg-sand ${aspect} ${className}`}>
      {usable ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(135deg,var(--color-sand)_0_14px,var(--color-cream-deep)_14px_28px)]"
        >
          <span className="rounded-full bg-cream/85 px-3.5 py-1.5 text-[0.6875rem] font-semibold tracking-[0.12em] text-ink-faint uppercase">
            {placeholderLabel}
          </span>
        </div>
      )}
    </div>
  )
}

/** Initials fallback used where a portrait would be — warmer than a grey blob. */
export function Monogram({ name, className = '' }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center bg-rust-wash ${className}`}
    >
      <span className="font-display text-5xl font-semibold text-rust-deep/70 md:text-6xl">
        {initials}
      </span>
    </div>
  )
}
