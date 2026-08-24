import type { ReactNode } from 'react'

/**
 * The soft rounded callout box from the Team and Mission pages — the site's
 * one recurring "aside" surface. Used for the iGEM paragraph, the stage-two
 * ask, and anything later that needs to sit apart from the main column.
 */
export function Callout({
  title,
  children,
  footer,
}: {
  title?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <aside className="callout p-7 md:p-9">
      {title ? <h3 className="display-md mb-4 text-ink">{title}</h3> : null}
      <div className="prose-amr text-[1.0625rem] md:text-lg">{children}</div>
      {footer ? <div className="mt-6">{footer}</div> : null}
    </aside>
  )
}
