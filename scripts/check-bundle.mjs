/**
 * Fails the build if a credential that must never ship reaches the bundle.
 *
 * Vite inlines every VITE_-prefixed variable into the shipped JavaScript. That
 * is correct for the Supabase publishable key and wrong for everything else: a
 * VITE_ prefix on the secret key would hand read-write access to every comment,
 * removed ones included, to anyone who opens developer tools. The mistake is one
 * character wide and completely silent, which is why it is checked mechanically.
 *
 *   npm run check:bundle     (runs as part of npm run build)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')

/**
 * Each pattern must match an actual credential *value*, not a bare prefix —
 * supabase-js contains the literal strings 'sb_publishable_' and 'sb_secret_'
 * as part of its own key-type check, and matching those would cry wolf on
 * every build until someone stopped believing it.
 */
const FORBIDDEN = [
  { name: 'Supabase secret key', pattern: /sb_secret_[A-Za-z0-9_-]{8,}/ },
  {
    name: 'Supabase service_role JWT',
    pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]*service_role/,
  },
  { name: 'Anthropic API key', pattern: /sk-ant-[A-Za-z0-9_-]{8,}/ },
  { name: 'Discord webhook', pattern: /discord(app)?\.com\/api\/webhooks\/\d+/ },
  { name: 'Postgres connection string', pattern: /postgres(ql)?:\/\/[^\s"']*:[^\s"']*@/ },
]

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

let files
try {
  files = walk(dist).filter((f) => /\.(js|css|html|map)$/.test(f))
} catch {
  console.error('✗ No dist/ to check. Run the build first.')
  process.exit(1)
}

const found = []
for (const file of files) {
  const text = readFileSync(file, 'utf8')
  for (const { name, pattern } of FORBIDDEN) {
    const match = pattern.exec(text)
    if (match)
      found.push(`${name} in ${path.relative(dist, file)} — matched ${match[0].slice(0, 24)}…`)
  }
}

if (found.length) {
  console.error(
    `\n✗ ${found.length} credential(s) in the shipped bundle:\n- ${found.join('\n- ')}\n\n` +
      'Anything VITE_-prefixed is public. Move this to Supabase Edge Function secrets.',
  )
  process.exit(1)
}
console.log(`✓ no credentials in the bundle (${files.length} files checked)`)
