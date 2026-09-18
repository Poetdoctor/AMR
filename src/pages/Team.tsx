import { Container } from '@/components/Container'
import { PageHeader } from '@/components/PageHeader'
import { Callout } from '@/components/Callout'
import { TeamCard } from '@/components/TeamCard'
import { ImageFrame } from '@/components/ImageFrame'
import { UntranslatedNotice } from '@/components/UntranslatedNotice'
import { getTeam } from '@/lib/content'
import { useI18n, useT } from '@/lib/i18n'
import { usePageTitle } from '@/lib/usePageTitle'

/**
 * The roster is not written here. It comes from the `team` collection
 * (src/content/team/*.md) so entries can be added, edited or have photos
 * swapped through /admin without a code change. Entries without their written
 * content yet are filtered out upstream — see the empty-card rule in
 * lib/content.ts.
 */
export default function Team() {
  const t = useT()
  const { locale } = useI18n()
  usePageTitle(t.titles.team)
  const members = getTeam(locale.code)

  return (
    <>
      <UntranslatedNotice when={members.some((m) => !m.translated)} />
      <PageHeader
        eyebrow={t.pages.team.eyebrow}
        title={t.pages.team.title}
        subhead={t.pages.team.subhead}
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
        <Callout title={t.pages.team.igemTitle}>
          <p>{t.pages.team.igemBody}</p>
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
          <figcaption className="mt-4 text-sm text-ink-faint">{t.pages.team.jamboree}</figcaption>
        </figure>
      </Container>
    </>
  )
}
