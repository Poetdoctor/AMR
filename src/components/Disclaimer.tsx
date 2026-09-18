import { useT } from '@/lib/i18n'

/**
 * Site-wide disclaimer. Hard constraint: this is visible on every page — it
 * sits in the global footer, which every route renders. Do not make it
 * conditional, collapsible, or route-specific.
 *
 * It is also the one piece of copy that must never be left untranslated: a
 * reader who cannot read the disclaimer is a reader who was not told.
 */
export function Disclaimer({ className = '' }: { className?: string }) {
  const t = useT()
  return (
    <p
      role="note"
      className={`rounded-2xl border border-sand-line bg-sand px-5 py-4 text-sm leading-relaxed text-ink-soft ${className}`}
    >
      <strong className="font-semibold text-ink">{t.disclaimer.lead}</strong> {t.disclaimer.body}
    </p>
  )
}
