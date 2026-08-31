/**
 * Shared helpers for the Community edge functions.
 *
 * These functions are the only thing on the internet allowed to write to the
 * comments table — the anon role has no insert, update or delete policy. They
 * run with the service role, which bypasses row-level security, so the service
 * role key must never leave Supabase's function secrets.
 */
import { createClient } from 'npm:@supabase/supabase-js@2'

/**
 * Allowed browser origins.
 *
 * SITE_ORIGIN is a comma-separated list. Values are normalised before use,
 * because a browser's Origin header is a bare scheme://host[:port] — never with
 * a trailing slash and never with a path. Pasting the site URL straight from
 * the address bar gives you "https://example.app/", which does not match, and
 * the only symptom is an unexplained "NetworkError" in the visitor's console.
 * A config value that breaks everything if you add one character is a bad
 * config value, so the code takes the character off rather than asking people
 * to remember.
 */
function normaliseOrigin(value: string): string {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '*') return trimmed
  try {
    return new URL(trimmed).origin
  } catch {
    return trimmed.replace(/\/+$/, '')
  }
}

const ALLOWED_ORIGINS = (Deno.env.get('SITE_ORIGIN') ?? '')
  .split(',')
  .map(normaliseOrigin)
  .filter(Boolean)

/** Echo back the caller's origin when it is allowed; fall back sensibly. */
export function corsFor(req: Request): Record<string, string> {
  const origin = req.headers.get('origin')
  const allow =
    ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes('*')
      ? '*'
      : origin && ALLOWED_ORIGINS.includes(normaliseOrigin(origin))
        ? origin
        : ALLOWED_ORIGINS[0]

  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

/**
 * Builds a JSON responder bound to one request.
 *
 * Every response needs the CORS headers, errors included — a 400 or a 429
 * without them reaches the browser as an unexplained "NetworkError" instead of
 * the message it carries, which is precisely the failure this whole file exists
 * to prevent. Binding once per request removes the chance of forgetting.
 */
export function replyFor(req: Request) {
  const headers = { ...corsFor(req), 'Content-Type': 'application/json' }
  return (body: unknown, status = 200): Response =>
    new Response(JSON.stringify(body), { status, headers })
}

export function preflight(req: Request): Response | null {
  return req.method === 'OPTIONS' ? new Response('ok', { headers: corsFor(req) }) : null
}

/** Service-role client. Bypasses RLS — never expose this key to a browser. */
export function admin() {
  // Supabase renamed service_role to the "secret" key. Deployed functions get it
  // injected automatically under one name or the other; it is never pasted in.
  const secret = (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SECRET_KEY'))!
  return createClient(Deno.env.get('SUPABASE_URL')!, secret, {
    auth: { persistSession: false },
  })
}

/**
 * A non-reversible, daily-rotating fingerprint for one source address.
 *
 * Used only to rate-limit submissions and to tell two reporters apart. The
 * address itself is never stored, and yesterday's hashes cannot be matched to
 * today's, so this cannot accumulate into a record of who visited.
 */
export async function sourceHash(req: Request): Promise<string> {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('cf-connecting-ip') ??
    'unknown'
  const salt = Deno.env.get('FINGERPRINT_SALT') ?? 'unsalted'
  const day = new Date().toISOString().slice(0, 10)
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${ip}|${salt}|${day}`),
  )
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** SHA-256 of an author's delete token, so the token itself is never stored. */
export async function tokenHash(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const LIMITS = {
  bodyMin: 20,
  bodyMax: 4000,
  nameMax: 40,
  perHour: 5,
  perDay: 20,
}

/** Rolling hourly window per source. Returns true when the caller is over. */
export async function isThrottled(db: ReturnType<typeof admin>, hash: string): Promise<boolean> {
  const { data } = await db
    .schema('private')
    .from('submission_throttle')
    .select('count, window_start')
    .eq('ip_hash', hash)
    .maybeSingle()

  const now = Date.now()
  const windowMs = 60 * 60 * 1000

  if (!data) {
    await db.schema('private').from('submission_throttle').insert({ ip_hash: hash })
    return false
  }

  const expired = now - new Date(data.window_start).getTime() > windowMs
  if (expired) {
    await db
      .schema('private')
      .from('submission_throttle')
      .update({ count: 1, window_start: new Date().toISOString() })
      .eq('ip_hash', hash)
    return false
  }

  if (data.count >= LIMITS.perHour) return true

  await db
    .schema('private')
    .from('submission_throttle')
    .update({ count: data.count + 1 })
    .eq('ip_hash', hash)
  return false
}
