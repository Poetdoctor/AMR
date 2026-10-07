import { useId, useState } from 'react'
import { site } from '@/config/site'
import { REPORT_NOTE_MAX, REPORT_REASONS, type ReportReason } from '@/lib/community'

/**
 * A visible "Report" on a story or a comment, opening the reasons in place.
 *
 * It used to sit behind a "···" menu. A report action is a hard requirement on
 * every comment, and an unlabelled menu is not a visible one.
 *
 * The form opens inline rather than in a dialog, so focus never has to be
 * trapped and returned, and a screen reader meets the reasons in reading order
 * right after the button that revealed them. Renders as two flex children —
 * the button, then a full-width panel — so the parent row wraps it beneath.
 */
export function ReportControl({
  what,
  onReport,
}: {
  what: 'story' | 'comment'
  onReport: (reason: ReportReason, detail: string) => Promise<void>
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason | ''>('')
  const [detail, setDetail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')

  const chosen = REPORT_REASONS.find((r) => r.id === reason)
  const ready =
    Boolean(chosen) &&
    (chosen?.note !== 'required' || detail.trim().length > 0) &&
    state !== 'sending'

  async function send(event: React.FormEvent) {
    event.preventDefault()
    if (!ready || !reason) return
    setState('sending')
    try {
      await onReport(reason, detail)
      setState('sent')
    } catch {
      setState('failed')
    }
  }

  if (state === 'sent') {
    return (
      <p role="status" className="basis-full text-sm leading-relaxed text-ink-soft">
        Thank you. The website administration will review this
        {reason === 'mine' ? ', and it has been hidden in the meantime' : ''}. You can also write to{' '}
        <a
          href={`mailto:${site.contactEmail}`}
          className="font-semibold text-rust-deep underline underline-offset-4"
        >
          {site.contactEmail}
        </a>
        .
      </p>
    )
  }

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-report`}
        onClick={() => setOpen((value) => !value)}
        className="text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
      >
        Report
      </button>

      {open ? (
        <form
          id={`${id}-report`}
          onSubmit={send}
          className="basis-full rounded-xl border border-sand-line bg-cream p-4 md:p-5"
        >
          <fieldset>
            <legend className="text-sm font-semibold text-ink">
              Why are you reporting this {what}?
            </legend>
            <div className="mt-3 space-y-2">
              {REPORT_REASONS.map((option) => (
                <label key={option.id} className="flex items-start gap-3 text-sm text-ink">
                  <input
                    type="radio"
                    name={`${id}-reason`}
                    value={option.id}
                    checked={reason === option.id}
                    onChange={() => setReason(option.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-rust)]"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {chosen?.note ? (
            <div className="mt-4">
              <label htmlFor={`${id}-note`} className="block text-sm font-semibold text-ink">
                {chosen.note === 'required' ? 'Tell us what is wrong' : 'Anything that helps us'}{' '}
                <span className="font-normal text-ink-soft">
                  — {chosen.note === 'required' ? 'required' : 'optional'}
                </span>
              </label>
              <textarea
                id={`${id}-note`}
                rows={3}
                value={detail}
                maxLength={REPORT_NOTE_MAX}
                required={chosen.note === 'required'}
                autoComplete="off"
                onChange={(event) => setDetail(event.target.value)}
                className="mt-2 w-full resize-y rounded-xl border border-ink-faint bg-paper px-4 py-3 text-sm leading-relaxed text-ink"
              />
            </div>
          ) : null}

          {state === 'failed' ? (
            <p role="alert" className="mt-3 text-sm text-ink">
              That did not send. Please try again, or write to{' '}
              <a
                href={`mailto:${site.contactEmail}`}
                className="font-semibold text-rust-deep underline underline-offset-4"
              >
                {site.contactEmail}
              </a>
              .
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={!ready}
              className="rounded-full bg-rust px-5 py-2 text-sm font-semibold text-cream transition-colors hover:bg-rust-deep disabled:opacity-50"
            >
              {state === 'sending' ? 'Sending…' : 'Send report'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </>
  )
}
