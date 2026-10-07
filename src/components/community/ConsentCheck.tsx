import { useI18n } from '@/lib/i18n'

/**
 * The click-through before anything is posted.
 *
 * Unticked every time, and nothing can be published until it is ticked. The
 * guidelines open in a new tab so reading them does not cost a half-written
 * story.
 */
export function ConsentCheck({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  const { path } = useI18n()
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        required
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-forest)]"
      />
      <span className="text-sm leading-relaxed text-ink">
        I have read the{' '}
        <a
          href={path('/community/guidelines')}
          target="_blank"
          rel="noopener"
          className="font-semibold text-rust-deep underline underline-offset-4"
        >
          community guidelines and terms of use
        </a>{' '}
        (opens in a new tab). I understand that what I post is public, and that any personal or
        contact information I choose to include will be visible to everyone and out of the team’s
        control.
      </span>
    </label>
  )
}
