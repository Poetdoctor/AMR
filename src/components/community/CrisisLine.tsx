import { site } from '@/config/site'

/**
 * Permanent crisis resource for the Community section.
 *
 * Rendered as plain markup with no data dependency, so it is present even if
 * Supabase is down, the comment list fails to load, or the section is empty. It
 * must never be conditional on anything.
 *
 * Text is offered as prominently as the call, deliberately — the people most
 * likely to need this are often somewhere they cannot speak freely.
 */
export function CrisisLine() {
  const { name, tel, url } = site.crisisResource
  return (
    <aside
      aria-label="Crisis support"
      className="rounded-2xl border border-sand-line bg-sand px-5 py-4 text-sm leading-relaxed text-ink-soft"
    >
      <p>
        If reading this brings something up and you need to talk to someone now, you can{' '}
        <a
          href={`tel:${tel}`}
          className="font-semibold text-rust-deep underline underline-offset-4"
        >
          call
        </a>{' '}
        or{' '}
        <a
          href={`sms:${tel}`}
          className="font-semibold text-rust-deep underline underline-offset-4"
        >
          text {tel}
        </a>{' '}
        — <strong className="font-semibold text-ink">{name}</strong>, any hour of any day, anywhere
        in Canada.
      </p>
      <p className="mt-2">
        <a
          href={url}
          rel="noreferrer noopener"
          target="_blank"
          className="text-rust-deep underline underline-offset-4"
        >
          {url.replace('https://', '')}
        </a>
      </p>
    </aside>
  )
}
