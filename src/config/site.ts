/**
 * Single place for the handful of outward-facing values the team needs to set
 * once. Kept out of the page components so wiring one up is a one-line change.
 */
export const site = {
  name: 'AMR — the human side',
  org: 'iGEM UBC Human Practices',

  /**
   * Where the Mission page's "Share your experience" button points.
   *
   * This is a call to take part in the team's ongoing IHP research — surveys,
   * interviews, written accounts — so it must point at the team's participant
   * intake method (form, survey tool, or contact address). It must NOT point at
   * /community, which is a different audience for a different purpose.
   *
   * Left empty until the team confirms which intake method to use; while empty
   * the button renders in an explicit "not open yet" state rather than a dead
   * link. See docs/content-spec.md → Mission.
   */
  shareExperienceUrl: '',

  /** Permanent crisis line for the Community section footer (phase 6). */
  crisisResource: {
    name: 'Talk Suicide Canada',
    tel: '988',
    url: 'https://talksuicide.ca',
  },
} as const
