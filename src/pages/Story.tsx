import { Link, useParams } from 'react-router-dom'
import { Container } from '@/components/Container'
import { Markdown } from '@/components/Markdown'
import { getStories, getStory } from '@/lib/content'
import { usePageTitle } from '@/lib/usePageTitle'
import NotFound from './NotFound'

export default function Story() {
  const { slug } = useParams()
  const story = slug ? getStory(slug) : undefined
  usePageTitle(story ? `${story.displayName} — Stories` : undefined)

  if (!story) return <NotFound />

  const others = getStories().filter((item) => item.slug !== story.slug)

  return (
    <>
      <header className="border-b border-sand-line bg-cream-deep py-14 md:py-20">
        <Container width="wide">
          <Link
            to="/stories"
            className="text-sm font-semibold text-rust-deep underline-offset-4 hover:underline"
          >
            <span aria-hidden="true">← </span>All stories
          </Link>
          <h1 className="display-lg mt-6 max-w-3xl text-ink">{story.displayName}</h1>
          {story.attribution === 'name' ? (
            <p className="lede mt-4 max-w-2xl">{story.context}</p>
          ) : null}
        </Container>
      </header>

      <Container width="wide" className="py-14 md:py-20">
        <Markdown className="max-w-2xl">{story.body}</Markdown>
      </Container>

      {others.length > 0 ? (
        <Container width="wide" className="pb-16 md:pb-24">
          <hr className="rule mb-10" />
          <h2 className="display-md text-ink">
            {others.length === 1 ? 'Another account' : 'Other accounts'}
          </h2>
          <ul className="mt-6 grid list-none gap-5 sm:grid-cols-2">
            {others.map((item) => (
              <li key={item.slug}>
                <Link
                  to={`/stories/${item.slug}`}
                  className="card flex h-full flex-col p-6 transition-shadow hover:shadow-[var(--shadow-card-lift)]"
                >
                  <span className="font-display text-lg font-bold text-ink">
                    {item.displayName}
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
