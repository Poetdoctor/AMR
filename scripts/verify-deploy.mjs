/**
 * Checks the things only the real host can answer, against the deployed site.
 *
 * `npm run test:prerender` verifies the files on disk are correct. It cannot
 * verify that they are *served* correctly, and two of the guarantees this site
 * makes live entirely in the hosting layer:
 *
 *   - **Directory-index resolution.** Every translated page is written to
 *     `dist/<lang>/<path>/index.html`. A request for `/fa` with no trailing
 *     slash has to resolve to `/fa/index.html`. Netlify does this; the local
 *     `vite preview` does not, which is exactly why it cannot be checked at
 *     build time and why it is checked here instead of assumed.
 *
 *   - **`X-Robots-Tag: noindex` on Community, in every language.** That is a
 *     hard constraint (CLAUDE.md) and it is enforced by a header rule in
 *     netlify.toml, not by anything in the bundle. The build can check the rule
 *     exists. Only the live site can show it is being applied.
 *
 * Run after a deploy:
 *
 *   npm run verify:deploy                              (production)
 *   npm run verify:deploy -- https://deploy-preview…   (a preview)
 */
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { READY_LOCALES, DEFAULT_LOCALE, localePath } = await import(
  path.join(root, 'src/lib/locales.ts')
)
const { site } = await import(path.join(root, 'src/config/site.ts'))

const ORIGIN = (process.argv[2] ?? site.origin).replace(/\/$/, '')

const failures = []
const check = (ok, message) => {
  if (!ok) failures.push(message)
}

console.log(`Checking ${ORIGIN}\n`)

for (const locale of READY_LOCALES) {
  /*
   * Deliberately no trailing slash. That is the form every link, every
   * canonical URL and every hreflang alternate on this site uses, so it is the
   * form that has to work.
   */
  const url = `${ORIGIN}${localePath(locale.code, '/learn')}`
  let response
  try {
    response = await fetch(url, { redirect: 'follow' })
  } catch (error) {
    failures.push(`${url}: request failed — ${error.message}`)
    continue
  }

  const html = await response.text()
  check(response.ok, `${url}: returned ${response.status}`)

  const lang = html.match(/<html[^>]*\blang="([^"]*)"/)?.[1]
  check(
    lang === locale.htmlLang,
    `${url}: served <html lang="${lang}">, expected "${locale.htmlLang}" — ` +
      'the host is not resolving the prerendered directory index, so every ' +
      'translated URL is serving the app shell instead of its own page',
  )

  check(
    html.includes(`<link rel="canonical" href="${ORIGIN}${localePath(locale.code, '/learn')}">`),
    `${url}: canonical link is missing or points elsewhere`,
  )
  for (const other of READY_LOCALES)
    check(
      html.includes(`hreflang="${other.htmlLang}"`),
      `${url}: missing hreflang alternate for ${other.code}`,
    )
}

// Hard constraint: Community is noindex in every language, applied by the host.
for (const locale of READY_LOCALES) {
  const url = `${ORIGIN}${localePath(locale.code, '/community')}`
  try {
    const response = await fetch(url)
    const tag = response.headers.get('x-robots-tag') ?? ''
    check(
      /noindex/i.test(tag),
      `${url}: X-Robots-Tag is "${tag || '(absent)'}" — Community must be noindex in every ` +
        'language. Check the /:lang/community rules in netlify.toml.',
    )
  } catch (error) {
    failures.push(`${url}: request failed — ${error.message}`)
  }
}

for (const file of ['/sitemap.xml', '/robots.txt']) {
  try {
    const response = await fetch(ORIGIN + file)
    check(response.ok, `${file}: returned ${response.status}`)
    if (file === '/sitemap.xml') {
      const xml = await response.text()
      check(
        xml.includes(`${ORIGIN}${localePath(DEFAULT_LOCALE, '/learn')}`),
        `${file}: does not list the Learn page`,
      )
      check(
        !xml.includes('/community'),
        `${file}: lists a Community URL, which must stay unindexed`,
      )
    }
  } catch (error) {
    failures.push(`${file}: request failed — ${error.message}`)
  }
}

if (failures.length) {
  console.error(`✗ ${failures.length} failure(s):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log(
  `✓ deploy verified — ${READY_LOCALES.length} languages served, Community noindex, sitemap live`,
)
