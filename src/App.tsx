import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { I18nProvider } from '@/lib/i18n'
import { readPreference } from '@/lib/languagePreference'
import { DEFAULT_LOCALE, localePath, preferredLocale, READY_LOCALES } from '@/lib/locales'
import type { LocaleCode } from '@/lib/locales'
import Home from '@/pages/Home'
import Learn from '@/pages/Learn'
import Article from '@/pages/Article'
import Stories from '@/pages/Stories'
import Story from '@/pages/Story'
import Tool from '@/pages/Tool'
import Community from '@/pages/Community'
import CommunityStory from '@/pages/CommunityStory'
import ShareExperience from '@/pages/ShareExperience'
import Team from '@/pages/Team'
import Mission from '@/pages/Mission'
import NotFound from '@/pages/NotFound'

/**
 * Routing shell for all seven sections, once per language.
 *
 * The whole route table is declared inside each locale's branch rather than
 * matching a `:locale` parameter, because a parameter would happily match
 * `/learn` as a language called "learn" and there is no honest way to tell the
 * two apart. Declaring them is unambiguous, and React Router prefers a static
 * `/fr` over the root branch's splat, so the ranking works out.
 *
 * English lives at the root: the site is already deployed and linked to, and
 * moving every URL under `/en` for symmetry would break those links.
 *
 * /admin is intentionally absent: Decap CMS is served as a static page from
 * public/admin and must not be captured by the SPA router.
 */

function section() {
  return (
    <>
      <Route index element={<Home />} />
      <Route path="learn" element={<Learn />} />
      <Route path="learn/:slug" element={<Article />} />
      <Route path="stories" element={<Stories />} />
      <Route path="stories/:slug" element={<Story />} />
      <Route path="tool" element={<Tool />} />
      <Route path="community" element={<Community />} />
      <Route path="community/share" element={<ShareExperience />} />
      <Route path="community/story/:id" element={<CommunityStory />} />
      <Route path="team" element={<Team />} />
      <Route path="mission" element={<Mission />} />
      <Route path="*" element={<NotFound />} />
    </>
  )
}

function LocaleShell({ code }: { code: LocaleCode }) {
  return (
    <I18nProvider code={code}>
      <Layout />
    </I18nProvider>
  )
}

/**
 * Sends a first-time visitor to their own language, once, from the front door
 * only.
 *
 * Deliberately narrow. Redirecting a deep link would mean a shared URL landed
 * somewhere other than where it pointed, so `/learn` always renders `/learn`;
 * only `/` is treated as "no opinion stated". It replaces rather than pushes,
 * so the back button still leaves the site, and an explicit choice made in the
 * switcher wins permanently from then on.
 */
function FrontDoor() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname !== '/') return
    const chosen = readPreference()
    const guess = chosen ?? preferredLocale(navigator.languages ?? [navigator.language])
    if (!guess || guess === DEFAULT_LOCALE) return
    navigate(localePath(guess, '/'), { replace: true })
  }, [navigate, pathname])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <FrontDoor />
      <Routes>
        {READY_LOCALES.map((locale) => (
          <Route
            key={locale.code}
            path={locale.code === DEFAULT_LOCALE ? '/' : `/${locale.code}`}
            element={<LocaleShell code={locale.code} />}
          >
            {section()}
          </Route>
        ))}
      </Routes>
    </BrowserRouter>
  )
}
