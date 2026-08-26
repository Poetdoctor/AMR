/**
 * Author self-deletion.
 *
 * The regret usually arrives about ninety seconds after posting, when someone
 * rereads what they wrote and realises they named their hospital. This is the
 * fastest safeguard in a post-moderation design — faster than any sweep can be —
 * so it deletes outright rather than hiding. They asked for it gone; keeping a
 * copy would make the button a lie.
 *
 * Proof of authorship is the token in their browser. No account, no email.
 */
import { admin, json, preflight, tokenHash } from '../_shared/util.ts'

Deno.serve(async (req) => {
  const pre = preflight(req)
  if (pre) return pre
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let payload: { id?: string; deleteToken?: string }
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Could not read that request.' }, 400)
  }

  const { id, deleteToken } = payload
  if (!id || !deleteToken) return json({ error: 'Missing id or token.' }, 400)

  const db = admin()
  const { data, error } = await db
    .from('comments')
    .select('id, delete_token_hash')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return json({ error: 'That comment no longer exists.' }, 404)

  if (data.delete_token_hash !== (await tokenHash(deleteToken)))
    // Deliberately the same message as a missing row: a wrong token must not
    // reveal that the comment exists.
    return json({ error: 'That comment no longer exists.' }, 404)

  const { error: deleteError } = await db.from('comments').delete().eq('id', id)
  if (deleteError) {
    console.error('delete failed', deleteError)
    return json({ error: 'Something went wrong removing that. Please try again.' }, 500)
  }

  return json({ deleted: true })
})
