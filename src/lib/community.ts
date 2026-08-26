import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Community data layer.
 *
 * Reads go straight to Postgres with the anon key, which is public by design —
 * row-level security is what protects the data, not the secrecy of that key.
 * Writes never do: they go through edge functions, because the anon role has no
 * insert, update or delete policy at all.
 *
 * If the environment is not configured (no Supabase project yet), everything
 * here reports `configured: false` rather than throwing, so the page renders an
 * honest "not open yet" state instead of a blank screen.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isConfigured = Boolean(url && anonKey)

let client: SupabaseClient | null = null
function db(): SupabaseClient {
  if (!client) client = createClient(url!, anonKey!, { auth: { persistSession: false } })
  return client
}

export const THEMES = [
  { id: 'being_explained_to', label: 'Being explained to' },
  { id: 'isolation', label: 'Isolation' },
  { id: 'treatment_and_life', label: 'Treatment and life' },
  { id: 'cost_and_access', label: 'Cost and access' },
  { id: 'coping_and_support', label: 'Coping and support' },
  { id: 'other', label: 'Everything else' },
] as const

export type ThemeId = (typeof THEMES)[number]['id']

export function themeLabel(id: string): string {
  return THEMES.find((t) => t.id === id)?.label ?? 'Everything else'
}

export interface Comment {
  id: string
  created_at: string
  display_name: string | null
  body: string
  theme: ThemeId
}

/** The five columns the anon role is granted. Asking for more returns an error. */
const PUBLIC_COLUMNS = 'id, created_at, display_name, body, theme'

/**
 * Without a deadline a slow or unreachable backend leaves the reader looking at
 * "Loading…" forever, which is worse than an honest error — they cannot tell
 * whether the section is broken or simply empty.
 */
const READ_TIMEOUT_MS = 10_000

export async function fetchComments(): Promise<Comment[]> {
  const abort = new AbortController()
  const timer = setTimeout(() => abort.abort(), READ_TIMEOUT_MS)
  try {
    const { data, error } = await db()
      .from('comments')
      .select(PUBLIC_COLUMNS)
      .order('created_at', { ascending: false })
      .limit(200)
      .abortSignal(abort.signal)
    if (error) throw new Error(error.message)
    return (data ?? []) as Comment[]
  } finally {
    clearTimeout(timer)
  }
}

/* -------------------------------------------------------------------------- */
/*  Writes — all via edge functions                                            */
/* -------------------------------------------------------------------------- */

const WRITE_TIMEOUT_MS = 15_000

async function invoke<T>(fn: string, payload: unknown): Promise<T> {
  const response = await fetch(`${url}/functions/v1/${fn}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${anonKey}` },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(WRITE_TIMEOUT_MS),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error ?? 'Something went wrong. Please try again.')
  return result as T
}

export interface SubmitResult {
  comment: Comment
  held: boolean
  deleteToken: string
}

export async function submitComment(body: string, displayName: string): Promise<SubmitResult> {
  return invoke<SubmitResult>('submit-comment', { body, displayName })
}

export async function deleteComment(id: string, deleteToken: string): Promise<void> {
  await invoke('delete-comment', { id, deleteToken })
}

export type ReportReason = 'identifying' | 'abusive' | 'distressing' | 'spam' | 'other'

export const REPORT_REASONS: { id: ReportReason; label: string }[] = [
  { id: 'identifying', label: 'It identifies someone' },
  { id: 'abusive', label: 'It is abusive' },
  { id: 'distressing', label: 'I am worried about the person who wrote it' },
  { id: 'spam', label: 'Spam' },
  { id: 'other', label: 'Something else' },
]

export async function reportComment(id: string, reason: ReportReason, detail?: string) {
  return invoke<{ reported: boolean }>('report-comment', { id, reason, detail })
}

/* -------------------------------------------------------------------------- */
/*  Delete tokens                                                              */
/* -------------------------------------------------------------------------- */

/**
 * The only thing that proves someone wrote a comment is a random token their
 * browser kept. It is not an account and not an identity — it does not leave
 * this device, and losing it costs nothing except the ability to press Delete.
 */
const TOKEN_KEY = 'amr.community.mine.v1'

type TokenMap = Record<string, string>

function readTokens(): TokenMap {
  try {
    return JSON.parse(window.localStorage.getItem(TOKEN_KEY) ?? '{}') as TokenMap
  } catch {
    return {}
  }
}

function writeTokens(tokens: TokenMap): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
  } catch {
    /* Private window, or storage blocked — Delete just won't be offered. */
  }
}

export function rememberToken(id: string, token: string): void {
  writeTokens({ ...readTokens(), [id]: token })
}

export function forgetToken(id: string): void {
  const tokens = readTokens()
  delete tokens[id]
  writeTokens(tokens)
}

export function tokenFor(id: string): string | undefined {
  return readTokens()[id]
}
