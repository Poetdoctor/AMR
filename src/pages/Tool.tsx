import { ComingSoon } from '@/components/ComingSoon'
import { usePageTitle } from '@/lib/usePageTitle'

export default function Tool() {
  usePageTitle('Prepare for a visit')
  return (
    <ComingSoon
      eyebrow="Visit prep"
      title="Walk in with your questions already written"
      subhead="A private worksheet for the appointment you have coming up — what to ask, what to say, what you want understood."
      summary={[
        'Prompts that help you put the hard parts into words before you are in the room.',
        'Print or save your sheet to take with you.',
        'Entirely private: it runs in your browser, nothing is sent anywhere, and nothing is stored on any server.',
      ]}
    />
  )
}
