import { useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Hides a story behind its content warning until the reader chooses to see it.
 *
 * The point is consent, not censorship — someone scrolling a feed about
 * resistant infections may be mid-treatment themselves, and should get to
 * decide when to read about a sepsis admission rather than meeting it by
 * accident.
 */
export function ContentWarningGate({
  warning,
  children,
}: {
  warning: string | null
  children: ReactNode
}) {
  const [revealed, setRevealed] = useState(false)
  if (!warning || revealed) return <>{children}</>

  return (
    <div className="rounded-xl bg-sand px-6 py-8 text-center">
      <p className="text-sm font-medium text-ink-soft">
        Content warning: {warning}
      </p>
      <button
        type="button"
        onClick={() => setRevealed(true)}
        className="mt-4 rounded-full border border-sand-line bg-paper px-5 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-faint"
      >
        View content
      </button>
    </div>
  )
}
