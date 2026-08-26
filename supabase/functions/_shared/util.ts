/**
 * Shared helpers for the Community edge functions.
 *
 * These functions are the only thing on the internet allowed to write to the
 * comments table — the anon role has no insert, update or delete policy. They
 * run with the service role, which bypasses row-level security, so the service
 * role key must never leave Supabase's function secrets.
 */
import { createClient } from 'npm:@supabase/supabase-js@2'

export const ALLOWED_ORIGIN = Deno.env.get('SITE_ORIGIN') ?? '*'

export const CORS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  Vary: 'Origin',
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

export function preflight(req: Request): Response | null {
  return req.method === 'OPTIONS' ? new Response('ok', { headers: CORS }) : null
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
