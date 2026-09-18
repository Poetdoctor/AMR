import { Link } from '@/components/LocaleLink'
import { Container } from '@/components/Container'
import { useT } from '@/lib/i18n'
import { usePageTitle } from '@/lib/usePageTitle'

export default function NotFound() {
  const t = useT()
  usePageTitle(t.titles.notFound)
  return (
    <Container width="wide" className="py-24 md:py-32">
      <p className="eyebrow mb-5">{t.notFound.eyebrow}</p>
      <h1 className="display-lg text-ink">{t.notFound.title}</h1>
      <p className="lede mt-5 max-w-xl">{t.notFound.body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="btn btn-primary" to="/">
          {t.notFound.home}
        </Link>
        <Link className="btn btn-ghost" to="/mission">
          {t.notFound.mission}
        </Link>
      </div>
    </Container>
  )
}
