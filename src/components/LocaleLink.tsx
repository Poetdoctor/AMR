import { forwardRef } from 'react'
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  type LinkProps,
  type NavLinkProps,
} from 'react-router-dom'
import { useI18n } from '@/lib/i18n'

/**
 * `Link` and `NavLink`, localised.
 *
 * Every call site keeps writing the canonical path it already wrote — `/learn`,
 * not `/fr/learn` — and these add the prefix for whichever language is active.
 * That is the point: a component should not have to know what language it is
 * being rendered in to link to another page, and a link that forgets the prefix
 * is a silent drop back to English halfway through somebody's visit.
 *
 * Import these instead of react-router's in anything under a locale route.
 */

function useLocalised(to: LinkProps['to']) {
  const { path } = useI18n()
  // Only string paths are rewritten. An object `to` is deliberate routing and
  // is left alone; external URLs are not ours to prefix.
  if (typeof to !== 'string') return to
  if (/^[a-z]+:|^\/\//i.test(to) || to.startsWith('#')) return to
  return path(to)
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ to, ...rest }, ref) {
  return <RouterLink ref={ref} to={useLocalised(to)} {...rest} />
})

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(
  { to, ...rest },
  ref,
) {
  return <RouterNavLink ref={ref} to={useLocalised(to)} {...rest} />
})
