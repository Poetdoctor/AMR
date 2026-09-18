/**
 * The English catalogue, and the shape every other language is checked against.
 *
 * `Dict` is derived from this object with its string literals widened, so a
 * translation that is missing a key — or has invented one — fails `tsc` rather
 * than rendering a blank space that nobody notices until someone who needed it
 * hits the page. Adding a string here is what makes it translatable; there is
 * no runtime fallback to an English literal hiding in a component.
 *
 * Scope note: this file holds interface chrome only. Article, story, narrative
 * and visit-prep copy live in the content collections and in `beats.ts` /
 * `visitPrep.ts`, which carry their own per-locale text.
 */

export const en = {
  site: {
    name: 'AMR — the human side',
    short: 'AMR',
    tagline: 'the human side',
    blurb:
      'A Human Practices project by iGEM UBC, on the psychosocial impact of antimicrobial resistance.',
    credit: 'iGEM UBC Human Practices',
    noTrackers: 'No analytics. No trackers. Nothing you type here is recorded.',
  },

  nav: {
    primary: 'Primary',
    menu: 'Menu',
    close: 'Close',
    learn: 'Learn',
    stories: 'Stories',
    tool: 'Visit prep',
    community: 'Community',
    team: 'Team',
    mission: 'Mission',
  },

  footer: {
    read: 'Read',
    use: 'Use',
    about: 'About',
    narrative: 'The narrative',
    toolLong: 'Prepare for a visit',
  },

  skip: 'Skip to main content',

  disclaimer: {
    lead: 'Educational, not medical advice.',
    body: 'Everything on this site is for information and shared experience. It is not a diagnosis, not a treatment plan, and does not replace consultation with a healthcare provider. If you are worried about an infection or a medication, speak to a clinician.',
  },

  language: {
    label: 'Language',
    /** Announced when the switcher changes the page's language. */
    changed: 'Language changed to English.',
  },

  /**
   * Shown above a page whose body has not been translated yet.
   *
   * Deliberately not a blank page and not a silent fallback: somebody reading
   * in their own language deserves to be told what they are looking at, in
   * that language, rather than finding English where they expected not to.
   */
  untranslated: {
    notice: 'This page has not been translated yet. The text below is in English.',
  },

  titles: {
    learn: 'Learn',
    stories: 'Stories',
    tool: 'Prepare for a visit',
    community: 'Community',
    share: 'Share an experience',
    team: 'Team',
    mission: 'Mission',
    notFound: 'Page not found',
  },

  notFound: {
    eyebrow: '404',
    title: "That page isn't here",
    body: 'The link may be out of date, or the section may not be published yet.',
    home: 'Back to the start',
    mission: "What we're doing",
  },
}

/** Widens the literal types so a translation is free to use its own words. */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> }

export type Dict = Widen<typeof en>

export default en as Dict
