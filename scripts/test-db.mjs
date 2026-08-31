/**
 * Applies the Community migration to a throwaway Postgres and runs the
 * access-control assertions against it.
 *
 * Community publishes comments without a human reading them first, which makes
 * the database rules the safeguard rather than a backstop. So they are tested
 * on every push, not trusted. The assertions in supabase/tests/01_access.sql
 * have been negative-tested: widening the RLS policy or granting anon one extra
 * column both make this fail with a specific message.
 *
 * Locally it starts a container (needs Docker running).
 * In CI, set DATABASE_URL and it uses psql against that instead.
 *
 *   npm run test:db
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FILES = [
  'supabase/tests/00_roles.sql',
  'supabase/migrations/0001_community.sql',
  'supabase/migrations/0002_screen_error.sql',
  'supabase/migrations/0003_communities.sql',
  'supabase/tests/02_communities.sql',
]

const CONTAINER = 'amr-pg-test'
const url = process.env.DATABASE_URL

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: 'pipe', ...opts })
}

function psqlViaUrl(file) {
  return run('psql', [url, '-v', 'ON_ERROR_STOP=1', '-qtA', '-f', path.join(root, file)])
}

function psqlViaDocker(file) {
  run('docker', ['cp', path.join(root, file), `${CONTAINER}:/tmp/x.sql`])
  return run('docker', [
    'exec',
    CONTAINER,
    'psql',
    '-U',
    'postgres',
    '-d',
    'amr',
    '-v',
    'ON_ERROR_STOP=1',
    '-qtA',
    '-f',
    '/tmp/x.sql',
  ])
}

let apply = psqlViaUrl
let started = false

if (!url) {
  try {
    run('docker', ['info'])
  } catch {
    console.error(
      '✗ Needs a database.\n' +
        '  Start Docker Desktop and re-run, or set DATABASE_URL to a scratch Postgres.',
    )
    process.exit(1)
  }
  try {
    run('docker', ['rm', '-f', CONTAINER])
  } catch {
    /* not running */
  }
  run('docker', [
    'run',
    '-d',
    '--rm',
    '--name',
    CONTAINER,
    '-e',
    'POSTGRES_PASSWORD=test',
    '-e',
    'POSTGRES_DB=amr',
    'postgres:16-alpine',
  ])
  started = true
  // pg_isready reports success against the temporary server the postgres image
  // runs during initialisation, which then shuts down and restarts. Poll with a
  // real query instead, and require it to hold twice so the restart can't be
  // mistaken for readiness.
  const deadline = Date.now() + 90_000
  let consecutive = 0
  while (consecutive < 2) {
    try {
      run('docker', ['exec', CONTAINER, 'psql', '-U', 'postgres', '-d', 'amr', '-c', 'select 1'])
      consecutive++
    } catch {
      consecutive = 0
      if (Date.now() > deadline) {
        console.error('✗ Postgres did not become ready in 90s')
        process.exit(1)
      }
    }
  }
  apply = psqlViaDocker
}

let failed = false
try {
  for (const file of FILES) {
    const out = apply(file)
    if (file.includes('tests/0')) {
      for (const line of out.split('\n')) {
        const t = line.trim()
        if (t && !/^\(|^-+$|^$/.test(t)) console.log(t.startsWith('ok') ? `  ${t}` : t)
      }
    }
  }
  console.log('\n✓ database access tests passed')
} catch (error) {
  failed = true
  const detail = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim()
  console.error(`\n✗ database access tests FAILED\n\n${detail || error.message}`)
} finally {
  if (started) {
    try {
      run('docker', ['rm', '-f', CONTAINER])
    } catch {
      /* already gone */
    }
  }
}

process.exit(failed ? 1 : 0)
