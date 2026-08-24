/**
 * Site-wide disclaimer. Hard constraint: this is visible on every page — it
 * sits in the global footer, which every route renders. Do not make it
 * conditional, collapsible, or route-specific.
 */
export function Disclaimer({ className = '' }: { className?: string }) {
  return (
    <p
      role="note"
      className={`rounded-2xl border border-sand-line bg-sand px-5 py-4 text-sm leading-relaxed text-ink-soft ${className}`}
    >
      <strong className="font-semibold text-ink">Educational, not medical advice.</strong>{' '}
      Everything on this site is for information and shared experience. It is not a diagnosis, not a
      treatment plan, and does not replace consultation with a healthcare provider. If you are
      worried about an infection or a medication, speak to a clinician.
    </p>
  )
}
