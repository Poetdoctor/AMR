/**
 * The visit-prep worksheet.
 *
 * Hard constraint (CLAUDE.md): this is 100% client-side. Nothing typed into it
 * is ever sent to a server or logged anywhere. That is not merely a policy —
 * there is no network code in this feature at all: no fetch, no form action, no
 * analytics, no third-party script anywhere on the site. Export happens through
 * the browser's own print dialog, an in-memory Blob download, and the clipboard.
 *
 * Saving to the browser is opt-in and off by default; see `storage.ts`.
 */

export interface VisitPrep {
  appointmentWith: string
  appointmentWhen: string
  diagnosis: string
  medications: string
  whatsBeenHappening: string
  /** Ids from QUESTION_GROUPS below. */
  selectedQuestions: string[]
  /** Questions the person wrote themselves. */
  customQuestions: string[]
  howItsAffectingMe: string
  wantToLeaveWith: string
}

export const EMPTY_PREP: VisitPrep = {
  appointmentWith: '',
  appointmentWhen: '',
  diagnosis: '',
  medications: '',
  whatsBeenHappening: '',
  selectedQuestions: [],
  customQuestions: [],
  howItsAffectingMe: '',
  wantToLeaveWith: '',
}

export interface QuestionGroup {
  id: string
  label: string
  /** Why these questions are here, shown to the reader. */
  note: string
  questions: { id: string; text: string }[]
}

/**
 * The question bank.
 *
 * Every question here traces back to something a patient or clinician told the
 * team in the interviews behind docs/doc-a-* and docs/doc-b-*: the things people
 * said they wished they had asked, and the things clinicians said they wished
 * they were asked. It is a starting point, not a script — people add their own.
 */
export const QUESTION_GROUPS: QuestionGroup[] = [
  {
    id: 'infection',
    label: 'About the infection',
    note: 'The most common thing patients told us is that nobody explained the diagnosis.',
    questions: [
      { id: 'organism', text: 'What exactly is the organism, and what is it resistant to?' },
      { id: 'same-again', text: 'Is this the same infection coming back, or a new one?' },
      {
        id: 'what-rules-out',
        text: 'What does resistant mean in my case — which treatments does it actually rule out?',
      },
      { id: 'how-caught', text: 'Do we know how I picked this up, and does that change anything?' },
    ],
  },
  {
    id: 'treatment',
    label: 'About the treatment',
    note: 'One patient asked specifically to be let in on the reasoning, not just handed the result.',
    questions: [
      { id: 'why-this', text: 'Why this treatment rather than the alternatives you considered?' },
      {
        id: 'side-effects',
        text: 'What side effects should I expect, and which ones mean I should call someone?',
      },
      { id: 'how-long', text: 'How long is this course, and how will we know whether it worked?' },
      { id: 'oral-or-iv', text: 'Is there an oral option, or does it have to be intravenous?' },
      { id: 'if-not-working', text: 'What happens if this one does not work?' },
    ],
  },
  {
    id: 'precautions',
    label: 'About precautions and testing',
    note: 'Clinicians told us precautions are often started without explanation, and reassessed late.',
    questions: [
      {
        id: 'why-precautions',
        text: 'Why am I on these precautions, and what would have to change for them to stop?',
      },
      { id: 'retest', text: 'When will I next be re-tested to see whether I still need them?' },
      { id: 'what-test', text: 'What will this test involve, and when will I hear the result?' },
      {
        id: 'explain-to-family',
        text: 'How would you explain these precautions to my family, in words I can repeat?',
      },
    ],
  },
  {
    id: 'life',
    label: 'About fitting this into my life',
    note: 'The best treatment on paper is not always the one that fits the life around it.',
    questions: [
      { id: 'how-many', text: 'How many more appointments is this likely to be?' },
      { id: 'closer', text: 'Is there anywhere closer to home I could have this done?' },
      { id: 'cost', text: 'What will this cost me, including anything not covered?' },
      { id: 'work-school', text: 'What should I tell work or school, and what am I able to do?' },
    ],
  },
  {
    id: 'coping',
    label: 'About how I am coping',
    note: 'This is the part appointments skip most often, and the part patients most wanted raised.',
    questions: [
      {
        id: 'whole-person',
        text: 'Can we talk about how I am actually doing, not only how the infection looks?',
      },
      {
        id: 'mental-support',
        text: 'Is there support for the mental side of this, and would it cost me anything?',
      },
      {
        id: 'family-safe',
        text: 'Is it safe for me to be close to my family and the people I live with?',
      },
      { id: 'others', text: 'Is there anyone else going through this who I could talk to?' },
    ],
  },
]

const ALL_QUESTIONS = new Map(
  QUESTION_GROUPS.flatMap((group) => group.questions.map((q) => [q.id, { ...q, group }])),
)

export function questionText(id: string): string {
  return ALL_QUESTIONS.get(id)?.text ?? ''
}

/** True when there is nothing worth exporting yet. */
export function isEmpty(prep: VisitPrep): boolean {
  return (
    Object.entries(prep).every(([, value]) =>
      Array.isArray(value) ? value.length === 0 : value.trim() === '',
    ) === true
  )
}

function section(title: string, body: string): string {
  return body.trim() ? `${title}\n${'-'.repeat(title.length)}\n${body.trim()}\n\n` : ''
}

/**
 * Render the worksheet as plain text, for the clipboard or a downloaded file.
 * Plain text on purpose: it opens anywhere, it prints legibly, and it does not
 * carry any metadata about where it came from.
 */
export function toPlainText(prep: VisitPrep, today = new Date()): string {
  const date = today.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  let out = `VISIT PREPARATION\nPrepared ${date}\n\n`

  const facts = [
    prep.appointmentWith && `Appointment with: ${prep.appointmentWith}`,
    prep.appointmentWhen && `When: ${prep.appointmentWhen}`,
    prep.diagnosis && `What I have been told I have: ${prep.diagnosis}`,
    prep.medications && `What I am taking: ${prep.medications}`,
  ]
    .filter(Boolean)
    .join('\n')
  out += section('THE BASICS', facts)

  out += section("WHAT'S BEEN HAPPENING", prep.whatsBeenHappening)

  const chosen = QUESTION_GROUPS.map((group) => {
    const picked = group.questions.filter((q) => prep.selectedQuestions.includes(q.id))
    if (picked.length === 0) return ''
    return `${group.label}\n${picked.map((q) => `  [ ] ${q.text}`).join('\n')}`
  }).filter(Boolean)

  const custom = prep.customQuestions.filter((q) => q.trim())
  if (custom.length > 0)
    chosen.push(`My own questions\n${custom.map((q) => `  [ ] ${q}`).join('\n')}`)

  out += section('QUESTIONS I WANT TO ASK', chosen.join('\n\n'))
  out += section('HOW THIS IS ACTUALLY AFFECTING ME', prep.howItsAffectingMe)
  out += section('WHAT I WANT TO LEAVE WITH', prep.wantToLeaveWith)

  out +=
    '---\nEducational, not medical advice. This worksheet is for your own use and does\n' +
    'not replace consultation with a healthcare provider.\n'

  return out
}
