/**
 * Writes real HTML for every route, in every language.
 *
 * Until now this was a client-rendered SPA: every URL served the same empty
 * `index.html` and the content only existed once JavaScript had run. That was
 * survivable in one language. In five it is not — `hreflang` and `canonical`
 * have to be *in* the document for a crawler to pair the translations up, and
 * a page that only says what language it is after hydration has already been
 * read as English.
 *
 * So each route is loaded in a headless browser, and the resulting document is
 * written to disk at its own path. The app still hydrates and takes over on
 * load; this is the version that exists before it does — for crawlers, for
 * link previews, for anyone whose JavaScript did not arrive, and for the first
 * paint of everyone else.
 *
 * Two deliberate choices:
 *
 *   - **Rendered with reduced motion on.** The Home page then prerenders its
 *     flat narrative rather than a WebGL canvas, so the document contains the
 *     whole story as text. That is the version worth having on disk: a canvas
 *     says nothing to a crawler and nothing to a screen reader.
 *
 *   - **Community is excluded from the sitemap and marked `noindex` here too.**
 *     It carries other people's health testimony posted without a human reading
 *     it first. The Netlify header does the real work; this is the copy that
 *     survives being served from anywhere else.
 *
 * Usage: npm run prerender   (runs as part of `npm run build`)
 */
import { spawn } from 'node:child_process'
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const PORT = 4319
const BASE = `http://localhost:${PORT}`
const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

if (!existsSync(path.join(dist, 'index.html'))) {
  console.error('✗ dist/index.html is missing — run `vite build` first')
  process.exit(1)
}

const { READY_LOCALES, DEFAULT_LOCALE, localePath } = await import(
  path.join(root, 'src/lib/locales.ts')
)
const { site } = await import(path.join(root, 'src/config/site.ts'))

const DICTS = Object.fromEntries(
  await Promise.all(
    READY_LOCALES.map(async (l) => [
      l.code,
      (await import(path.join(root, `src/locales/${l.code}.ts`))).default,
    ]),
  ),
)
const { parseFrontmatter, readString } = await import(path.join(root, 'src/lib/frontmatter.ts'))

/*
 * Slugs are read off disk rather than through `src/lib/content.ts`, which is
 * built on `import.meta.glob` and only exists under Vite. The default locale's
 * folder is the canonical set: a translation is matched to its original by
 * filename, so it can never introduce a slug of its own.
 */
function entries(collection) {
  const dir = path.join(root, 'src/content', collection, DEFAULT_LOCALE)
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => ({
      slug: name.replace(/\.md$/, ''),
      data: parseFrontmatter(readFileSync(path.join(dir, name), 'utf8')).data,
    }))
}

/*
 * The app shell, kept aside before prerendering overwrites index.html.
 *
 * Routes that are not prerendered — a genuine 404, a `/community/story/:id`
 * whose ids are unbounded — are rewritten to this rather than to index.html.
 * Otherwise every one of them would serve the prerendered home page, complete
 * with a canonical URL claiming to *be* the home page. netlify.toml points its
 * catch-all rewrite here.
 */
writeFileSync(path.join(dist, 'app.html'), readFileSync(path.join(dist, 'index.html'), 'utf8'))

/** Deploy previews should describe themselves, not claim to be production. */
const ORIGIN = (process.env.URL ?? process.env.DEPLOY_PRIME_URL ?? site.origin).replace(/\/$/, '')

/**
 * Canonical paths, locale-free. Everything here exists in every language.
 *
 * `/community/story/:id` is deliberately absent: the ids are unbounded and the
 * section is `noindex` anyway, so there is nothing to prerender and nothing a
 * crawler should be following.
 */
const ROUTES = [
  '/',
  '/learn',
  // An article with no title never reaches the Learn index, so it has no page.
  ...entries('learn')
    .filter(({ data }) => readString(data, 'title') !== '')
    .map(({ slug }) => `/learn/${slug}`),
  '/stories',
  /*
   * A withheld story is not published at all — prerendering one would put a
   * person's testimony on disk and in the sitemap after they asked for it not
   * to be. The attribution is read from the default locale, the same place the
   * app reads it, because consent is not a per-language decision.
   */
  ...entries('stories')
    .filter(({ data }) => readString(data, 'attribution') !== 'withheld')
    .map(({ slug }) => `/stories/${slug}`),
  '/tool',
  '/community',
  '/community/share',
  '/team',
  '/mission',
]

const isCommunity = (route) => route === '/community' || route.startsWith('/community/')

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore',
})
process.on('exit', () => server.kill())

async function waitForServer(timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      if ((await fetch(BASE)).ok) return
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`Preview server did not start on ${BASE}`)
}

const escape = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * The tags that make a set of translations one document rather than five.
 *
 * Every page lists every language including itself, which is what the spec
 * asks for, plus `x-default` pointing at English for a reader whose language
 * the site does not speak.
 */
function alternates(route) {
  const links = READY_LOCALES.map(
    (locale) =>
      `<link rel="alternate" hreflang="${locale.htmlLang}" href="${ORIGIN}${localePath(locale.code, route)}">`,
  )
  links.push(
    `<link rel="alternate" hreflang="x-default" href="${ORIGIN}${localePath(DEFAULT_LOCALE, route)}">`,
  )
  return links
}

let written = 0
const problems = []

try {
  await waitForServer()
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })
  // See the header comment: this is what makes Home prerender as text.
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])

  const sitemap = []
  /*
   * Captured first, written afterwards.
   *
   * The preview server is serving the very directory being written into, and
   * an un-prerendered path falls back to `dist/index.html`. Writing as we went
   * meant each page inherited the tags injected into the page rendered before
   * it — `/fr/learn` came out carrying the canonical URL of `/`, pointing every
   * French reader at the English homepage. Nothing about the output looked
   * wrong; it was two <link> tags where there should have been one.
   */
  const pages = []

  for (const route of ROUTES) {
    for (const locale of READY_LOCALES) {
      const url = localePath(locale.code, route)
      const dict = DICTS[locale.code]
      const response = await page.goto(BASE + url, { waitUntil: 'networkidle0' })
      if (!response?.ok()) {
        problems.push(`${url}: preview server returned ${response?.status()}`)
        continue
      }

      /*
       * React sets a <select>'s value as a DOM property, which does not appear
       * in serialised HTML — so every prerendered page came out with the
       * language switcher reading "English" regardless of the page's language.
       * Reflecting it to the attribute before capture fixes what the document
       * says; the <noscript> links beside it are what make switching work at
       * all without JavaScript.
       */
      await page.evaluate((code) => {
        for (const option of document.querySelectorAll('select option'))
          option.toggleAttribute('selected', option.value === code)
      }, locale.code)

      const html = await page.evaluate(() => document.documentElement.outerHTML)
      const title = await page.title()

      if (!title.trim()) problems.push(`${url}: rendered with an empty <title>`)
      if (!html.includes('<main')) problems.push(`${url}: rendered without a <main> landmark`)

      /*
       * Language links for a reader with no JavaScript.
       *
       * The switcher is a <select> that navigates on change, so without a
       * script it cannot go anywhere — and somebody who needs a different
       * language is the last person who should be stuck on this one. These are
       * plain anchors, and the browser drops them the moment a script runs.
       *
       * Injected here rather than rendered by the component because React
       * renders `<noscript>` empty on the client: a scripting-enabled browser
       * parses its content as text, so there is nothing for React to put
       * children into.
       */
      const others = READY_LOCALES.filter((other) => other.code !== locale.code)
        .map(
          (other) =>
            `<a lang="${other.htmlLang}" href="${localePath(other.code, route)}" ` +
            `style="color:inherit">${escape(other.name)}</a>`,
        )
        .join(' · ')
      const fallback =
        `<noscript><p style="margin:0;padding:.6rem 1rem;font:500 14px/1.4 system-ui,sans-serif;` +
        `background:#f0e7d6;color:#5a4c3e;text-align:center">` +
        `${escape(dict.language.label)}: ${others}</p></noscript>`

      const head = [
        `<link rel="canonical" href="${ORIGIN}${url}">`,
        ...alternates(route),
        isCommunity(route) ? '<meta name="robots" content="noindex, nofollow">' : '',
      ]
        .filter(Boolean)
        .join('\n    ')

      const document =
        `<!doctype html>\n` +
        html.replace('</head>', `  ${head}\n  </head>`).replace(/(<body[^>]*>)/, `$1${fallback}`) +
        '\n'

      pages.push({
        file: path.join(dist, url === '/' ? 'index.html' : `${url.slice(1)}/index.html`),
        document,
      })

      if (!isCommunity(route)) sitemap.push({ url, locale, route })
    }
  }

  await browser.close()

  for (const { file, document } of pages) {
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, document)
    written += 1
  }

  /*
   * Every language of a page is listed, each carrying the same alternates, so
   * a crawler arriving at any one of them finds the other four.
   */
  const urls = sitemap
    .map(({ url, route }) => {
      const links = READY_LOCALES.map(
        (l) =>
          `    <xhtml:link rel="alternate" hreflang="${l.htmlLang}" href="${ORIGIN}${localePath(l.code, route)}"/>`,
      ).join('\n')
      return `  <url>\n    <loc>${escape(ORIGIN + url)}</loc>\n${links}\n  </url>`
    })
    .join('\n')

  writeFileSync(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
      `${urls}\n</urlset>\n`,
  )

  /*
   * No Disallow for Community on purpose: disallowing stops a crawler
   * reaching the page at all, so it never sees the noindex and the URL can
   * still surface. The header and the meta tag are what keep it out.
   */
  writeFileSync(
    path.join(dist, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`,
  )
} finally {
  server.kill()
}

if (problems.length) {
  console.error(`\n✗ ${problems.length} problem(s):\n- ${problems.join('\n- ')}`)
  process.exit(1)
}

console.log(
  `✓ prerendered ${written} pages — ${ROUTES.length} routes × ${READY_LOCALES.length} language(s), ` +
    `plus sitemap.xml and robots.txt (${ORIGIN})`,
)
