import { parseFrontmatter, readString } from './frontmatter'

/**
 * Content collections.
 *
 * Every collection here is markdown on disk under `src/content/`, edited
 * through the Decap CMS admin UI rather than by hand. Nothing in this file
 * hardcodes an entry: adding, editing or removing a person or an article is a
 * content change, never a code change.
 */

export interface TeamMember {
  slug: string
  name: string
  role: string
  quote: string
  photo: string
  order: number
  /** True when the entry has enough written content to render a card. */
  complete: boolean
}

function fileSlug(path: string): string {
  return path.split('/').pop()!.replace(/\.md$/, '')
}

const teamFiles = import.meta.glob('/src/content/team/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function toTeamMember(path: string, source: string): TeamMember {
  const { data, body } = parseFrontmatter(source)
  const name = readString(data, 'name')
  const role = readString(data, 'role')
  // `quote` is the CMS field; the markdown body is accepted as a fallback so an
  // entry written either way still renders.
  const quote = readString(data, 'quote') || body
  const photo = readString(data, 'photo')
  const orderRaw = Number(readString(data, 'order'))

  return {
    slug: fileSlug(path),
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
  }
}

const allTeam: TeamMember[] = Object.entries(teamFiles)
  .map(([path, source]) => toTeamMember(path, source))
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))

/** Entries ready for the public grid. */
export function getTeam(): TeamMember[] {
  return allTeam.filter((member) => member.complete)
}

/** Every entry including unfinished ones — for counts and admin-facing views. */
export function getAllTeamEntries(): TeamMember[] {
  return allTeam
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

export interface Story {
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

const storyFiles = import.meta.glob('/src/content/stories/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function toStory(path: string, source: string): Story {
  const { data, body } = parseFrontmatter(source)
  const name = readString(data, 'name')
  const anonymousAs = readString(data, 'anonymousAs') || 'A patient'
  const attribution = toAttribution(readString(data, 'attribution'))
  const orderRaw = Number(readString(data, 'order'))

  return {
    slug: fileSlug(path),
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
  }
}

const allStories: Story[] = Object.entries(storyFiles)
  .map(([path, source]) => toStory(path, source))
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))

/** Stories cleared for publication, in reading order. */
export function getStories(): Story[] {
  return allStories.filter((story) => story.attribution !== 'withheld')
}

export function getStory(slug: string): Story | undefined {
  return getStories().find((story) => story.slug === slug)
}

/* -------------------------------------------------------------------------- */
/*  Learn                                                                      */
/* -------------------------------------------------------------------------- */

export interface Article {
  slug: string
  title: string
  summary: string
  order: number
  body: string
  /** Rough reading time in minutes, from the body's word count. */
  readingMinutes: number
}

const learnFiles = import.meta.glob('/src/content/learn/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function toArticle(path: string, source: string): Article {
  const { data, body } = parseFrontmatter(source)
  const orderRaw = Number(readString(data, 'order'))
  const words = body.split(/\s+/).filter(Boolean).length

  return {
    slug: fileSlug(path),
    title: readString(data, 'title'),
    summary: readString(data, 'summary'),
    order: Number.isFinite(orderRaw) && orderRaw > 0 ? orderRaw : 999,
    body,
    readingMinutes: Math.max(1, Math.round(words / 200)),
  }
}

const allArticles: Article[] = Object.entries(learnFiles)
  .map(([path, source]) => toArticle(path, source))
  .filter((article) => article.title !== '')
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

export function getArticles(): Article[] {
  return allArticles
}

export function getArticle(slug: string): Article | undefined {
  return allArticles.find((article) => article.slug === slug)
}

/**
 * Academic sources cited at the foot of the Learn landing page, from the works
 * cited of the team's own narrative document.
 */
export const LEARN_SOURCES = [
  {
    citation:
      'Crago, A.-L., Alexandre, S., Abdesselam, K., Gravel Tropper, D., Hartmann, M., Smith, G., & Lary, T. (2022). Understanding Canadians’ knowledge, attitudes and practices related to antimicrobial resistance and antibiotic use: Results from public opinion research. Canada Communicable Disease Report, 48(11/12).',
    href: 'https://doi.org/10.14745/ccdr.v48i1112a08',
  },
  {
    citation:
      'Mellinghoff, S. C., Grossi, A. A., Recanatini, C., Breull-Wierschem, L., Salm, F., Gadebusch-Bondio, M., & Jung, N. (2026). The human cost of resistance: ethical implications of coping with isolation for multidrug resistant organisms. Clinical Microbiology and Infection, 32(8), 1244–1249.',
    href: 'https://doi.org/10.1016/j.cmi.2026.05.043',
  },
] as const
