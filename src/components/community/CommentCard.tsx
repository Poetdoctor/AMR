import { useState } from 'react'
import { REPORT_REASONS, themeLabel, type Comment, type ReportReason } from '@/lib/community'

/**
 * One published comment.
 *
 * Two actions, and both matter more here than they would under pre-moderation:
 * Delete (only shown to the person who wrote it, proved by a token in their
 * browser) and Report (shown to everyone, and the only rapid defence between
 * daily sweeps).
 */
export function CommentCard({
  comment,
  isMine,
  onDelete,
  onReport,
}: {
  comment: Comment
  isMine: boolean
  onDelete: (id: string) => Promise<void>
  onReport: (id: string, reason: ReportReason) => Promise<void>
}) {
  const [reporting, setReporting] = useState(false)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  const date = new Date(comment.created_at).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  async function handleDelete() {
    if (!window.confirm('Delete your comment? This removes it for good and cannot be undone.'))
      return
    setBusy(true)
    try {
      await onDelete(comment.id)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not delete that.')
      setBusy(false)
    }
  }

  async function handleReport(reason: ReportReason) {
    setBusy(true)
    try {
      await onReport(comment.id, reason)
      setStatus('Thank you. A moderator will look at this.')
      setReporting(false)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not send that report.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="card p-6 md:p-7">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-display text-base font-bold text-ink">
          {comment.display_name || 'Anonymous'}
        </h3>
        <span className="text-xs text-ink-faint">{date}</span>
        <span className="rounded-full bg-rust-wash px-2.5 py-0.5 text-xs font-medium text-rust-deep">
          {themeLabel(comment.theme)}
        </span>
        {isMine ? (
          <span className="rounded-full border border-sand-line px-2.5 py-0.5 text-xs text-ink-faint">
            Yours
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-[0.9375rem] leading-relaxed whitespace-pre-line text-ink-soft">
        {comment.body}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        {isMine ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="text-sm font-semibold text-rust-deep underline-offset-4 hover:underline disabled:opacity-50"
          >
            Delete
          </button>
        ) : null}

        {!reporting ? (
          <button
            type="button"
            onClick={() => setReporting(true)}
            disabled={busy}
            className="text-sm text-ink-faint underline-offset-4 hover:text-ink-soft hover:underline disabled:opacity-50"
          >
            Report
          </button>
        ) : null}

        {status ? (
          <span role="status" className="text-sm text-ink-faint">
            {status}
          </span>
        ) : null}
      </div>

      {reporting ? (
        <div className="mt-4 rounded-xl border border-sand-line bg-cream-deep p-4">
          <p className="text-sm font-semibold text-ink">What's wrong with it?</p>
          <ul className="mt-3 flex list-none flex-wrap gap-2">
            {REPORT_REASONS.map((reason) => (
              <li key={reason.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleReport(reason.id)}
                  className="rounded-full border border-sand-line bg-paper px-3.5 py-1.5 text-sm text-ink-soft hover:border-ink-faint hover:text-ink disabled:opacity-50"
                >
                  {reason.label}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setReporting(false)}
            className="mt-3 text-sm text-ink-faint underline-offset-4 hover:underline"
          >
            Cancel
          </button>
        </div>
      ) : null}
    </article>
  )
}
