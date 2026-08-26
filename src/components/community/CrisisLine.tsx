import { site } from '@/config/site'

/**
 * Permanent crisis resource for the Community section.
 *
 * Rendered as plain markup with no data dependency, so it is present even if
 * Supabase is down, the comment list fails, or the section is empty. It must
 * never be conditional on anything.
 */
export function CrisisLine() {
  const { name, tel, url } = site.crisisResource
  return (
    <p className="rounded-2xl border border-sand-line bg-sand px-5 py-4 text-sm leading-relaxed text-ink-soft">
      If any of this is bringing something up for you and you need to talk to someone now, you can
      reach <strong className="font-semibold text-ink">{name}</strong> at{' '}
      <a href={`tel:${tel}`} className="font-semibold text-rust-deep underline underline-offset-4">
        {tel}
      </a>
      , any time, or online at{' '}
      <a
        href={url}
        rel="noreferrer noopener"
        target="_blank"
        className="text-rust-deep underline underline-offset-4"
      >
        {url.replace('https://', '')}
      </a>
      .
    </p>
  )
}
