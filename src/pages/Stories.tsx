import { ComingSoon } from '@/components/ComingSoon'
import { usePageTitle } from '@/lib/usePageTitle'

export default function Stories() {
  usePageTitle('Stories')
  return (
    <ComingSoon
      eyebrow="Stories"
      title="In their own words"
      subhead="Testimony from people living with resistant infections, and from the people caring for them."
      summary={[
        'Long-form accounts from patients who have lived with a resistant infection.',
        'The parts that rarely make it into a chart: the waiting, the explaining, the distance it puts between people.',
        'Published with consent, attributed the way each person asked to be attributed.',
      ]}
    />
  )
}
