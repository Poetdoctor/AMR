/**
 * Accepts a comment.
 *
 * Publishes immediately (or holds it, if the kill switch is off — the database
 * trigger decides, not this function). Screening runs afterwards in the
 * background so the visitor is not kept waiting on an API call, and so a
 * screening failure cannot fail a submission.
 */
import {
  admin,
  isThrottled,
  LIMITS,
  preflight,
  replyFor,
  sourceHash,
  tokenHash,
} from '../_shared/util.ts'
import { screenComment } from '../_shared/screen.ts'

Deno.serve(async (req) => {
  const pre = preflight(req)
  if (pre) return pre
  const reply = replyFor(req)
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405)

  let payload: { body?: string; displayName?: string }
  try {
    payload = await req.json()
  } catch {
    return reply({ error: 'Could not read that submission.' }, 400)
  }

  const body = (payload.body ?? '').trim()
  const displayName = (payload.displayName ?? '').trim().slice(0, LIMITS.nameMax) || null

  if (body.length < LIMITS.bodyMin)
    return reply({ error: `Please write at least ${LIMITS.bodyMin} characters.` }, 400)
  if (body.length > LIMITS.bodyMax)
    return reply({ error: `Please keep it under ${LIMITS.bodyMax} characters.` }, 400)

  const db = admin()
  const hash = await sourceHash(req)

  if (await isThrottled(db, hash))
    return reply({ error: "You've posted a few times just now. Please try again in an hour." }, 429)

  // The author keeps this; we keep only its hash. It is what lets someone
  // delete their own comment with no account.
  const deleteToken = crypto.randomUUID()

  const { data, error } = await db
    .from('comments')
    .insert({ body, display_name: displayName, delete_token_hash: await tokenHash(deleteToken) })
    .select('id, created_at, display_name, body, theme, status')
    .single()

  if (error) {
    console.error('insert failed', error)
    return reply({ error: 'Something went wrong saving that. Please try again.' }, 500)
  }

  // Fire-and-forget: the response goes out now, screening lands seconds later.
  const background = screenComment(db, data.id, body)
  // deno-lint-ignore no-explicit-any
  const runtime = (globalThis as any).EdgeRuntime
  if (runtime?.waitUntil) runtime.waitUntil(background)

  return reply({
    comment: {
      id: data.id,
      created_at: data.created_at,
      display_name: data.display_name,
      body: data.body,
      theme: data.theme,
    },
    // 'held' means the kill switch is on and a moderator must approve it.
    held: data.status === 'held',
    deleteToken,
  })
})
