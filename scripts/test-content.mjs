/**
 * Content-layer tests.
 *
 * The site's markdown collections are edited through Decap CMS, which
 * serialises front matter with js-yaml. That means the parser in
 * src/lib/frontmatter.ts has to survive whatever js-yaml decides to emit for a
 * value someone types into a CMS form — block scalars, quoted scalars, escapes,
 * folded long lines. This round-trips a set of awkward values through js-yaml
 * and back through the parser, then checks every real content file still has
 * the fields its page expects.
 *
 * Usage: npm run test:content
 */
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import yaml from 'js-yaml'
import { parseFrontmatter, readString } from '../src/lib/frontmatter.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failures = []
const check = (ok, msg) => {
  if (!ok) failures.push(msg)
}

/* -- 1. Round-trip awkward values through js-yaml ------------------------- */

const VALUES = {
  plain: 'Third-year neuroscience',
  colonInside:
    'A sinking feeling is what you feel first: I have had this before and oh no, it is happening again and again',
  shortColon: 'Note: this is short',
  leadingQuote:
    '"superbug" is the word her daughter used, and it stuck for a very long time indeed',
  shortQuote: '"superbug"',
  leadingDash: '- not a list item but a long string that runs past the eighty column fold boundary',
  shortDash: '- dash start',
  hashInside:
    'Ward #4 was where the isolation happened, and it was explained to nobody at all here',
  hash: '#hashtag',
  apostrophe: "it's fine",
  apostropheLong:
    "This project is important to me because I believe empowering young people with knowledge can't be overrated",
  trailingSpaceTrimmed: 'ends with space',
  colonEnd: 'ends with colon:',
  tab: 'has\ttab',
  unicode: '“curly” — em dash … ellipsis',
  backslash: 'a \\ backslash',
  ellipsisQuote:
    'I want others to understand how I feel and stop long enough to allow me to share how I feel instead of going straight into…the treatment',
  multiline: 'First paragraph here.\n\nSecond paragraph here.',
  numericString: '2026',
  yesString: 'yes',
  empty: '',
  url: 'https://example.org/a/very/long/path/that/keeps/going/and/going/past/eighty/columns/here',
}

const doc = `---\n${yaml.dump(VALUES)}---\n\nBody text.\n`
const parsed = parseFrontmatter(doc)

for (const [key, expected] of Object.entries(VALUES)) {
  const actual = readString(parsed.data, key)
  // Block scalars legitimately re-wrap; compare on collapsed whitespace, which
  // is what the rendered page shows anyway.
  const norm = (s) => s.replace(/\s+/g, ' ').trim()
  check(
    norm(actual) === norm(expected),
    `round-trip "${key}": expected ${JSON.stringify(norm(expected))}, got ${JSON.stringify(norm(actual))}`,
  )
}
check(parsed.body === 'Body text.', `body: got ${JSON.stringify(parsed.body)}`)

/* -- 2. Every real content file has what its page reads ------------------- */

const COLLECTIONS = {
  team: ['name'],
  stories: ['name', 'context', 'attribution', 'signatureQuote', 'summary'],
  learn: ['title', 'summary', 'order'],
}

for (const [collection, required] of Object.entries(COLLECTIONS)) {
  const dir = path.join(root, 'src/content', collection)
  let files
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.md'))
  } catch {
    failures.push(`collection ${collection}: directory missing`)
    continue
  }
  check(files.length > 0, `collection ${collection}: no entries`)

  for (const file of files) {
    const { data, body } = parseFrontmatter(readFileSync(path.join(dir, file), 'utf8'))
    for (const field of required) {
      // The team collection deliberately allows blank fields (an entry that
      // hasn't been filled in yet); it just must parse.
      if (collection === 'team') continue
      check(
        readString(data, field) !== '',
        `${collection}/${file}: required field "${field}" is empty`,
      )
    }
    if (collection === 'stories') {
      const attribution = readString(data, 'attribution')
      check(
        ['name', 'anonymous', 'withheld'].includes(attribution),
        `${collection}/${file}: attribution "${attribution}" is not one of name/anonymous/withheld`,
      )
      if (attribution === 'anonymous')
        check(
          readString(data, 'anonymousAs') !== '',
          `${collection}/${file}: anonymous attribution needs anonymousAs`,
        )
    }
    if (collection === 'learn')
      check(
        body.trim().length > 200,
        `${collection}/${file}: body looks empty (${body.length} chars)`,
      )
  }
}

/* -- 3. The CMS config and the code must not drift apart ----------------- */

/**
 * Fields each collection's loader in src/lib/content.ts actually reads. If a
 * field is renamed in code but not in config.yml (or vice versa), editors get a
 * form that silently writes to a key nothing reads. That failure is invisible
 * until someone notices their edit had no effect, so it is asserted here.
 */
const READS = {
  learn: ['title', 'summary', 'order'],
  stories: [
    'name',
    'anonymousAs',
    'attribution',
    'context',
    'signatureQuote',
    'summary',
    'photo',
    'order',
  ],
  team: ['name', 'role', 'quote', 'photo', 'order'],
}

const config = yaml.load(readFileSync(path.join(root, 'public/admin/config.yml'), 'utf8'))
const byName = Object.fromEntries(config.collections.map((c) => [c.name, c]))

for (const [name, fields] of Object.entries(READS)) {
  const collection = byName[name]
  if (!collection) {
    failures.push(`config.yml: no collection "${name}"`)
    continue
  }
  check(
    collection.folder === `src/content/${name}`,
    `config.yml: collection "${name}" points at ${collection.folder}`,
  )
  const declared = new Set(collection.fields.map((f) => f.name))
  for (const field of fields)
    check(declared.has(field), `config.yml: collection "${name}" does not declare field "${field}"`)
  // Team entries are frontmatter-only; the quote is a field, not a body.
  if (name !== 'team')
    check(declared.has('body'), `config.yml: collection "${name}" has no body/markdown field`)
}

// The attribution widget's options must be exactly the states the code handles.
const attribution = byName.stories?.fields.find((f) => f.name === 'attribution')
const optionValues = (attribution?.options ?? []).map((o) => o.value).sort()
check(
  JSON.stringify(optionValues) === JSON.stringify(['anonymous', 'name', 'withheld']),
  `config.yml: attribution options are ${JSON.stringify(optionValues)}, expected anonymous/name/withheld`,
)

check(
  config.media_folder === 'public/uploads' && config.public_folder === '/uploads',
  `config.yml: media paths are ${config.media_folder} -> ${config.public_folder}; ` +
    'photos referenced as /uploads/... will 404 if these change',
)

if (failures.length) {
  console.error(`\n✗ ${failures.length} failure(s):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log('✓ content tests passed')
