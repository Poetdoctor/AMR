import { ComingSoon } from '@/components/ComingSoon'
import { usePageTitle } from '@/lib/usePageTitle'

export default function Community() {
  usePageTitle('Community')
  return (
    <ComingSoon
      eyebrow="Community"
      title="Somewhere to say it out loud"
      subhead="Both of the patients we spoke to told us the same thing: a community for this does not currently exist. This is our attempt at one."
      summary={[
        'Write about your experience under a display name or a pseudonym — no account needed.',
        'Every post is read by a person before anyone else can see it. Nothing publishes automatically.',
        'A report action on every post, and a crisis-line link kept permanently in view.',
      ]}
    />
  )
}
