import { useEffect } from 'react'
import { Link } from '@/components/LocaleLink'
import { Container } from '@/components/Container'
import { Markdown } from '@/components/Markdown'
import { PageHeader } from '@/components/PageHeader'
import { CrisisLine } from '@/components/community/CrisisLine'
import { UntranslatedNotice } from '@/components/UntranslatedNotice'
import { getCommunityGuidelines } from '@/lib/content'
import { useT } from '@/lib/i18n'
import { usePageTitle } from '@/lib/usePageTitle'

/**
 * The rules and the terms people agree to before posting.
 *
 * Under /community, so it carries the section's noindex like everything else
 * there. The words are in src/content/community/guidelines.md.
 */
export default function CommunityGuidelines() {
  const t = useT()
  const guidelines = getCommunityGuidelines()
  usePageTitle(guidelines.title)

  useEffect(() => {
    const tag = document.createElement('meta')
    tag.name = 'robots'
    tag.content = 'noindex, nofollow'
    document.head.appendChild(tag)
    return () => tag.remove()
  }, [])

  return (
    <>
      <UntranslatedNotice />
      <PageHeader
        eyebrow={t.nav.community}
        title={guidelines.title}
        subhead={guidelines.updated ? `Last updated ${guidelines.updated}` : undefined}
      />
      <Container width="prose" className="py-12 md:py-16">
        <Markdown>{guidelines.body}</Markdown>
        <div className="mt-12 space-y-6">
          <CrisisLine />
          <Link
            to="/community"
            className="text-sm font-semibold text-rust-deep underline underline-offset-4"
          >
            <span aria-hidden="true">← </span>Back to Community
          </Link>
        </div>
      </Container>
    </>
  )
}
