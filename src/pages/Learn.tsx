import { ComingSoon } from '@/components/ComingSoon'
import { usePageTitle } from '@/lib/usePageTitle'

export default function Learn() {
  usePageTitle('Learn')
  return (
    <ComingSoon
      eyebrow="Learn"
      title="What resistance actually means"
      subhead="Plain-language articles on the science, the precautions, and what clinicians are seeing — written to be read by someone who has just been handed a diagnosis."
      summary={[
        'What antimicrobial resistance actually means — the mechanism, and why “I am resistant” is the wrong way round.',
        'Why isolation precautions feel personal, and what they are really for.',
        'The psychosocial side of AMR: what providers across BC told us they are seeing.',
        'Who faces greater risk, and why the burden is not evenly shared.',
      ]}
    />
  )
}
