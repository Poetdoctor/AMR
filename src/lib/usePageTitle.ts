import { useEffect } from 'react'
import { useT } from '@/lib/i18n'

/**
 * Keeps the document title in step with the route (announced on navigation).
 *
 * The site name comes from the active language too — a French page announcing
 * itself with an English suffix is the kind of seam that tells a reader the
 * translation is a veneer.
 */
export function usePageTitle(title?: string) {
  const site = useT().site.name
  useEffect(() => {
    document.title = title ? `${title} · ${site}` : site
  }, [title, site])
}
