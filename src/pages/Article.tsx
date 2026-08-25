import { Link, useParams } from 'react-router-dom'
import { Container } from '@/components/Container'
import { Markdown } from '@/components/Markdown'
import { Disclaimer } from '@/components/Disclaimer'
import { getArticle, getArticles } from '@/lib/content'
import { usePageTitle } from '@/lib/usePageTitle'
import NotFound from './NotFound'

export default function Article() {
  const { slug } = useParams()
  const article = slug ? getArticle(slug) : undefined
  usePageTitle(article ? `${article.title} — Learn` : undefined)

  if (!article) return <NotFound />

  const others = getArticles().filter((item) => item.slug !== article.slug)

  return (
    <>
      <header className="border-b border-sand-line bg-cream-deep py-14 md:py-20">
        <Container width="wide">
          <Link
            to="/learn"
            className="text-sm font-semibold text-rust-deep underline-offset-4 hover:underline"
          >
            <span aria-hidden="true">← </span>All articles
          </Link>
          <h1 className="display-lg mt-6 max-w-3xl text-ink">{article.title}</h1>
          <p className="lede mt-4 max-w-2xl">{article.summary}</p>
          <p className="mt-6 text-sm text-ink-faint">{article.readingMinutes} min read</p>
        </Container>
      </header>

      <Container width="wide" className="py-14 md:py-20">
        <Markdown className="max-w-2xl">{article.body}</Markdown>
        {/* The global footer already carries this, but an article is the one place
            on the site someone might land on directly from a search result and
            start reading as though it were clinical guidance. */}
        <Disclaimer className="mt-14 max-w-2xl" />
      </Container>

      {others.length > 0 ? (
        <Container width="wide" className="pb-16 md:pb-24">
          <hr className="rule mb-10" />
          <h2 className="display-md text-ink">Keep reading</h2>
          <ul className="mt-6 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item) => (
              <li key={item.slug}>
                <Link
                  to={`/learn/${item.slug}`}
                  className="card flex h-full flex-col p-6 transition-shadow hover:shadow-[var(--shadow-card-lift)]"
                >
                  <span className="font-display text-lg leading-snug font-bold text-ink">
                    {item.title}
                  </span>
                  <span className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">
                    {item.summary}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      ) : null}
    </>
  )
}
