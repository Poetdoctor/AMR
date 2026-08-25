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
  '/no-such-page',
]

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

    for (const route of ROUTES) {
      errors.length = 0
      await page.goto(BASE + route, { waitUntil: 'networkidle0' })

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
          hasDisclaimer: /not medical advice/i.test(document.body.innerText),
          title: document.title,
        }
      })

      const at = `${viewport.name} ${route}`
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
      // Hard constraint: every page carries the educational/not-medical-advice notice.
      if (!r.hasDisclaimer) fail(`${at}: disclaimer not present on the page`)
      if (!r.title.trim()) fail(`${at}: empty document title`)
      if (errors.length) fail(`${at}: console/page errors — ${errors.join(' | ')}`)
    }
    await page.close()
  }

  // Mandatory reduced-motion path: every route must still render its content.
  const reduced = await browser.newPage()
  await reduced.setViewport(VIEWPORTS[1])
  await reduced.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  for (const route of ROUTES) {
    await reduced.goto(BASE + route, { waitUntil: 'networkidle0' })
    const textLength = await reduced.evaluate(
      () => document.querySelector('main')?.innerText.length ?? 0,
    )
    if (textLength < 120)
      fail(`reduced-motion ${route}: main content did not render (${textLength} chars)`)
  }
  await reduced.close()

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
  `✓ smoke passed — ${ROUTES.length} routes × ${VIEWPORTS.length} viewports + reduced-motion`,
)
