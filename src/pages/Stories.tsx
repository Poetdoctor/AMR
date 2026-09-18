import { Link } from '@/components/LocaleLink'
import { Container } from '@/components/Container'
import { PageHeader } from '@/components/PageHeader'
import { Callout } from '@/components/Callout'
import { StoryCard } from '@/components/StoryCard'
import { UntranslatedNotice } from '@/components/UntranslatedNotice'
import { getStories } from '@/lib/content'
import { useT } from '@/lib/i18n'
import { usePageTitle } from '@/lib/usePageTitle'

/**
 * Stories are a content collection (src/content/stories/*.md), edited through
 * the CMS like Learn and the team roster. Whether a story appears here, and
 * under whose name, is controlled by its `attribution` field — see
 * lib/content.ts.
 */
export default function Stories() {
  const t = useT()
  usePageTitle(t.titles.stories)
  const stories = getStories()

  return (
    <>
      <UntranslatedNotice />
      <PageHeader
        eyebrow="Stories"
        title="In their own words"
        subhead="Accounts from people living with resistant infections. The quotes here are theirs, unedited; everything around them is ours."
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
        <h2 className="display-md text-ink">What came up in both</h2>
        <div className="prose-amr mt-6 max-w-2xl">
          <p>
            Two people, two different conditions, and a set of experiences that kept overlapping.
            For some patients the first visible change is that staff, family and friends suddenly
            need gowns and gloves before coming into the room. Those precautions matter — they are
            how resistant bacteria are kept from spreading — but they also change what being cared
            for feels like.
          </p>
          <p>
            Physical isolation turns into social isolation quickly. A patient starts wondering
            whether they are dangerous to the people around them. Some pull away from partners or
            family for fear of passing the infection on. Others begin to see themselves as “dirty”,
            or contagious. The infectious disease physicians we spoke to added something patients
            can’t see from the inside: isolated patients tend to get fewer and shorter interactions
            with their care team, which is its own kind of harm.
          </p>
          <p>
            Both Norma and Sunny had found their own way through it — a church and a friend who
            prays, a group of friends online — and neither had been offered one. And both raised the
            same absence, separately: there is no community of AMR patients to connect with, and
            both said they would value one.
          </p>
        </div>

        <Callout
          title="That last part is why the Community section exists"
          footer={
            <Link className="btn btn-primary" to="/community">
              Go to Community
            </Link>
          }
        >
          <p>
            If you have lived through any of this, you are not the first — you have just never been
            put in a room with the others. Post under any name you like. A person reads everything
            before it appears.
          </p>
        </Callout>
      </Container>
    </>
  )
}
