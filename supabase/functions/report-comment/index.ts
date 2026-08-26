/**
 * Reporting.
 *
 * Between daily sweeps there is no human watching, so this is the only rapid
 * defence. What a report does is decided by the database trigger, not here:
 * a comment the screening pass already flagged is hidden on the first report,
 * a clean one needs two distinct sources. That resists a single person erasing
 * testimony they dislike while still acting fast on genuine harm.
 *
 * The report row records nothing about who sent it. Telling two reporters apart
 * needs some key, so a daily-rotating hash goes in the private schema — which
 * PostgREST does not expose — and is purged after a week.
 */
import { admin, json, preflight, sourceHash } from '../_shared/util.ts'

const REASONS = ['identifying', 'abusive', 'distressing', 'spam', 'other']

Deno.serve(async (req) => {
  const pre = preflight(req)
  if (pre) return pre
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let payload: { id?: string; reason?: string; detail?: string }
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Could not read that report.' }, 400)
  }

  const { id, reason } = payload
  const detail = (payload.detail ?? '').trim().slice(0, 500) || null

  if (!id) return json({ error: 'Missing comment id.' }, 400)
  if (!reason || !REASONS.includes(reason)) return json({ error: 'Unknown reason.' }, 400)

  const db = admin()
  const hash = await sourceHash(req)

  // Record the fingerprint first — the trigger counts distinct fingerprints to
  // decide whether this is the second independent report. A duplicate from the
  // same source is ignored, so nobody can hide a comment by reporting twice.
  const { error: fingerprintError } = await db
    .schema('private')
    .from('report_fingerprints')
    .insert({ comment_id: id, ip_hash: hash })

  if (fingerprintError && fingerprintError.code === '23505')
    return json({ reported: true, note: 'already reported' })

  const { error } = await db.from('reports').insert({ comment_id: id, reason, detail })
  if (error) {
    console.error('report failed', error)
    return json({ error: 'Something went wrong sending that. Please try again.' }, 500)
  }

  return json({ reported: true })
})
