/**
 * Verifies the deployed Supabase project from outside, using only the
 * publishable key — exactly what an attacker has, since that key ships in the
 * browser bundle.
 *
 * scripts/test-db.mjs proves the migration is correct against a local Postgres.
 * This proves the migration was actually applied to the real project and that
 * PostgREST enforces it. Run it after applying the migration, and again after
 * any change to the schema.
 *
 *   npm run verify:live
 *
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY from .env.local.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv() {
  const env = { ...process.env }
  try {
    for (const line of readFileSync(path.join(root, '.env.local'), 'utf8').split('\n')) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line)
      if (match) env[match[1]] ??= match[2].trim()
    }
  } catch {
    /* no .env.local — fall back to the real environment */
  }
  return env
}

const env = loadEnv()
const URL_ = env.VITE_SUPABASE_URL
const KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY

if (!URL_ || !KEY) {
  console.error('✗ Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local')
  process.exit(1)
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
const failures = []

async function call(method, pathname, body, extra = {}) {
  const response = await fetch(`${URL_}/rest/v1/${pathname}`, {
    method,
    headers: { ...headers, ...extra },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await response.text()
  return { status: response.status, text }
}

/** The request must be refused. A 2xx here is a security failure. */
async function mustFail(label, method, pathname, body, extra) {
  const { status, text } = await call(method, pathname, body, extra)
  if (status >= 200 && status < 300) {
    failures.push(`${label} — SUCCEEDED with ${status}. It must not. Body: ${text.slice(0, 160)}`)
  } else {
    console.log(`  ok   ${label}  (${status})`)
  }
}

async function mustSucceed(label, method, pathname) {
  const { status, text } = await call(method, pathname)
  if (status < 200 || status >= 300) {
    failures.push(`${label} — failed with ${status}: ${text.slice(0, 160)}`)
  } else {
    console.log(`  ok   ${label}  (${status})`)
  }
}

console.log(`Checking ${URL_} with the publishable key only\n`)

console.log('the public read path works')
await mustSucceed(
  'can read the five public columns',
  'GET',
  'comments?select=id,created_at,display_name,body,theme&limit=1',
)

console.log('\nthe public cannot reach anything else')
await mustFail('cannot read status', 'GET', 'comments?select=status&limit=1')
await mustFail('cannot read ai_flags', 'GET', 'comments?select=ai_flags&limit=1')
await mustFail('cannot read moderator_note', 'GET', 'comments?select=moderator_note&limit=1')
await mustFail('cannot read delete_token_hash', 'GET', 'comments?select=delete_token_hash&limit=1')
await mustFail('cannot read report_count', 'GET', 'comments?select=report_count&limit=1')
await mustFail('cannot select every column', 'GET', 'comments?select=*&limit=1')

await mustFail('cannot insert a comment', 'POST', 'comments', {
  body: 'Attempting to post directly, bypassing the edge function entirely.',
})
await mustFail(
  'cannot edit a comment',
  'PATCH',
  'comments?id=neq.00000000-0000-0000-0000-000000000000',
  { body: 'defaced' },
)
await mustFail(
  'cannot delete a comment',
  'DELETE',
  'comments?id=neq.00000000-0000-0000-0000-000000000000',
)

await mustFail('cannot read reports', 'GET', 'reports?select=*&limit=1')
await mustFail('cannot file a report directly', 'POST', 'reports', {
  comment_id: '00000000-0000-0000-0000-000000000000',
  reason: 'spam',
})

await mustFail('cannot read the kill switch', 'GET', 'community_settings?select=*')
await mustFail('cannot flip the kill switch', 'PATCH', 'community_settings?id=eq.true', {
  auto_publish: false,
})

await mustFail(
  'cannot reach the private schema',
  'GET',
  'submission_throttle?select=*',
  undefined,
  { 'Accept-Profile': 'private' },
)
await mustFail('cannot reach the sweep queue', 'GET', 'sweep_queue?select=*', undefined, {
  'Accept-Profile': 'private',
})

if (failures.length) {
  console.error(`\n✗ ${failures.length} problem(s):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log('\n✓ the live project enforces every rule')
