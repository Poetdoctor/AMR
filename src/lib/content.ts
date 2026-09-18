import { parseFrontmatter, readString } from './frontmatter.ts'
import { DEFAULT_LOCALE, type LocaleCode } from './locales.ts'

/**
 * Content collections.
 *
 * Every collection here is markdown on disk under `src/content/<name>/<locale>/`,
 * edited through the Decap CMS admin UI rather than by hand. Nothing in this
 * file hardcodes an entry: adding, editing or removing a person or an article
 * is a content change, never a code change.
 *
 * Translations sit beside the English rather than replacing it. A page asks for
 * a locale; if the entry has not been translated yet it gets the English one
 * with `translated: false`, and the page says so (see `UntranslatedNotice`)
 * rather than going blank or silently pretending. That is what lets the team
 * publish an article the day it is written instead of holding it until four
 * translations are ready.
 *
 * The filename is the slug and is shared across languages, so `/learn/foo` and
 * `/fr/learn/foo` are the same article and the language switcher can move
 * between them without a lookup table.
 */

/** Everything a page needs to know about how it got the text it is showing. */
interface Translatable {
  /** False when this entry fell back to English because no translation exists. */
  translated: boolean
}

function fileSlug(path: string): string {
  return path.split('/').pop()!.replace(/\.md$/, '')
}

/** `/src/content/learn/fr/foo.md` → `fr` */
function fileLocale(path: string): string {
  return path.split('/').at(-2)!
}

/**
 * Groups raw files by locale, then slug.
 *
 * A file in a folder we do not recognise as a locale is ignored rather than
 * guessed at — a stray directory should not start publishing itself.
 */
function byLocale(files: Record<string, string>): Map<string, Map<string, string>> {
  const out = new Map<string, Map<string, string>>()
  for (const [path, source] of Object.entries(files)) {
    const locale = fileLocale(path)
    if (!out.has(locale)) out.set(locale, new Map())
    out.get(locale)!.set(fileSlug(path), source)
  }
  return out
}

/* -------------------------------------------------------------------------- */
/*  Team                                                                       */
/* -------------------------------------------------------------------------- */

export interface TeamMember extends Translatable {
  slug: string
  name: string
  role: string
  quote: string
  photo: string
  order: number
  /** True when the entry has enough written content to render a card. */
  complete: boolean
}

const teamFiles = byLocale(
  import.meta.glob('/src/content/team/*/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>,
)

function toTeamMember(slug: string, source: string, translated: boolean): TeamMember {
  const { data, body } = parseFrontmatter(source)
  const name = readString(data, 'name')
  const role = readString(data, 'role')
  // `quote` is the CMS field; the markdown body is accepted as a fallback so an
  // entry written either way still renders.
  const quote = readString(data, 'quote') || body
  const photo = readString(data, 'photo')
  const orderRaw = Number(readString(data, 'order'))

  return {
    slug,
    name,
    role,
    quote,
    photo,
    order: Number.isFinite(orderRaw) && orderRaw > 0 ? orderRaw : 999,
    /**
     * Empty-card rule (docs/content-spec.md → Team):
     * an entry with the fields still blank must never reach the public grid as
     * raw template text. We gate on the *written* content — name, role and
     * quote — and let a missing photo fall back to a designed monogram avatar,
     * so an entry publishes as soon as its words are in, without waiting on a
     * photo upload. Ali's seeded entry has no role or quote and so stays
     * hidden until he fills them in through /admin.
     */
    complete: Boolean(name && role && quote),
    translated,
  }
}

function teamFor(locale: LocaleCode): TeamMember[] {
  const base = teamFiles.get(DEFAULT_LOCALE) ?? new Map()
  const translations = teamFiles.get(locale) ?? new Map()
  return [...base.keys()]
    .map((slug) => {
      const source = translations.get(slug)
      return toTeamMember(slug, source ?? base.get(slug)!, source !== undefined)
    })
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
}

/** Entries ready for the public grid. */
export function getTeam(locale: LocaleCode = DEFAULT_LOCALE): TeamMember[] {
  return teamFor(locale).filter((member) => member.complete)
}

/** Every entry including unfinished ones — for counts and admin-facing views. */
export function getAllTeamEntries(locale: LocaleCode = DEFAULT_LOCALE): TeamMember[] {
  return teamFor(locale)
}

/* -------------------------------------------------------------------------- */
/*  Stories                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * How a story may be attributed publicly.
 *
 * docs/content-spec.md requires confirming that each interviewee consented to
 * public attribution *by name on a website* — not merely to being interviewed —
 * before their story goes live under their real name. That check is a person's
 * job, not a build step, so it is encoded as a field rather than left as a note
 * someone has to remember.
 *
 *   'name'      — consent confirmed; publish under the person's name.
 *   'anonymous' — publish the testimony under `anonymousAs` instead. Default.
 *   'withheld'  — do not publish this story at all.
 */
export type Attribution = 'name' | 'anonymous' | 'withheld'

export interface Story extends Translatable {
  slug: string
  /** The real name. Only ever shown when `attribution` is 'name'. */
  name: string
  /** What to call the person when publishing anonymously. */
  anonymousAs: string
  /** The name actually safe to render, given the attribution setting. */
  displayName: string
  attribution: Attribution
  context: string
  signatureQuote: string
  summary: string
  photo: string
  order: number
  body: string
}

function toAttribution(value: string): Attribution {
  return value === 'name' || value === 'withheld' ? value : 'anonymous'
}

const storyFiles = byLocale(
  import.meta.glob('/src/content/stories/*/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>,
)

/**
 * Consent is a property of the person, not of a language.
 *
 * `name` and `attribution` are always read from the English entry even when a
 * translation is being rendered, and the CMS marks both fields `i18n:
 * duplicate` so they cannot be edited on a translation tab. Both halves matter:
 * without this, a translated file edited by hand — or a stale copy left behind
 * when somebody changed their mind — could publish under a real name a person
 * has since withdrawn, or republish a story withheld everywhere else. A
 * withdrawal has to take effect in every language at once or it is not a
 * withdrawal.
 */
function toStory(slug: string, source: string, consent: string, translated: boolean): Story {
  const { data, body } = parseFrontmatter(source)
  const consentData = parseFrontmatter(consent).data

  const name = readString(consentData, 'name')
  const attribution = toAttribution(readString(consentData, 'attribution'))

  const anonymousAs = readString(data, 'anonymousAs') || 'A patient'
  const orderRaw = Number(readString(data, 'order'))

  return {
    slug,
    name,
    anonymousAs,
    displayName: attribution === 'name' ? name : anonymousAs,
    attribution,
    context: readString(data, 'context'),
    signatureQuote: readString(data, 'signatureQuote'),
    summary: readString(data, 'summary'),
    photo: readString(data, 'photo'),
    order: Number.isFinite(orderRaw) && orderRaw > 0 ? orderRaw : 999,
    body,
    translated,
  }
}

function storiesFor(locale: LocaleCode): Story[] {
  const base = storyFiles.get(DEFAULT_LOCALE) ?? new Map()
  const translations = storyFiles.get(locale) ?? new Map()
  return [...base.keys()]
    .map((slug) => {
      const english = base.get(slug)!
      const source = translations.get(slug)
      return toStory(slug, source ?? english, english, source !== undefined)
    })
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
}

/** Stories cleared for publication, in reading order. */
export function getStories(locale: LocaleCode = DEFAULT_LOCALE): Story[] {
  return storiesFor(locale).filter((story) => story.attribution !== 'withheld')
}

export function getStory(slug: string, locale: LocaleCode = DEFAULT_LOCALE): Story | undefined {
  return getStories(locale).find((story) => story.slug === slug)
}

/* -------------------------------------------------------------------------- */
/*  Learn                                                                      */
/* -------------------------------------------------------------------------- */

export interface Article extends Translatable {
  slug: string
  title: string
  summary: string
  order: number
  body: string
  /** Rough reading time in minutes, from the body's word count. */
  readingMinutes: number
}

const learnFiles = byLocale(
  import.meta.glob('/src/content/learn/*/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>,
)

function toArticle(slug: string, source: string, translated: boolean): Article {
  const { data, body } = parseFrontmatter(source)
  const orderRaw = Number(readString(data, 'order'))
  const words = body.split(/\s+/).filter(Boolean).length

  return {
    slug,
    title: readString(data, 'title'),
    summary: readString(data, 'summary'),
    order: Number.isFinite(orderRaw) && orderRaw > 0 ? orderRaw : 999,
    body,
    readingMinutes: Math.max(1, Math.round(words / 200)),
    translated,
  }
}

function articlesFor(locale: LocaleCode): Article[] {
  const base = learnFiles.get(DEFAULT_LOCALE) ?? new Map()
  const translations = learnFiles.get(locale) ?? new Map()
  return [...base.keys()]
    .map((slug) => {
      const source = translations.get(slug)
      return toArticle(slug, source ?? base.get(slug)!, source !== undefined)
    })
    .filter((article) => article.title !== '')
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

export function getArticles(locale: LocaleCode = DEFAULT_LOCALE): Article[] {
  return articlesFor(locale)
}

export function getArticle(slug: string, locale: LocaleCode = DEFAULT_LOCALE): Article | undefined {
  return articlesFor(locale).find((article) => article.slug === slug)
}
