/**
 * Builds the fonts the 3D narrative draws its words with.
 *
 * The scroll narrative renders text with troika, which ships a Latin-only face
 * and draws *nothing at all* for a character it does not have — no error, no
 * fallback box, just absence. So every non-Latin language needs its own font
 * file passed in explicitly.
 *
 * Shipping a real one is out of the question: Noto Sans SC is 1.5 MB, and that
 * is before Arabic and anything else. But the 3D scenes only ever draw the beat
 * words — around forty short fragments per language, on the order of a hundred
 * distinct characters. Subset to exactly those and a language costs tens of
 * kilobytes.
 *
 * The glyph set therefore comes from `beats.ts` and the narrative translations
 * themselves rather than a hand-kept list, so a reworded fragment cannot
 * silently lose its characters. Run it and commit the result: this is a build
 * input, not a build step, so the site can be built without a font toolchain.
 *
 * Usage: npm run build:fonts
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import subsetFont from 'subset-font'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = path.join(root, 'public/fonts')

/** Where each script's complete source face comes from. */
const SOURCES = {
  zh: '@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff',
  fa: '@fontsource/noto-sans-arabic/files/noto-sans-arabic-arabic-400-normal.woff',
}

const { LOCALES, DEFAULT_LOCALE } = await import(path.join(root, 'src/lib/locales.ts'))
const { BEATS } = await import(path.join(root, 'src/lib/beats.ts'))

mkdirSync(out, { recursive: true })

for (const locale of LOCALES) {
  if (!locale.narrativeFont) continue

  const source = SOURCES[locale.code]
  if (!source) {
    console.error(`  ${locale.code}: no source font listed in SOURCES — skipped`)
    process.exitCode = 1
    continue
  }

  const copy = (await import(path.join(root, `src/locales/narrative/${locale.code}.ts`))).default
  const words = BEATS.flatMap((beat) => copy.beats[beat.id]?.words ?? [])

  /*
   * Latin digits and punctuation come along because a fragment may contain
   * them, and the Western question mark and quotes turn up in every script's
   * copy at some point. A few dozen extra glyphs is nothing next to a face.
   */
  const characters = new Set([...words.join(''), ...' 0123456789.,:;!?·—–-“”‘’()'])
  const text = [...characters].join('')

  const buffer = readFileSync(path.join(root, 'node_modules', source))
  // troika reads .woff, .ttf and .otf, and rejects .woff2 outright.
  const subset = await subsetFont(buffer, text, { targetFormat: 'woff' })

  const file = path.join(root, locale.narrativeFont.replace(/^\//, 'public/'))
  writeFileSync(file, subset)

  const kb = (n) => `${(n / 1024).toFixed(1)} KB`
  console.log(
    `  ${locale.code}: ${characters.size} glyphs from ${words.length} fragments — ` +
      `${kb(buffer.length)} → ${kb(subset.length)}`,
  )
}

if (!LOCALES.some((l) => l.narrativeFont))
  console.log('  nothing to build: no locale declares a narrativeFont')

console.log(
  `✓ narrative fonts written to public/fonts (default locale ${DEFAULT_LOCALE} uses troika's own face)`,
)
