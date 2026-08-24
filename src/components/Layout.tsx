import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { SkipLink } from './SkipLink'

/**
 * Route shell: header, main landmark, footer (which carries the site-wide
 * disclaimer). Also owns the two things a client-side router breaks if nobody
 * handles them — scroll position and focus placement on navigation.
 */
export function Layout() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    // Put focus at the top of the new page so keyboard and screen-reader users
    // land where sighted users do, instead of continuing from the old page.
    mainRef.current?.focus()
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <SiteHeader />
      <main id="main" ref={mainRef} tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
