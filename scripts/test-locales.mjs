/**
 * Translation-layer tests.
 *
 * TypeScript already stops a dictionary that is missing a key or has invented
 * one, because each locale is declared `const fr: Dict`. What it cannot see is
 * the failure that actually happens in practice: a key that type-checks because
 * it still holds the English string somebody pasted in and never came back to.
 * That renders perfectly, ships quietly, and is only ever noticed by the person
 * who needed the translation.
 *
 * So this checks meaning rather than shape — every ready locale is complete,
 * nothing is blank, and nothing is still English unless it is a word that is
 * the same in both languages and is listed as such below.
 *
 * Usage: npm run test:locales
 */
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failures = []
const check = (ok, message) => {
  if (!ok) failures.push(message)
}

const { LOCALES, READY_LOCALES, DEFAULT_LOCALE } = await import(
  path.join(root, 'src/lib/locales.ts')
)

/**
 * Strings a translation is allowed to leave identical to English.
 *
 * Every entry is a deliberate decision, not an exemption to reach for: a
 * wordmark, a number, or a word that is genuinely spelled the same. Anything
 * else matching English is an untranslated string.
 */
const SAME_IN_ANY_LANGUAGE = {
  'site.short': 'the wordmark in the header lockup',
  'notFound.eyebrow': 'the number 404',
  'home.eyebrow': 'the team\u2019s own name, and iGEM\u2019s',
  'nav.menu': 'borrowed into French unchanged',
  'pages.learn.sources': 'identical in French',
  'nav.mission': 'identical in French',
  'titles.mission': 'identical in French',
}

/** Flattens to dotted paths so a failure names the exact key. */
function flatten(value, prefix = '') {
  const out = {}
  for (const [key, inner] of Object.entries(value)) {
    const at = prefix ? `${prefix}.${key}` : key
    if (typeof inner === 'string') out[at] = inner
    else Object.assign(out, flatten(inner, at))
  }
  return out
}

const used = new Set()

const english = flatten((await import(path.join(root, 'src/locales/en.ts'))).default)
check(Object.keys(english).length > 0, 'en.ts exported nothing')

// Every ready locale must actually have a dictionary on disk.
const onDisk = new Set(
  readdirSync(path.join(root, 'src/locales'))
    .filter((f) => f.endsWith('.ts'))
    .map((f) => f.replace(/\.ts$/, '')),
)
for (const locale of READY_LOCALES)
  check(
    onDisk.has(locale.code),
    `locale "${locale.code}" is marked ready but src/locales/${locale.code}.ts does not exist`,
  )

// And a locale that is not ready must not be reachable by accident.
for (const locale of LOCALES)
  if (!locale.ready)
    check(
      !READY_LOCALES.some((r) => r.code === locale.code),
      `locale "${locale.code}" is not ready but appears in READY_LOCALES`,
    )

for (const locale of READY_LOCALES) {
  if (locale.code === DEFAULT_LOCALE) continue
  if (!onDisk.has(locale.code)) continue

  const dict = flatten((await import(path.join(root, `src/locales/${locale.code}.ts`))).default)

  for (const key of Object.keys(english)) {
    const value = dict[key]
    check(value !== undefined, `${locale.code}: missing "${key}"`)
    if (value === undefined) continue
    check(value.trim() !== '', `${locale.code}: "${key}" is empty`)
    if (value === english[key] && !(key in SAME_IN_ANY_LANGUAGE))
      failures.push(
        `${locale.code}: "${key}" is still the English string (${JSON.stringify(value)}). ` +
          'Translate it, or add it to SAME_IN_ANY_LANGUAGE with a reason.',
      )
  }

  for (const key of Object.keys(dict))
    check(key in english, `${locale.code}: "${key}" is not a key in en.ts`)

  for (const key of Object.keys(SAME_IN_ANY_LANGUAGE))
    if (dict[key] !== undefined && dict[key] !== english[key])
      used.add(`${key} differs in ${locale.code}`)
}

/*
 * An exemption that is no longer needed is an exemption that will one day
 * cover a genuinely untranslated string. Once every ready locale translates a
 * key, it should come off the list.
 */
for (const key of Object.keys(SAME_IN_ANY_LANGUAGE)) {
  const translated = READY_LOCALES.filter((l) => l.code !== DEFAULT_LOCALE).every((l) =>
    used.has(`${key} differs in ${l.code}`),
  )
  check(
    !translated || READY_LOCALES.length < 2,
    `SAME_IN_ANY_LANGUAGE lists "${key}", but every language now translates it — remove the exemption`,
  )
}

// The disclaimer is the one string that must never be missing in any language:
// a reader who cannot read it is a reader who was not told.
for (const locale of READY_LOCALES) {
  if (locale.code === DEFAULT_LOCALE || !onDisk.has(locale.code)) continue
  const dict = flatten((await import(path.join(root, `src/locales/${locale.code}.ts`))).default)
  for (const key of ['disclaimer.lead', 'disclaimer.body'])
    check(
      (dict[key] ?? '').trim().length > 20,
      `${locale.code}: "${key}" is missing or too short — the medical disclaimer must be readable in every language the site offers`,
    )
}

/* -------------------------------------------------------------------------- */
/*  Narrative and question bank                                                */
/* -------------------------------------------------------------------------- */

/*
 * These two are not part of the interface catalogue and so are not covered by
 * its type: the narrative is keyed by beat, the question bank by question id.
 * Both fall back to English silently and correctly at runtime, which is the
 * right behaviour and also the reason a half-finished translation of either
 * would never announce itself.
 */
const { BEATS } = await import(path.join(root, 'src/lib/beats.ts'))
const { QUESTION_GROUPS } = await import(path.join(root, 'src/lib/visitPrep.ts'))

for (const locale of READY_LOCALES) {
  if (locale.code === DEFAULT_LOCALE) continue

  const narrativePath = path.join(root, `src/locales/narrative/${locale.code}.ts`)
  let narrative
  try {
    narrative = (await import(narrativePath)).default
  } catch {
    failures.push(
      `${locale.code}: no narrative translation (src/locales/narrative/${locale.code}.ts) — ` +
        'the Home page will silently render the English story',
    )
  }

  if (narrative) {
    for (const beat of BEATS) {
      const copy = narrative.beats[beat.id]
      if (!copy) {
        failures.push(`${locale.code} narrative: beat "${beat.id}" is missing`)
        continue
      }
      check(copy.title?.trim(), `${locale.code} narrative: beat "${beat.id}" has no title`)
      check(
        copy.words.length === beat.words.length,
        `${locale.code} narrative: beat "${beat.id}" has ${copy.words.length} words, English has ${beat.words.length}`,
      )
      check(
        copy.body.length === beat.body.length,
        `${locale.code} narrative: beat "${beat.id}" has ${copy.body.length} paragraphs, English has ${beat.body.length}`,
      )
      /*
       * Quotes are matched to their English original by position, so a missing
       * one does not shift the others — it just loses the original that the
       * page promises to keep reachable.
       */
      check(
        copy.quotes.length === beat.quotes.length,
        `${locale.code} narrative: beat "${beat.id}" has ${copy.quotes.length} quotes, English has ${beat.quotes.length} — ` +
          'quotes are paired with their originals by position',
      )
    }
    for (const act of [1, 2, 3, 4])
      check(narrative.acts[act]?.trim(), `${locale.code} narrative: act ${act} has no heading`)
  }

  const questionsPath = path.join(root, `src/locales/questions/${locale.code}.ts`)
  let questions
  try {
    questions = (await import(questionsPath)).default
  } catch {
    failures.push(
      `${locale.code}: no question bank (src/locales/questions/${locale.code}.ts) — ` +
        'the visit-prep sheet somebody prints and carries would be in English',
    )
  }

  if (questions)
    for (const group of QUESTION_GROUPS) {
      const copy = questions[group.id]
      if (!copy) {
        failures.push(`${locale.code} questions: group "${group.id}" is missing`)
        continue
      }
      check(copy.label?.trim(), `${locale.code} questions: group "${group.id}" has no label`)
      check(copy.note?.trim(), `${locale.code} questions: group "${group.id}" has no note`)
      for (const question of group.questions)
        check(
          copy.questions[question.id]?.trim(),
          `${locale.code} questions: "${group.id}/${question.id}" is missing — ` +
            'it would print in English on a sheet that is otherwise translated',
        )
      for (const id of Object.keys(copy.questions))
        check(
          group.questions.some((q) => q.id === id),
          `${locale.code} questions: "${group.id}/${id}" is not a question in the English bank`,
        )
    }
}

if (failures.length) {
  console.error(`\n✗ ${failures.length} failure(s):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log(
  `✓ locale tests passed — ${READY_LOCALES.length} language(s): ${READY_LOCALES.map((l) => l.code).join(', ')}`,
)
