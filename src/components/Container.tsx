import type { ReactNode } from 'react'

const WIDTHS = {
  wide: 'max-w-6xl',
  default: 'max-w-5xl',
  prose: 'max-w-3xl',
} as const

export function Container({
  children,
  width = 'default',
  className = '',
}: {
  children: ReactNode
  width?: keyof typeof WIDTHS
  className?: string
}) {
  return (
    <div className={`mx-auto w-full ${WIDTHS[width]} px-6 md:px-8 ${className}`}>{children}</div>
  )
}
