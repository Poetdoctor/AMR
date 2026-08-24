import type { ReactNode } from 'react'
import { Container } from './Container'

/** Shared page opening: eyebrow, serif display header, subhead. */
export function PageHeader({
  eyebrow,
  title,
  subhead,
  children,
}: {
  eyebrow?: string
  title: string
  subhead?: string
  children?: ReactNode
}) {
  return (
    <header className="border-b border-sand-line bg-cream-deep py-16 md:py-24">
      <Container width="wide">
        {eyebrow ? <p className="eyebrow mb-5">{eyebrow}</p> : null}
        <h1 className="display-xl max-w-4xl text-ink">{title}</h1>
        {subhead ? <p className="lede mt-6 max-w-2xl">{subhead}</p> : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </Container>
    </header>
  )
}
