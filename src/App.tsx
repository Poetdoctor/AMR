import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import Home from '@/pages/Home'
import Learn from '@/pages/Learn'
import Stories from '@/pages/Stories'
import Tool from '@/pages/Tool'
import Community from '@/pages/Community'
import Team from '@/pages/Team'
import Mission from '@/pages/Mission'
import NotFound from '@/pages/NotFound'

/**
 * Routing shell for all seven sections. Sections still in the build queue
 * resolve to a stated in-progress page rather than 404, so the navigation is
 * complete and testable from day one.
 *
 * /admin is intentionally absent: Decap CMS is served as a static page from
 * public/admin and must not be captured by the SPA router.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/tool" element={<Tool />} />
          <Route path="/community" element={<Community />} />
          <Route path="/team" element={<Team />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
