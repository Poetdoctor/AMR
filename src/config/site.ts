/**
 * Single place for the handful of outward-facing values the team needs to set
 * once. Kept out of the page components so wiring one up is a one-line change.
 */
export const site = {
  name: 'AMR — the human side',
  org: 'iGEM UBC Human Practices',

  /**
   * Where this site is served from, with no trailing slash.
   *
   * Used to build the absolute URLs that `rel="canonical"` and `hreflang`
   * require — relative ones are ignored. The prerender step prefers Netlify's
   * own `URL` at build time so deploy previews describe themselves rather than
   * claiming to be production.
   */
  origin: 'https://beyondthediagnosis.netlify.app',

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

  /**
   * Permanent crisis line for the Community section.
   *
   * Verified 2026-08-31: talksuicide.ca now 301-redirects to 988.ca, and the
   * service operates as 9-8-8: Suicide Crisis Helpline — call or text, 24/7/365
   * across Canada. Text matters as much as the number here: someone in an
   * isolation room, or who cannot face speaking, may only be able to text.
   *
   * Re-check this every year. It is the one detail on the site that must not be
   * stale, and it is the kind that goes stale quietly.
   */
  crisisResource: {
    name: '9-8-8: Suicide Crisis Helpline',
    tel: '988',
    url: 'https://988.ca',
    verified: '2026-08-31',
  },
} as const
