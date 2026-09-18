import { Link } from '@/components/LocaleLink'
import { Container } from '@/components/Container'
import { PageHeader } from '@/components/PageHeader'
import { Callout } from '@/components/Callout'
import { StoryCard } from '@/components/StoryCard'
import { UntranslatedNotice } from '@/components/UntranslatedNotice'
import { getStories } from '@/lib/content'
import { useI18n, useT } from '@/lib/i18n'
import { usePageTitle } from '@/lib/usePageTitle'

/**
 * Stories are a content collection (src/content/stories/*.md), edited through
 * the CMS like Learn and the team roster. Whether a story appears here, and
 * under whose name, is controlled by its `attribution` field — see
 * lib/content.ts.
 */
export default function Stories() {
  const t = useT()
  const { locale } = useI18n()
  usePageTitle(t.titles.stories)
  const stories = getStories(locale.code)

  return (
    <>
      <UntranslatedNotice when={stories.some((s) => !s.translated)} />
      <PageHeader
        eyebrow={t.nav.stories}
        title={t.pages.stories.title}
        subhead={t.pages.stories.subhead}
      />

      <Container width="wide" className="py-16 md:py-24">
        {stories.length > 0 ? (
          <ul className="grid list-none gap-6 lg:grid-cols-2">
            {stories.map((story) => (
              <li key={story.slug} className="h-full">
                <StoryCard story={story} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="callout p-7 md:p-9">
            <p className="eyebrow mb-4">Being prepared</p>
            <p className="prose-amr">
              These accounts are being readied for publication. They will appear here once the
              people who gave them have confirmed how they want to be named.
            </p>
          </div>
        )}
      </Container>

      <Container width="wide" className="pb-16 md:pb-24">
        <h2 className="display-md text-ink">{t.pages.stories.bothTitle}</h2>
        <div className="prose-amr mt-6 max-w-2xl">
          <p>{t.pages.stories.both1}</p>
          <p>{t.pages.stories.both2}</p>
          <p>{t.pages.stories.both3}</p>
        </div>

        <Callout
          title={t.pages.stories.calloutTitle}
          footer={
            <Link className="btn btn-primary" to="/community">
              {t.pages.stories.calloutAction}
            </Link>
          }
        >
          <p>{t.pages.stories.calloutBody}</p>
        </Callout>
      </Container>
    </>
  )
}
