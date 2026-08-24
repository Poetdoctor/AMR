/** First tab stop on every page — jumps past the nav straight to content. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-full focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-cream"
    >
      Skip to main content
    </a>
  )
}
