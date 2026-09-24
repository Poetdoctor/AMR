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
    resources: 'Resources',
    connect: 'Connect',
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

  home: {
    eyebrow: 'iGEM UBC · Human Practices',
    title: 'Antimicrobial resistance is counted carefully. The people are not.',
    lede: 'Seven things patients and clinicians told us, in the order they tend to happen. It takes about five minutes to read.',
    start: 'Start reading',
    tryMoving: 'Try the moving version',
    tryStill: 'Switch to the still version',
    reducedMotion:
      'Your device asks for reduced motion, so this is the still version. Nothing is missing from it.',
    onward: 'Where to go from here',
    cards: {
      learn: 'What resistance actually is, and why nobody explained it.',
      stories: 'The full accounts these seven beats are drawn from.',
      community: 'Both patients told us no community exists. This is our attempt at one.',
      tool: 'Write your questions before the appointment. Nothing leaves your browser.',
      mission: 'What we are doing about it, and what we hope changes.',
      team: 'The six people reading your story.',
    },
  },

  pages: {
    learn: {
      title: 'What nobody had time to explain',
      subhead:
        'Plain-language articles on the science, the precautions, and what clinicians across BC told us they are seeing. Written for the person who has just been handed a diagnosis, not for the journal.',
      sources: 'Sources',
      sourcesNote:
        'These articles draw on interviews the team conducted with clinicians and researchers in British Columbia, and on the following published work.',
    },
    stories: {
      title: 'In their own words',
      subhead:
        'Accounts from people living with resistant infections. The quotes here are theirs, unedited; everything around them is ours.',
      bothTitle: 'What came up in both',
      both1:
        'Two people, two different conditions, and a set of experiences that kept overlapping. For some patients the first visible change is that staff, family and friends suddenly need gowns and gloves before coming into the room. Those precautions matter — they are how resistant bacteria are kept from spreading — but they also change what being cared for feels like.',
      both2:
        'Physical isolation turns into social isolation quickly. A patient starts wondering whether they are dangerous to the people around them. Some pull away from partners or family for fear of passing the infection on. Others begin to see themselves as “dirty”, or contagious. The infectious disease physicians we spoke to added something patients can’t see from the inside: isolated patients tend to get fewer and shorter interactions with their care team, which is its own kind of harm.',
      both3:
        'Both Norma and Sunny had found their own way through it — a church and a friend who prays, a group of friends online — and neither had been offered one. And both raised the same absence, separately: there is no community of AMR patients to connect with, and both said they would value one.',
      calloutTitle: 'That last part is why the Community section exists',
      calloutBody:
        'If you have lived through any of this, you are not the first — you have just never been put in a room with the others. Post under any name you like. A person reads everything before it appears.',
      calloutAction: 'Go to Community',
    },
    team: {
      eyebrow: 'Who we are',
      title: 'The six people reading your story',
      subhead:
        'We’re the Human Practices subteam of iGEM UBC. If you write to us, one of us answers. There’s no inbox in between.',
      igemTitle: 'iGEM, in one paragraph',
      igemBody:
        'iGEM is an international competition where student teams spend a year building something in synthetic biology. Every team has a Human Practices group whose job is to ask whether the thing being built is actually wanted, and by whom. That’s us.',
      jamboree: 'The global iGEM community at the Grand Jamboree.',
    },
    community: {
      title: 'Somewhere to say it out loud',
      subhead:
        'Both of the patients we interviewed told us the same thing, separately: a community for this does not exist. This is our attempt at one.',
      openingSoon: 'Opening shortly',
      openingSoonBody:
        'This section is built but not yet connected. It will open once the team has finished setting it up.',
      latest: 'Latest lived experiences',
      empty:
        'Nobody has written anything yet. If you have lived through any of this, you would be the first — and the reason the next person finds this page not empty.',
      glossary: 'AMR glossary',
    },
    mission: {
      eyebrow: 'Our work',
      title: 'What we’re doing, and why',
      subhead:
        'Three stages, in order. The literature search is finished; we’re at the start of the second one, which is where you come in.',
      /** Screen-reader prefix on each stage heading. `{n}` is the number. */
      stage: 'Stage {n} — ',
      s1Title: 'The problem',
      s1a: 'Antimicrobial resistance is usually counted: prescriptions written, resistant samples, days in hospital, dollars. British Columbia has some of the best of that data anywhere: nineteen years of it, fifty-one million prescriptions, a stewardship programme that cut antibiotic use in small children by more than half. It is genuinely good work, and it describes an organism rather than a person.',
      s1b: 'We spent this spring reading everything we could find on the other side of it, and three things stood out. Most of what exists comes from hospital samples, which systematically misses the people least likely to end up in a hospital record. The studies that do ask patients directly are small, scattered across different countries and different infections, and almost none of them are from BC. And the same barriers keep surfacing in all of them anyway: shame, isolation, silence, cost, and the plain fact that nobody explained the diagnosis.',
      s1c: 'The burden also falls unevenly. Our review kept landing on the same groups: people in long-term care, people experiencing homelessness, refugees, Indigenous communities living with underfunded infrastructure, cancer patients, newborns, and the healthcare workers alongside them. Resistance follows the fault lines that were already there. That makes it an equity problem, not just a microbiology one.',
      s2Title: 'What we’re doing',
      s2a: 'The reading is done, and we’ve been learning from people who know this from the inside. Dr. Bob Hancock, Canada Research Chair in Health and Genomics at UBC, walked us through the science and where public understanding of it falls short. Dr. Richard Lester, an infectious disease physician, showed us how this looks from the clinic. And Sunny Loo, who lives with vasculitis and long-term antibiotic dependency and is a patient partner on the BC Antimicrobial Stewardship Program, has been shaping what we ask, and how we ask it. Now we’re going to the people the papers are about.',
      card1Title: 'Ask the people it happened to.',
      card1Body:
        'Surveys, one-to-one interviews and written accounts, from patients, from the family and friends who looked after them, and from the nurses and physicians who treat these infections in BC.',
      card2Title: 'Name the barriers, in their words.',
      card2Body:
        'Turn what we hear into an honest map of the psychosocial barriers people actually run into, starting from what exists in each community rather than what it lacks.',
      card3Title: 'Fix the explaining problem.',
      card3Body:
        'With UBC Geering Up we’re building AMR teaching for school-age students, and we publish patient and clinician interviews on our social channels, because “nobody told me” came up too often to ignore.',
      card4Title: 'Take it back to the bench.',
      card4Body:
        'Use the map to steer our own team’s laboratory work, and publish the whole thing in plain language, free to read, for patients as well as researchers.',
      s3Title: 'What we hope changes',
      s3a: 'That a patient with a resistant infection gets asked how they’re coping, not only how the wound looks. That nobody spends a week in an isolation room without being told why, in words they can use with their own family. That BC has patient-side evidence at all, so the next strategy written here can be built for the people it lands hardest on, rather than around them. And that the next team of students designing something for AMR starts by reading what patients said, because it exists and it’s easy to find.',
      s3b: 'We’re one undergraduate team with one season. We’re not going to fix this. We can make the human side of it harder to overlook.',
      calloutTitle: 'Stage two only works if people talk to us',
      calloutBody:
        'Everything above depends on hearing from people who have lived it. If you have, ten minutes of your time changes what we’re able to say.',
      share: 'Share your experience',
      shareSoon: 'We’re setting up the intake form for this. It opens shortly.',
    },
  },

  narrative: {
    /** "Act 2 · Nobody understands…" — some languages order this differently. */
    act: 'Act {n}',
    readMore: 'Read more',
    readLess: 'Read less',
    /**
     * Shown under a quote that has been translated.
     *
     * These are real people's sentences. A reader deserves to know they are
     * reading a rendering of what somebody said rather than the words
     * themselves, and to be able to reach the original.
     */
    translatedQuote: 'Translated from English',
    showOriginal: 'See the original words',
  },

  tool: {
    eyebrow: 'Visit prep',
    title: 'Walk in with your questions already written',
    subhead:
      'Appointments move fast. This is somewhere to work out what you want to ask and what you want understood, before you are in the room.',
    privacyTitle: 'Nothing you type here leaves this page',
    privacyBody:
      'This worksheet runs entirely in your browser. There is no account, no server, and nothing is recorded — we could not read what you write here even if we wanted to. It is yours until you print it or close the tab.',
    privacyShared:
      'If you are on a shared or public computer, leave saving switched off and print or download the sheet before you go.',
    restored: 'Restored from a saved copy in this browser.',

    basics: 'The basics',
    basicsNote: 'All optional — fill in only what is useful to have in front of you.',
    withWho: 'Appointment with',
    withWhoHint: 'Name or clinic',
    when: 'When',
    whenHint: 'Date and time',
    diagnosis: 'What you have been told you have',
    diagnosisHint: 'In whatever words you were given',
    medications: 'What you are taking',
    medicationsHint: 'Medications, doses if you know them',

    happening: "What's been happening",
    sinceLast: 'Since the last appointment',
    sinceLastHint:
      'Changes, new symptoms, anything that worried you. Bullet points are fine — this is for you, not for marking.',

    questions: 'Questions to ask',
    questionsNote:
      'Tick the ones you want on your sheet. These come from what patients told us they wished they had asked, and what clinicians told us they wished they were asked.',

    notClinical: "The part that isn't clinical",
    affecting: 'How this is actually affecting you',
    affectingHint:
      'Sleep, work, money, family, mood, the things you have stopped doing. One patient told us the hardest part was being asked only how the wound looked.',
    leaveWith: 'What you want to leave with',
    leaveWithHint:
      'A decision, an explanation you can repeat to your family, a referral, a date for the next test.',

    sheet: 'Your sheet',
    sheetNote: 'This is what prints.',
    print: 'Print',
    download: 'Download',
    copy: 'Copy',
    keepTitle: 'Keep this on this device',
    keepBody:
      'Saves your answers in this browser only, so they are still here if you come back. Turning it off erases them. Leave it off on a shared computer.',
    clear: 'Clear the whole worksheet',

    /** The printed sheet's own headings — this is the paper a person carries. */
    sheetTitle: 'Visit preparation',
    sheetQuestions: 'Questions I want to ask',
    sheetOwnQuestions: 'My own questions',
    sheetWith: 'Appointment with',
    sheetDiagnosis: 'What I have been told I have',
    sheetMedications: 'What I am taking',
    sheetHappening: "What's been happening",
    sheetAffecting: 'How this is actually affecting me',
    sheetLeaveWith: 'What I want to leave with',
    ownQuestionPlaceholder: 'Type a question and press Enter',

    sheetEmpty:
      'Your sheet builds up here as you fill the form in. Nothing you type leaves this page.',
    sheetDisclaimer:
      'Educational, not medical advice. This worksheet is for your own use and does not replace consultation with a healthcare provider.',
    prepared: 'Prepared {date}',
    ownTitle: 'Your own questions',
    ownNote: 'Anything the list above does not cover. This is the part that matters most.',
    add: 'Add',
    remove: 'Remove',
    /** Appended for screen readers so "Remove" says what it removes. */
    removeLabel: ' question: {q}',

    statusSavingOn: 'Saving to this browser is on.',
    statusSavingOff: 'Saving is off, and anything previously saved has been erased.',
    statusCleared: 'Worksheet cleared.',
    statusCopied: 'Copied to your clipboard.',
    statusCopyBlocked: 'Your browser blocked the clipboard. Use Download or Print instead.',
    statusDownloaded: 'Downloaded as visit-preparation.txt.',
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
