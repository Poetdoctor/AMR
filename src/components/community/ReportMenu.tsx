import { useState } from 'react'
import { REPORT_REASONS, type ReportReason } from '@/lib/community'

/** The "…" menu on a story: report, and delete if it is yours. */
export function ReportMenu({
  isMine,
  onReport,
  onDelete,
}: {
  isMine: boolean
  onReport: (reason: ReportReason) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('')

  async function handleReport(reason: ReportReason) {
    setOpen(false)
    try {
      await onReport(reason)
      setStatus('Thank you. A moderator will look at this.')
    } catch {
      setStatus('Could not send that just now.')
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Story options"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full px-2 py-1 text-lg leading-none text-ink-faint hover:bg-sand hover:text-ink"
      >
        <span aria-hidden="true">···</span>
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-1 w-64 rounded-xl border border-sand-line bg-paper p-2 shadow-[var(--shadow-card-lift)]">
          {isMine && onDelete ? (
            <button
              type="button"
              onClick={async () => {
                setOpen(false)
                if (window.confirm('Delete your story? This cannot be undone.')) await onDelete()
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rust-deep hover:bg-rust-wash"
            >
              Delete my story
            </button>
          ) : null}
          <p className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-ink-faint uppercase">
            Report this
          </p>
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason.id}
              type="button"
              onClick={() => handleReport(reason.id)}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink-soft hover:bg-sand hover:text-ink"
            >
              {reason.label}
            </button>
          ))}
        </div>
      ) : null}

      {status ? (
        <p role="status" className="absolute right-0 mt-1 w-56 text-right text-xs text-ink-faint">
          {status}
        </p>
      ) : null}
    </div>
  )
}
