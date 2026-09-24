/**
 * Fails the build on two things that must never reach the shipped site: a
 * credential, and a still-narrative illustration that is too heavy for the
 * devices that path exists to serve.
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

/*
 * The still-narrative artwork budget.
 *
 * `public/stills/` is served to the readers with the least to spend on it:
 * low-end devices that could not run the WebGL path, and anyone who asked for
 * reduced motion. It is also what scripts/prerender.mjs captures, so it is what
 * a crawler and a no-JavaScript reader get.
 *
 * The ceiling is set here, before the artwork is commissioned, because a budget
 * agreed after eleven illustrations exist is not a budget — it is a negotiation
 * nobody wins. A flat-colour WebP at 896px should land near 60 KB; 120 KB is
 * room to be wrong, and it still catches the 2 MB PNG that somebody exports by
 * accident at four in the morning.
 */
const PER_IMAGE_KB = 120
const TOTAL_KB = 900

let stills = []
try {
  stills = walk(path.join(dist, 'stills'))
} catch {
  // No artwork yet — the SVG fallback in SceneStill.tsx is carrying the path.
}

if (stills.length) {
  const sizes = stills.map((f) => ({
    name: path.relative(dist, f),
    kb: Math.round(statSync(f).size / 1024),
  }))
  const over = sizes.filter((s) => s.kb > PER_IMAGE_KB)
  const total = sizes.reduce((sum, s) => sum + s.kb, 0)

  const problems = over.map((s) => `${s.name} is ${s.kb} KB (limit ${PER_IMAGE_KB} KB)`)
  if (total > TOTAL_KB)
    problems.push(`${stills.length} images total ${total} KB (limit ${TOTAL_KB} KB)`)

  if (problems.length) {
    console.error(
      `\n✗ still-narrative artwork over budget:\n- ${problems.join('\n- ')}\n\n` +
        'This is the path served to low-end devices and to reduced-motion readers.\n' +
        'Re-export as WebP at 896px, or raise the ceiling here deliberately.',
    )
    process.exit(1)
  }
  console.log(`✓ still artwork within budget (${stills.length} image(s), ${total} KB)`)
}
