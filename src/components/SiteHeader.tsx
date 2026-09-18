import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Link, NavLink } from './LocaleLink'
import { Container } from './Container'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useT } from '@/lib/i18n'
import type { Dict } from '@/locales/en'

/** Paths are canonical; `LocaleLink` adds the language prefix. */
const NAV = [
  { to: '/learn', key: 'learn' },
  { to: '/stories', key: 'stories' },
  { to: '/tool', key: 'tool' },
  { to: '/community', key: 'community' },
  { to: '/team', key: 'team' },
  { to: '/mission', key: 'mission' },
] as const satisfies readonly { to: string; key: keyof Dict['nav'] }[]

function linkClass({ isActive }: { isActive: boolean }) {
  return [
    'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-rust-wash text-rust-deep' : 'text-ink-soft hover:bg-sand hover:text-ink',
  ].join(' ')
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const t = useT()

  useEffect(() => setOpen(false), [location.pathname])

  return (
    <header className="print-hide sticky top-0 z-40 border-b border-sand-line bg-cream/90 backdrop-blur-sm">
      <Container width="wide">
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          <Link to="/" className="group flex items-baseline gap-2.5">
            <span className="font-display text-xl font-bold tracking-tight text-ink md:text-[1.375rem]">
              {t.site.short}
            </span>
            <span className="hidden text-sm text-ink-faint transition-colors group-hover:text-ink-soft sm:inline">
              {t.site.tagline}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <nav aria-label={t.nav.primary} className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {NAV.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} className={linkClass}>
                      {t.nav[item.key]}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <LanguageSwitcher className="hidden sm:flex" />

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="btn btn-ghost !px-4 !py-2 lg:hidden"
            >
              {open ? t.nav.close : t.nav.menu}
            </button>
          </div>
        </div>
      </Container>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label={t.nav.primary}
          className="border-t border-sand-line bg-cream lg:hidden"
        >
          <Container width="wide">
            <ul className="grid gap-1 py-4 sm:grid-cols-2">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `${linkClass({ isActive })} block`}
                  >
                    {t.nav[item.key]}
                  </NavLink>
                </li>
              ))}
            </ul>
            {/* The narrow layout hides the switcher in the bar; it has to be
                reachable somewhere, and the menu is where the rest of the
                navigation went. */}
            <LanguageSwitcher className="border-t border-sand-line py-4 sm:hidden" />
          </Container>
        </nav>
      ) : null}
    </header>
  )
}
