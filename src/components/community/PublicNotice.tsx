import { Link } from '@/components/LocaleLink'

/**
 * The plain warning: whatever is posted here is public.
 *
 * Reviewers asked for this to be said outright rather than implied by a
 * visibility setting, and it is shown wherever somebody might be about to
 * write — the index, the composer and every comment form.
 */
export function PublicNotice({ className = '' }: { className?: string }) {
  return (
    <aside
      aria-label="Everything posted here is public"
      className={`rounded-2xl border-2 border-rust bg-rust-wash px-5 py-4 ${className}`}
    >
      <p className="font-semibold text-ink">Everything posted here is public.</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
        Anyone on the internet can read it. You appear only under a name made up for you. Leave out
        your real name, contact details and anything else that could identify you or someone else —
        once it is posted, who sees it is out of our hands.{' '}
        <Link
          to="/community/guidelines"
          className="font-semibold text-rust-deep underline underline-offset-4"
        >
          Community guidelines and terms
        </Link>
      </p>
    </aside>
  )
}
