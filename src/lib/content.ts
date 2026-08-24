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
