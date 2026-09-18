import { Link } from '@/components/LocaleLink'
import { Container } from '@/components/Container'
import { PageHeader } from '@/components/PageHeader'
import { UntranslatedNotice } from '@/components/UntranslatedNotice'
import { getArticles, LEARN_SOURCES } from '@/lib/content'
import { useT } from '@/lib/i18n'
import { usePageTitle } from '@/lib/usePageTitle'

export default function Learn() {
  const t = useT()
  usePageTitle(t.titles.learn)
  const articles = getArticles()

  return (
    <>
      <UntranslatedNotice />
      <PageHeader
        eyebrow="Learn"
        title="What nobody had time to explain"
        subhead="Plain-language articles on the science, the precautions, and what clinicians across BC told us they are seeing. Written for the person who has just been handed a diagnosis, not for the journal."
      />

      <Container width="wide" className="py-16 md:py-24">
        <ol className="grid list-none gap-6 lg:grid-cols-2">
          {articles.map((article, index) => (
            <li key={article.slug} className="h-full">
              <Link
                to={`/learn/${article.slug}`}
                className="card flex h-full flex-col p-7 transition-shadow hover:shadow-[var(--shadow-card-lift)] md:p-9"
              >
                <span aria-hidden="true" className="eyebrow">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="mt-3 font-display text-2xl leading-snug font-bold tracking-tight text-ink">
                  {article.title}
                </h2>
                <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-soft">
                  {article.summary}
                </p>
                <span className="mt-6 flex items-center gap-3 text-sm font-semibold text-rust-deep">
                  Read
                  <span aria-hidden="true">→</span>
                  <span className="font-normal text-ink-faint">
                    {article.readingMinutes} min read
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </Container>

      <Container width="wide" className="pb-20 md:pb-28">
        <hr className="rule mb-10" />
        <h2 className="display-md text-ink">Sources</h2>
        <p className="prose-amr mt-4 max-w-2xl">
          These articles draw on interviews the team conducted with clinicians and researchers in
          British Columbia, and on the following published work.
        </p>
        <ul className="mt-6 max-w-3xl list-none space-y-5">
          {LEARN_SOURCES.map((source) => (
            <li key={source.href} className="text-sm leading-relaxed text-ink-soft">
              {source.citation}{' '}
              <a
                href={source.href}
                className="text-rust-deep underline underline-offset-4 hover:decoration-2"
                rel="noreferrer noopener"
                target="_blank"
              >
                {source.href.replace('https://', '')}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </>
  )
}
