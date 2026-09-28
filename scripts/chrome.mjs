/**
 * Finds a Chrome for the two scripts that need one.
 *
 * `scripts/prerender.mjs` runs inside `npm run build`, so this is not test
 * infrastructure — it is part of shipping the site. A build that cannot find
 * Chrome cannot prerender, and a deploy without prerendering serves every
 * route as an empty `<div id="root">`: no content for a crawler, nothing for a
 * reader with JavaScript off, and no `hreflang` pairing five translations into
 * one page. See docs/i18n.md → Prerendering.
 *
 * This file exists because that is exactly what happened. Both scripts
 * defaulted to the macOS Chrome path with `CHROME_PATH` as the only override.
 * CI sets it, every developer here is on a Mac, and Netlify is neither — so
 * every deploy after prerendering landed failed at the same line, and the live
 * site stayed on the last build from before it. Nobody noticed for weeks,
 * because a failed deploy leaves the previous one serving happily.
 *
 * So: look where Chrome actually tends to be, on every platform this project
 * builds on, and download one rather than failing if the machine has none.
 * The download is the last resort, not the first.
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** Where Chrome lives, in the order worth looking. */
const CANDIDATES = [
  // Set deliberately — CI, or a developer with Chrome somewhere unusual.
  process.env.CHROME_PATH,
  // Puppeteer's own convention, and what Netlify's docs tell people to set.
  process.env.PUPPETEER_EXECUTABLE_PATH,
  // Linux: Netlify's build image, GitHub Actions, most CI containers.
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/snap/bin/chromium',
  // macOS: where everyone on this team actually runs it.
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  // Windows, for a contributor who is not on a Mac.
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean)

/**
 * Downloads a Chrome into `node_modules/.cache` and returns its path.
 *
 * Only reached when the machine genuinely has no browser. Pinned rather than
 * floating: a prerender that renders differently between two deploys because
 * the build downloaded a newer Chrome is a change nobody made and nobody can
 * see in the diff.
 */
async function download() {
  const cacheDir = path.join(root, 'node_modules', '.cache', 'chrome')
  const { install, resolveBuildId, computeExecutablePath, Browser } =
    await import('@puppeteer/browsers')
  // Passed to all three calls rather than letting two of them infer it. They
  // default to the host platform, which is the same answer right up until
  // somebody cross-installs and gets a path for a binary that was never
  // downloaded.
  const platform = detectPlatform()
  const buildId = await resolveBuildId(Browser.CHROME, platform, 'stable')
  const executablePath = computeExecutablePath({
    browser: Browser.CHROME,
    platform,
    buildId,
    cacheDir,
  })
  if (existsSync(executablePath)) return executablePath

  console.log(`  no system Chrome found — downloading Chrome ${buildId} (once)`)
  await install({ browser: Browser.CHROME, platform, buildId, cacheDir })
  return executablePath
}

function detectPlatform() {
  if (process.platform === 'darwin') return process.arch === 'arm64' ? 'mac_arm' : 'mac'
  if (process.platform === 'win32') return process.arch === 'x64' ? 'win64' : 'win32'
  return 'linux'
}

/**
 * The executable path to hand puppeteer-core's `launch`.
 *
 * Throws with the list it searched rather than puppeteer's "Browser was not
 * found at the configured executablePath", which names one path and gives no
 * hint that others were possible.
 */
export async function resolveChrome() {
  const found = CANDIDATES.find((candidate) => existsSync(candidate))
  if (found) return found

  try {
    return await download()
  } catch (cause) {
    throw new Error(
      'No Chrome found, and downloading one failed.\n' +
        `Looked in:\n${CANDIDATES.map((c) => `  ${c}`).join('\n')}\n` +
        'Set CHROME_PATH to a Chrome or Chromium binary.\n' +
        `Download failed with: ${cause instanceof Error ? cause.message : cause}`,
      { cause },
    )
  }
}
