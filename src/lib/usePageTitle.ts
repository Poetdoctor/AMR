import { useEffect } from 'react'

const SITE = 'AMR — the human side'

/** Keeps the document title in step with the route (announced on navigation). */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : SITE
  }, [title])
}
