import { Link } from 'react-router-dom'
import { Container } from '@/components/Container'
import { usePageTitle } from '@/lib/usePageTitle'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <Container width="wide" className="py-24 md:py-32">
      <p className="eyebrow mb-5">404</p>
      <h1 className="display-lg text-ink">That page isn't here</h1>
      <p className="lede mt-5 max-w-xl">
        The link may be out of date, or the section may not be published yet.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="btn btn-primary" to="/">
          Back to the start
        </Link>
        <Link className="btn btn-ghost" to="/mission">
          What we're doing
        </Link>
      </div>
    </Container>
  )
}
