/**
 * Checks the built site, not the source.
 *
 * Prerendering is the one part of this project whose output nobody looks at.
 * Everything else is visible in a browser; these are files on disk that only a
 * crawler reads, and every failure mode is silent — a canonical URL pointing at
 * the wrong language, a missing `hreflang` that quietly unlinks the
 * translations, a Community page that lost its `noindex` and started being
 * indexed with other people's health testimony in it.
 *
 * Run after `npm run build`.
 *
 * Usage: npm run test:prerender
 */
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

const failures = []
const check = (ok, message) => {
  if (!ok) failures.push(message)
}

const { READY_LOCALES, LOCALES, DEFAULT_LOCALE, localePath } = await import(
  path.join(root, 'src/lib/locales.ts')
)

if (!existsSync(path.join(dist, 'index.html'))) {
  console.error('✗ dist/index.html is missing — run `npm run build` first')
  process.exit(1)
}

const sitemap = existsSync(path.join(dist, 'sitemap.xml'))
  ? readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  : ''
check(sitemap !== '', 'dist/sitemap.xml was not written')

/** Origin is whatever the build used; read it off a page rather than guessing. */
const home = readFileSync(path.join(dist, 'index.html'), 'utf8')
const ORIGIN = home.match(/<link rel="canonical" href="([^"]+)\/?"/)?.[1]?.replace(/\/$/, '')
check(Boolean(ORIGIN), 'dist/index.html has no canonical link to read the origin from')

const ROUTES = [
  '/',
  '/learn',
  '/stories',
  '/tool',
  '/community',
  '/community/share',
  '/team',
  '/mission',
]

for (const route of ROUTES) {
  for (const locale of READY_LOCALES) {
    const url = localePath(locale.code, route)
    const file = path.join(dist, url === '/' ? 'index.html' : `${url.slice(1)}/index.html`)

    if (!existsSync(file)) {
      failures.push(`${url}: not prerendered (${path.relative(dist, file)} missing)`)
      continue
    }
    const html = readFileSync(file, 'utf8')

    // The document has to say what language it is before any script runs.
    const lang = html.match(/<html[^>]*\blang="([^"]*)"/)?.[1]
    const dir = html.match(/<html[^>]*\bdir="([^"]*)"/)?.[1]
    check(
      lang === locale.htmlLang,
      `${url}: <html lang> is "${lang}", expected "${locale.htmlLang}"`,
    )
    check(dir === locale.dir, `${url}: <html dir> is "${dir}", expected "${locale.dir}"`)

    /*
     * Exactly one canonical, pointing at itself. More than one is not a
     * cosmetic duplicate: a second tag inherited from another page sends every
     * reader of this language to a different one.
     */
    const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((m) => m[1])
    check(
      canonicals.length === 1,
      `${url}: ${canonicals.length} canonical links, expected exactly 1`,
    )
    if (canonicals.length === 1)
      check(
        canonicals[0] === `${ORIGIN}${url}`,
        `${url}: canonical points at ${canonicals[0]}, expected ${ORIGIN}${url}`,
      )

    // Every language, plus x-default — otherwise the translations are five
    // unrelated pages as far as a crawler is concerned.
    for (const other of READY_LOCALES)
      check(
        html.includes(
          `hreflang="${other.htmlLang}" href="${ORIGIN}${localePath(other.code, route)}"`,
        ),
        `${url}: missing hreflang alternate for ${other.code}`,
      )
    check(
      html.includes(`hreflang="x-default" href="${ORIGIN}${localePath(DEFAULT_LOCALE, route)}"`),
      `${url}: missing x-default alternate`,
    )

    // A locale that is not ready must not be advertised as one that is.
    for (const other of LOCALES)
      if (!other.ready)
        check(
          !html.includes(`hreflang="${other.htmlLang}"`),
          `${url}: advertises "${other.code}" as an alternate, but it is not ready`,
        )

    /*
     * Hard constraint (CLAUDE.md): Community is noindex. It carries health
     * testimony published without a human reading it first, so an accidental
     * self-identification is visible for hours rather than cached for months.
     */
    const community = route === '/community' || route.startsWith('/community/')
    const noindex = /<meta name="robots" content="noindex/.test(html)
    check(
      community === noindex,
      community
        ? `${url}: Community page is missing its noindex meta`
        : `${url}: is marked noindex but is not a Community page`,
    )
    check(
      community !== sitemap.includes(`<loc>${ORIGIN}${url}</loc>`),
      community
        ? `${url}: Community page appears in sitemap.xml`
        : `${url}: is missing from sitemap.xml`,
    )

    /*
     * The no-script language links. The switcher is a <select> that navigates
     * on change, so without a script a reader cannot leave the language they
     * landed in — and somebody who needs another one is the last person who
     * should be stuck.
     */
    const noscript = html.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1] ?? ''
    for (const other of READY_LOCALES)
      if (other.code !== locale.code)
        check(
          noscript.includes(`href="${localePath(other.code, route)}"`),
          `${url}: no-script fallback has no link to ${other.code}`,
        )

    // The point of prerendering: the words exist before the app runs.
    const text = html
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    check(
      text.length > 200,
      `${url}: prerendered document has almost no text (${text.length} chars)`,
    )
  }
}

/*
 * The Netlify header rules that make Community noindex in production.
 *
 * These are hand-maintained in netlify.toml and were, until this test, English
 * only: `/community` matched but `/fr/community` did not, so four of the five
 * languages were quietly indexable. Adding a language is one line away from
 * reintroducing that, which is why it is checked rather than remembered.
 */
const netlify = readFileSync(path.join(root, 'netlify.toml'), 'utf8')
for (const pattern of [
  '"/community"',
  '"/community/*"',
  '"/:lang/community"',
  '"/:lang/community/*"',
])
  check(
    netlify.includes(`for = ${pattern}`),
    `netlify.toml: no X-Robots-Tag rule for ${pattern} — Community must be noindex in every language`,
  )

const robots = path.join(dist, 'robots.txt')
check(existsSync(robots), 'dist/robots.txt was not written')
if (existsSync(robots)) {
  const text = readFileSync(robots, 'utf8')
  check(text.includes('Sitemap:'), 'robots.txt does not point at the sitemap')
  /*
   * Disallowing Community would stop a crawler reaching the page at all, so it
   * would never see the noindex and the bare URL could still surface. The
   * header and the meta tag are what keep it out.
   */
  check(
    !/Disallow:\s*\/community/.test(text),
    'robots.txt disallows Community — see the note above',
  )
}

if (failures.length) {
  console.error(`\n✗ ${failures.length} failure(s):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log(
  `✓ prerender tests passed — ${ROUTES.length} routes × ${READY_LOCALES.length} language(s), ` +
    'canonical, hreflang, noindex and sitemap',
)
