/**
 * Home: ten beats, four acts.
 *
 * The direction here is the team's, and it corrects an earlier mistake worth
 * recording. The first attempt illustrated the subject — colonies, plates,
 * zones of inhibition. Accurate, and wrong: it is the thing almost every AMR
 * page does, and it makes the story about an organism.
 *
 * It isn't. What the interviews actually contain is fear, uncertainty,
 * isolation, misunderstanding, exhaustion, and wanting to be seen. So the
 * weighting is roughly 70% human experience, 20% the system around it, 10% the
 * biology — and the reader should FEEL what AMR is like before being told what
 * it is. The bacterium does not appear until beat eight, and when it does it is
 * smaller than the words people wrap around it.
 *
 * `words` are the floating fragments the scene shows. `body` carries the same
 * substance in prose so nothing is only available to whoever can run WebGL.
 * Every quote is verbatim from docs/doc-a-amr-beyond-the-diagnosis.pdf.
 */

import { DEFAULT_LOCALE, type LocaleCode } from './locales.ts'

export type SceneId =
  | 'fall' // a path, and the floor tilting under it
  | 'rollercoaster' // the terrain moving while the person stands still
  | 'weight' // treatment accumulating until it bends someone
  | 'corridor' // being moved past rather than met
  | 'machine' // procedures arriving unexplained
  | 'glass' // walls forming between a person and everyone else
  | 'ocean' // alone, and then the lights of everyone else alone
  | 'monster' // the word made bigger than the organism
  | 'world' // a life, with appointments pinned all through it
  | 'whole' // everything turns, and faces the person
  | 'breath' // the last thing: one light, one sentence, and then everyone else

export type BeatId =
  | 'fall'
  | 'rollercoaster'
  | 'weight'
  | 'corridor'
  | 'machine'
  | 'glass'
  | 'ocean'
  | 'monster'
  | 'world'
  | 'whole'
  | 'breath'

export interface Quote {
  text: string
  attribution: string
  /**
   * The words as they were actually said, present only when `text` is a
   * translation of them.
   *
   * These are real people's sentences, taken verbatim from the interviews. A
   * translation of somebody's words is not their words, and on a project whose
   * whole argument is that patients are not listened to properly, quietly
   * swapping one for the other would be the wrong thing to do. So a translated
   * quote is shown as a translation with the original kept beside it.
   */
  original?: string
}

export interface Beat {
  id: BeatId
  act: 1 | 2 | 3 | 4
  actLabel: string
  title: string
  /** Fragments the scene surfaces. Large, few, and felt rather than read. */
  words: string[]
  /** Verbatim, always. The connective prose is ours; these are theirs. */
  quotes: Quote[]
  body: string[]
  scene: SceneId
}

/**
 * Everything in a beat that is words.
 *
 * A translation supplies this and nothing else: the acts, the scenes, the
 * order and which quote belongs where are structure, identical in every
 * language, and live once in `BEATS` below.
 */
export interface BeatCopy {
  title: string
  words: string[]
  body: string[]
  /** Parallel to the English `quotes`, in the same order. */
  quotes: { text: string; attribution: string }[]
}

export interface NarrativeCopy {
  acts: Record<1 | 2 | 3 | 4, string>
  /** `Record`, not a partial — a language cannot translate nine of eleven beats. */
  beats: Record<BeatId, BeatCopy>
}

export const ACTS: Record<number, string> = {
  1: 'Something is wrong',
  2: "Nobody understands what I'm carrying",
  3: 'The infection is not the whole story',
  4: 'Healing begins when someone sees the whole person',
}

export const BEATS: Beat[] = [
  {
    id: 'fall',
    act: 1,
    actLabel: ACTS[1],
    title: 'The fall',
    words: ['Hope', 'Again?', 'Fear'],
    scene: 'fall',
    quotes: [
      {
        text: "A sinking feeling is what you feel first: I've had this before and oh no, it's happening again.",
        attribution: 'Norma Washburn, AMR patient',
      },
      {
        text: 'My dressing lasted for months, but I was scared it would happen again.',
        attribution: 'Norma Washburn',
      },
    ],
    body: [
      'Nothing dramatic happens. There is no moment anybody would put in a chart. There is a result, or a phrase, or a look — and the ground is not quite where it was a second ago.',
    ],
  },
  {
    id: 'rollercoaster',
    act: 1,
    actLabel: ACTS[1],
    title: 'The rollercoaster',
    words: ['Happiness', 'Despair', 'Encouraged', 'Back in the dumps'],
    scene: 'rollercoaster',
    quotes: [
      {
        text: 'But it’s a relief to have people who are specialists to do these dressings for you.',
        attribution: 'Norma Washburn',
      },
    ],
    body: [
      'Initial hope and happiness, then despair, then encouraged, and ultimately back down in the dumps. Patients described the same shape to us again and again. It is not a description of an illness — it is what living with one that keeps returning does to a person.',
      'The person is not moving. The ground is.',
    ],
  },
  {
    id: 'weight',
    act: 1,
    actLabel: ACTS[1],
    title: 'The invisible weight',
    words: ['Another course', 'And another', 'Enough'],
    scene: 'weight',
    quotes: [],
    body: [
      'Every course of antibiotics is one more thing to get through. They accumulate. Nobody counts them, because each one on its own is reasonable.',
      'This subconscious despair can manifest itself physically. Norma collapsed to the ground with exhaustion after repeated treatment with antibiotics. Not from the infection. From the treating.',
    ],
  },
  {
    id: 'corridor',
    act: 2,
    actLabel: ACTS[2],
    title: 'The hospital that doesn’t see you',
    words: ['Diagnosis', 'Prescription', 'Test', 'Procedure'],
    scene: 'corridor',
    quotes: [
      {
        text: 'I want others to understand how I feel and stop long enough to allow me to share how I feel instead of going straight into…the treatment',
        attribution: 'Sunny Loo, vasculitis patient',
      },
      {
        text: 'I would appreciate my physician asking about how I feel… but they would send me straight to counseling if I did ask.',
        attribution: 'Sunny Loo — and the counselling would be out of pocket',
      },
      {
        text: 'It seems they have just decided that their priority is getting through patients after patients, but it leaves the patient feeling less than prepared to face what they need.',
        attribution: 'Norma Washburn',
      },
    ],
    body: [
      'Everyone here is competent, and everyone here is busy. Canada has a physician shortage, British Columbia included, and finding time to connect personally is genuinely hard.',
      'The words still arrive on time. The person carrying them does not get asked anything.',
    ],
  },
  {
    id: 'machine',
    act: 2,
    actLabel: ACTS[2],
    title: 'The missing explanation',
    words: ['Why this?', 'Why now?', 'Nobody said'],
    scene: 'machine',
    quotes: [
      {
        text: 'They are busy putting in a PICC telling me that I need it, but only because I have some nursing experience I understood it… I would be really really scared otherwise… people have no time to explain to patients.',
        attribution: 'A patient, in the team’s interviews',
      },
      {
        text: 'Make it a priority to, if the doctor has concerns about a medication and is hovering between several options, tell the patient that there are those concerns… he should let the patient in on it so that they know what will be possible outcomes.',
        attribution: 'Norma Washburn',
      },
    ],
    body: [
      'Swabs, lines, scans, results. Each has a reason, and the reason stays inside the machine.',
      'Dr. Edith Blondel-Hill told us some AMR screening is invasive to a patient’s privacy and modesty — repeated swabs, including anal swabs. Without a proper debrief beforehand, people can come out of it feeling violated rather than investigated.',
      'Norma’s physician never had time to explain what AMR was, or what side effects to expect. The comorbidities that followed arrived as a surprise that a conversation could have prevented.',
    ],
  },
  {
    id: 'glass',
    act: 2,
    actLabel: ACTS[2],
    title: 'Isolation',
    words: ['Am I dangerous?', 'Am I contagious?', 'Am I dirty?'],
    scene: 'glass',
    quotes: [],
    body: [
      'The room does not change. Staff, then family, then friends start putting on gowns and gloves before coming in, and then it is a different room.',
      'The precautions matter — they stop resistant bacteria spreading. What follows them often is not intended by anyone. Physical isolation becomes social isolation. People begin distancing themselves from partners and family for fear of passing it on, and some come to see themselves as dirty, or contagious.',
      'Dr. Blondel-Hill and Dr. Anthony Liu both raised what patients cannot see from inside the room: isolated patients tend to receive fewer and shorter interactions with their care team, and the evidence links that to anxiety, depression and stigmatisation.',
    ],
  },
  {
    id: 'ocean',
    act: 3,
    actLabel: ACTS[3],
    title: 'The loneliness',
    words: ['Nobody else', 'Anywhere', 'Surely somebody'],
    scene: 'ocean',
    quotes: [],
    body: [
      'Both patients found something for themselves. Norma has the church, and a friend who believes in the power of prayer, which helped her greatly through the isolated stretches. Sunny plays online games with friends, and stays connected that way.',
      'Neither was offered anything. Both raised the same absence, unprompted: there is no community of AMR patients to connect with, and both said they would value one.',
      'They are not rare. They are unconnected. Every light out there is another person who was told the same thing, in another room, on another night.',
    ],
  },
  {
    id: 'monster',
    act: 3,
    actLabel: ACTS[3],
    title: 'The monster is a word',
    words: ['SUPERBUG', 'UNTREATABLE', 'DOOMED', 'INFECTIOUS'],
    scene: 'monster',
    quotes: [
      {
        text: 'Mom, remember when we were kids and you were reading us all about the fact of overuse of antibiotics and that we’re gonna create a superbug? Mom, this is what you got — a superbug!',
        attribution: 'Norma’s daughter',
      },
    ],
    body: [
      'People hear “superbug” and assume no antibiotic will work at all. Usually something still does; resistance makes the list shorter and the treatment more complicated.',
      'And underneath the word is the misconception that matters most: that the person has become resistant to antibiotics. They haven’t. The bacteria have.',
    ],
  },
  {
    id: 'world',
    act: 3,
    actLabel: ACTS[3],
    title: 'The world beyond the hospital',
    words: ['Work', 'School', 'Money', 'Getting there'],
    scene: 'world',
    quotes: [
      {
        text: 'Doctors get straight to what illness, what procedure… but often this is a small part of a patient’s day to day concern… most patients require a psychological aspect: how do I go through the rest of the day with what I have, how do I get through tomorrow with what I have?',
        attribution: 'Sunny Loo',
      },
    ],
    body: [
      'Eventually the patient leaves the room and the infection goes with them — but so does work, school, dependents, relationships and money. Appointments get pinned all through it.',
      'Somebody near a major hospital manages. Somebody in a smaller community may not have the same access, and every journey carries another cost. Norma once collapsed from going to the hospital so much.',
      'Even the form matters: some intravenous treatments need refrigeration that is not practical for every household. The best treatment on paper is not always the best fit for somebody’s life.',
    ],
  },
  {
    id: 'whole',
    act: 4,
    actLabel: ACTS[4],
    title: 'The whole person',
    words: ['Understanding', 'Support', 'Communication', 'Education', 'Connection', 'Care'],
    scene: 'whole',
    quotes: [
      {
        text: 'We fail to address the whole person.',
        attribution: 'Norma Washburn',
      },
      {
        text: 'When we talk about our experience, we are just asking to be understood, to be supported.',
        attribution: 'Sunny Loo',
      },
    ],
    body: [
      'Everything in this story — the ward, the family, the organism, the courses of treatment, the walls, the distant lights — has been circling one person the whole time.',
      'AMR is not only about whether a drug can kill a bacterium. It is a whole person’s journey through something that puts their social, psychological and spiritual health on a tangent. Better diagnostics and better antibiotics matter. So does somebody stopping long enough to ask.',
    ],
  },
  {
    id: 'breath',
    act: 4,
    actLabel: ACTS[4],
    title: 'And it was never one person',
    words: [],
    scene: 'breath',
    quotes: [
      {
        text: 'When we talk about our experience, we are just asking to be understood, to be supported.',
        attribution: 'Sunny Loo',
      },
    ],
    body: [
      'Every light out there was somebody. Another room, another night, another person told the same thing and left to carry it on their own.',
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*  Translations                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Narrative copy per language, loaded eagerly.
 *
 * Eager because the Home page renders the narrative immediately and both the
 * 3D and flat paths read from it on their first frame — a lazy import here
 * would mean a beat of empty scenes, which is the one place on the site where
 * that would be most visible.
 */
/*
 * Assigned inside a try because this module is also imported by
 * scripts/test-locales.mjs, which runs under plain Node where `import.meta.glob`
 * does not exist.
 *
 * It has to be try/catch rather than a `typeof import.meta.glob` guard: Vite
 * replaces the *call* with a static object at build time and does not define
 * `import.meta.glob` at runtime, so that guard is false in the browser too and
 * silently drops every translation. Which is exactly what it did.
 */
let NARRATIVES: Record<string, { default: NarrativeCopy }> = {}
try {
  NARRATIVES = import.meta.glob<{ default: NarrativeCopy }>('/src/locales/narrative/*.ts', {
    eager: true,
  })
} catch {
  // Not running under Vite; every language falls back to English.
}

function narrativeFor(locale: LocaleCode): NarrativeCopy | undefined {
  return NARRATIVES[`/src/locales/narrative/${locale}.ts`]?.default
}

/** Whether the narrative exists in this language at all. */
export function isNarrativeTranslated(locale: LocaleCode): boolean {
  return locale === DEFAULT_LOCALE || narrativeFor(locale) !== undefined
}

/**
 * The eleven beats in the requested language, falling back to English whole.
 *
 * Falls back as a unit rather than beat by beat: half a story in each of two
 * languages is worse than one story in a language you may not read, and the
 * page says which it gave you either way.
 */
export function getBeats(locale: LocaleCode = DEFAULT_LOCALE): Beat[] {
  const copy = locale === DEFAULT_LOCALE ? undefined : narrativeFor(locale)
  if (!copy) return BEATS

  return BEATS.map((beat) => {
    const translated = copy.beats[beat.id]
    return {
      ...beat,
      actLabel: copy.acts[beat.act],
      title: translated.title,
      words: translated.words,
      body: translated.body,
      quotes: beat.quotes.map((quote, i) => {
        const swap = translated.quotes[i]
        // A quote nobody translated stays in the words it was said in.
        if (!swap) return quote
        return { text: swap.text, attribution: swap.attribution, original: quote.text }
      }),
    }
  })
}

/** Act headings in the requested language. */
export function getActs(locale: LocaleCode = DEFAULT_LOCALE): Record<number, string> {
  return (locale === DEFAULT_LOCALE ? undefined : narrativeFor(locale)?.acts) ?? ACTS
}
