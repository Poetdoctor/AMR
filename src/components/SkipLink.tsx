import { useT } from '@/lib/i18n'

/** First tab stop on every page — jumps past the nav straight to content. */
export function SkipLink() {
  const t = useT()
  return (
    <a
      href="#main"
      className="sr-only rounded-full focus:not-sr-only focus:absolute focus:start-3 focus:top-3 focus:z-50 focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-cream"
    >
      {t.skip}
    </a>
  )
}
