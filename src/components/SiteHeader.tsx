import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Container } from './Container'

const NAV = [
  { to: '/learn', label: 'Learn' },
  { to: '/stories', label: 'Stories' },
  { to: '/tool', label: 'Visit prep' },
  { to: '/community', label: 'Community' },
  { to: '/team', label: 'Team' },
  { to: '/mission', label: 'Mission' },
]

function linkClass({ isActive }: { isActive: boolean }) {
  return [
    'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-rust-wash text-rust-deep' : 'text-ink-soft hover:bg-sand hover:text-ink',
  ].join(' ')
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])

  return (
    <header className="print-hide sticky top-0 z-40 border-b border-sand-line bg-cream/90 backdrop-blur-sm">
      <Container width="wide">
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          <Link to="/" className="group flex items-baseline gap-2.5">
            <span className="font-display text-xl font-bold tracking-tight text-ink md:text-[1.375rem]">
              AMR
            </span>
            <span className="hidden text-sm text-ink-faint transition-colors group-hover:text-ink-soft sm:inline">
              the human side
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={linkClass}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="btn btn-ghost !px-4 !py-2 lg:hidden"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </Container>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Primary"
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
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      ) : null}
    </header>
  )
}
