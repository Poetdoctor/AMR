import { initials } from '@/lib/community'

/** Initials circle. The pseudonym is all we have, and all we want. */
export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const dimensions = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-11 w-11 text-sm'
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-forest-soft font-semibold text-forest-deep ${dimensions}`}
    >
      {initials(name)}
    </span>
  )
}
