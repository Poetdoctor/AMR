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
  'nav.menu': 'borrowed into French unchanged',
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

if (failures.length) {
  console.error(`\n✗ ${failures.length} failure(s):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log(
  `✓ locale tests passed — ${READY_LOCALES.length} language(s): ${READY_LOCALES.map((l) => l.code).join(', ')}`,
)
