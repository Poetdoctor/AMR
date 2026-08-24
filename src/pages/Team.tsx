import { Container } from '@/components/Container'
import { PageHeader } from '@/components/PageHeader'
import { Callout } from '@/components/Callout'
import { TeamCard } from '@/components/TeamCard'
import { ImageFrame } from '@/components/ImageFrame'
import { getTeam } from '@/lib/content'
import { usePageTitle } from '@/lib/usePageTitle'

/**
 * The roster is not written here. It comes from the `team` collection
 * (src/content/team/*.md) so entries can be added, edited or have photos
 * swapped through /admin without a code change. Entries without their written
 * content yet are filtered out upstream — see the empty-card rule in
 * lib/content.ts.
 */
export default function Team() {
  usePageTitle('Team')
  const members = getTeam()

  return (
    <>
      <PageHeader
        eyebrow="Who we are"
        title="The six people reading your story"
        subhead="We're the Human Practices subteam of iGEM UBC. If you write to us, one of us answers. There's no inbox in between."
      />

      <Container width="wide" className="py-14 md:py-20">
        {/* Capped at the photo's intrinsic 880px so it never upscales and softens. */}
        <figure className="mx-auto max-w-[880px]">
          <ImageFrame
            src="/uploads/whole-team.webp"
            alt="The six members of the iGEM UBC Human Practices subteam, standing together outdoors in front of trees."
            aspect="aspect-[3/2]"
            width={880}
            height={587}
            eager
            className="rounded-[var(--radius-card)] border border-sand-line"
          />
        </figure>
      </Container>

      <Container width="wide" className="pb-16 md:pb-24">
        <ul className="grid list-none grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <li key={member.slug} className="h-full">
              <TeamCard member={member} />
            </li>
          ))}
        </ul>
      </Container>

      <Container width="wide" className="pb-16 md:pb-24">
        <Callout title="iGEM, in one paragraph">
          <p>
            iGEM is an international competition where student teams spend a year building something
            in synthetic biology. Every team has a Human Practices group whose job is to ask whether
            the thing being built is actually wanted, and by whom. That's us.
          </p>
        </Callout>

        <figure className="mt-12">
          <ImageFrame
            src="/uploads/jamboree.jpg"
            alt="Several thousand iGEM participants packed into a hall at the Grand Jamboree, arms raised towards the camera."
            aspect="aspect-[1632/526]"
            width={1632}
            height={526}
            className="rounded-[var(--radius-card)] border border-sand-line"
          />
          <figcaption className="mt-4 text-sm text-ink-faint">
            The global iGEM community at the Grand Jamboree.
          </figcaption>
        </figure>
      </Container>
    </>
  )
}
