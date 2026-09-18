/**
 * Layout and accessibility smoke test.
 *
 * Checks the invariants that CLAUDE.md treats as hard constraints and that are
 * easy to break by accident as sections get added: the disclaimer on every
 * page, a skip link and a single <h1> per route, alt text on every image, no
 * horizontal overflow at mobile width, and every route still rendering with
 * `prefers-reduced-motion: reduce`.
 *
 * Usage:  npm run build && npm run smoke
 * Needs a local Chrome; set CHROME_PATH to override the default macOS location.
 */
import { spawn } from 'node:child_process'
import puppeteer from 'puppeteer-core'

const PORT = Number(process.env.SMOKE_PORT ?? 4319)
const BASE = `http://localhost:${PORT}`
const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const ROUTES = [
  '/',
  '/team',
  '/mission',
  '/learn',
  '/learn/what-amr-actually-means',
  '/learn/why-isolation-precautions-feel-personal',
  '/learn/psychosocial-side-of-amr',
  '/learn/who-faces-greater-risk',
  '/stories',
  '/stories/norma-washburn',
  '/stories/sunny-loo',
  '/tool',
  '/community',
  '/community/share',
  '/community/story/does-not-exist',
  '/no-such-page',
]

/**
 * Every route, in every language the site currently offers.
 *
 * Not a token sample. The two things that break a translated layout are text
 * that is longer than the English it replaced — which overflows on a narrow
 * screen, where nobody on the team is looking — and a route that quietly falls
 * back to English because a link forgot its prefix. Both are per-route and
 * per-viewport, so both dimensions have to be walked.
 */
const { READY_LOCALES, DEFAULT_LOCALE, localePath } = await import('../src/lib/locales.ts')

const DICTS = Object.fromEntries(
  await Promise.all(
    READY_LOCALES.map(async (l) => [l.code, (await import(`../src/locales/${l.code}.ts`)).default]),
  ),
)

const LOCALISED = READY_LOCALES.flatMap((locale) =>
  ROUTES.map((route) => ({
    url: localePath(locale.code, route),
    locale,
    expect: DICTS[locale.code],
  })),
)

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true },
  { name: 'desktop', width: 1280, height: 900, deviceScaleFactor: 1 },
]

const problems = []
const fail = (msg) => problems.push(msg)

async function waitForServer(url, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`Preview server did not start on ${url}`)
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore',
})
process.on('exit', () => server.kill())

try {
  await waitForServer(BASE)
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })

  for (const viewport of VIEWPORTS) {
    const page = await browser.newPage()
    await page.setViewport(viewport)

    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

    for (const { url, locale, expect } of LOCALISED) {
      errors.length = 0
      await page.goto(BASE + url, { waitUntil: 'networkidle0' })

      const r = await page.evaluate(() => {
        const de = document.documentElement
        return {
          scrollWidth: de.scrollWidth,
          clientWidth: de.clientWidth,
          overflowing: [...document.querySelectorAll('body *')]
            .filter((el) => el.getBoundingClientRect().right > de.clientWidth + 1)
            .slice(0, 5)
            .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`),
          h1Count: document.querySelectorAll('h1').length,
          imgsNoAlt: [...document.querySelectorAll('img')].filter((i) => !i.alt).length,
          controlsNoName: [...document.querySelectorAll('a, button')].filter(
            (el) => !el.textContent.trim() && !el.getAttribute('aria-label'),
          ).length,
          hasMain: Boolean(document.querySelector('main#main')),
          hasSkipLink: Boolean(document.querySelector('a[href="#main"]')),
          text: document.body.innerText,
          lang: document.documentElement.lang,
          dir: document.documentElement.dir,
          title: document.title,
        }
      })

      const at = `${viewport.name} ${url}`
      if (r.scrollWidth > r.clientWidth + 1)
        fail(
          `${at}: horizontal overflow (${r.scrollWidth} > ${r.clientWidth}) — ${r.overflowing.join(', ')}`,
        )
      if (r.h1Count !== 1) fail(`${at}: expected exactly one <h1>, found ${r.h1Count}`)
      if (r.imgsNoAlt) fail(`${at}: ${r.imgsNoAlt} image(s) without alt text`)
      if (r.controlsNoName)
        fail(`${at}: ${r.controlsNoName} link/button without an accessible name`)
      if (!r.hasMain) fail(`${at}: missing main#main landmark`)
      if (!r.hasSkipLink) fail(`${at}: missing skip link`)
      /*
       * Hard constraint: every page carries the educational/not-medical-advice
       * notice — and carries it in the language the page is being read in. An
       * English disclaimer on a French page is not a disclaimer to the person
       * it was written for.
       */
      if (!r.text.includes(expect.disclaimer.lead))
        fail(
          `${at}: disclaimer missing or not in ${locale.code} (expected "${expect.disclaimer.lead}")`,
        )
      if (r.lang !== locale.htmlLang)
        fail(`${at}: document lang is "${r.lang}", expected "${locale.htmlLang}"`)
      if (r.dir !== locale.dir) fail(`${at}: document dir is "${r.dir}", expected "${locale.dir}"`)
      if (!r.title.trim()) fail(`${at}: empty document title`)
      if (errors.length) fail(`${at}: console/page errors — ${errors.join(' | ')}`)
    }
    await page.close()
  }

  // Mandatory reduced-motion path: every route must still render its content.
  const reduced = await browser.newPage()
  await reduced.setViewport(VIEWPORTS[1])
  await reduced.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  for (const { url } of LOCALISED) {
    await reduced.goto(BASE + url, { waitUntil: 'networkidle0' })
    const textLength = await reduced.evaluate(
      () => document.querySelector('main')?.innerText.length ?? 0,
    )
    if (textLength < 120)
      fail(`reduced-motion ${url}: main content did not render (${textLength} chars)`)
  }
  await reduced.close()

  /*
   * The Tool's hard constraint: nothing typed into it is ever sent anywhere.
   * This drives the page the way a person would and fails if it makes a single
   * request off-origin, grows a submittable <form>, writes to storage without
   * being asked, or leaks a field value into the URL.
   */
  const tool = await browser.newPage()
  await tool.setViewport(VIEWPORTS[1])
  const offOrigin = []
  tool.on('request', (r) => {
    const url = r.url()
    const local = url.startsWith(BASE) || url.startsWith('data:') || url.startsWith('blob:')
    if (!local) offOrigin.push(url)
  })
  await tool.goto(`${BASE}/tool`, { waitUntil: 'networkidle0' })

  const SECRET = 'private-health-detail-9137'
  await tool.evaluate((text) => {
    const field = document.querySelector('textarea')
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set
    setter.call(field, text)
    field.dispatchEvent(new Event('input', { bubbles: true }))
  }, SECRET)
  const box = await tool.$('fieldset input[type=checkbox]')
  if (box) await box.click()
  await new Promise((r) => setTimeout(r, 400))

  const toolState = await tool.evaluate(
    (secret) => ({
      forms: document.querySelectorAll('form').length,
      url: location.href,
      storage: (() => {
        try {
          return Object.keys(localStorage)
        } catch {
          return []
        }
      })(),
      onSheet: (document.querySelector('.prep-sheet')?.innerText ?? '').includes(secret),
      storageLeak: (() => {
        try {
          return Object.values(localStorage).some((value) => String(value).includes(secret))
        } catch {
          return false
        }
      })(),
    }),
    SECRET,
  )

  if (offOrigin.length) fail(`/tool made off-origin request(s): ${offOrigin.join(', ')}`)
  if (toolState.forms > 0)
    fail(
      `/tool has ${toolState.forms} <form> element(s) — a stray submit could put answers in a URL`,
    )
  if (toolState.url.includes(SECRET)) fail('/tool leaked a field value into the URL')
  // The property that matters is that the worksheet stores nothing of its own
  // and leaks nothing typed into it. Asserting "storage is completely empty"
  // was a proxy for that, and it broke as soon as another page legitimately
  // kept a session — a check that fails for the wrong reason gets muted.
  const toolKeys = toolState.storage.filter((key) => key.startsWith('amr.visit-prep'))
  if (toolKeys.length) fail(`/tool wrote to storage without opt-in: ${toolKeys.join(', ')}`)
  if (toolState.storageLeak) fail('/tool leaked typed text into browser storage')
  if (!toolState.onSheet) fail('/tool did not carry typed text through to the printable sheet')
  await tool.close()

  // The Decap CMS admin is not one of the site's own pages, so the assertions
  // above don't apply to it — but it does have to boot and find its config.
  const admin = await browser.newPage()
  await admin.setViewport(VIEWPORTS[1])
  const configStatus = await fetch(`${BASE}/admin/config.yml`).then((r) => r.status)
  if (configStatus !== 200) fail(`/admin/config.yml returned ${configStatus}`)
  await admin.goto(`${BASE}/admin/`, { waitUntil: 'networkidle2' })
  await new Promise((r) => setTimeout(r, 2500))
  const adminText = await admin.evaluate(() => document.body.innerText)
  if (!/login/i.test(adminText))
    fail(`/admin did not render a login screen (got: ${adminText.slice(0, 120)})`)
  await admin.close()

  await browser.close()
} finally {
  server.kill()
}

if (problems.length) {
  console.error(`\n✗ ${problems.length} problem(s):\n- ${problems.join('\n- ')}`)
  process.exit(1)
}
console.log(
  `✓ smoke passed — ${ROUTES.length} routes × ${READY_LOCALES.length} language(s) (${READY_LOCALES.map((l) => l.code).join(', ')}) × ${VIEWPORTS.length} viewports + reduced-motion`,
)
