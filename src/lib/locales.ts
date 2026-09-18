/**
 * The languages this site speaks.
 *
 * Inclusivity is the reason this exists: an AMR project about people not being
 * heard cannot only be readable by people who read English. The set is chosen
 * for who actually lives here — French as Canada's other official language,
 * and the three largest non-English language communities in Metro Vancouver.
 *
 * `ready` is the switch. A locale that is registered but not ready has no
 * routes, does not appear in the switcher, and cannot be reached — so a
 * language can be added to this file while its translations are still being
 * reviewed, without half-translating the live site. Flip it when the
 * dictionary and the content collections are both complete.
 */

export type LocaleCode = 'en' | 'fr' | 'zh' | 'fa' | 'pa'

export interface Locale {
  code: LocaleCode
  /** The `lang` attribute. Not always the same as the route prefix. */
  htmlLang: string
  /** Endonym — a language is always named in its own language in a switcher. */
  name: string
  dir: 'ltr' | 'rtl'
  ready: boolean
  /**
   * Whether the 3D narrative can render this language's script correctly.
   *
   * It draws text with troika, which applies a font's GSUB substitutions — so
   * Arabic letters join and Chinese renders cleanly — but not its GPOS mark
   * attachment. Gurmukhi depends on GPOS: compared against the browser's own
   * rendering of the same string in the same font, troika leaves the vowel
   * signs and bindi floating detached from their consonants. Punjabi comes out
   * visibly wrong, so Punjabi is served the flat narrative unconditionally.
   *
   * That is not a downgrade. The flat path is a first-class requirement of this
   * project, carries the same beats and the same words, and renders Gurmukhi
   * correctly because the browser does the shaping.
   */
  richNarrative: boolean

  /**
   * The font file the 3D narrative draws this language's words with.
   *
   * `null` means troika's built-in face, which covers Latin and nothing else —
   * it draws no glyph at all for a character it lacks, with no error and no
   * fallback box. Every non-Latin language needs its own file, subset at build
   * time to the handful of characters its beat words actually use.
   */
  narrativeFont: string | null
}

export const DEFAULT_LOCALE: LocaleCode = 'en'

export const LOCALES: Locale[] = [
  {
    code: 'en',
    htmlLang: 'en',
    richNarrative: true,
    name: 'English',
    dir: 'ltr',
    ready: true,
    narrativeFont: null,
  },
  {
    code: 'fr',
    htmlLang: 'fr',
    richNarrative: true,
    name: 'Français',
    dir: 'ltr',
    ready: true,
    narrativeFont: null,
  },
  // The 3D narrative ships a Latin-only default font and draws nothing at all
  // for a glyph it does not have, so each of these carries its own subset.
  {
    code: 'zh',
    htmlLang: 'zh-Hans',
    name: '简体中文',
    dir: 'ltr',
    ready: true,
    richNarrative: true,
    narrativeFont: '/fonts/narrative-zh.woff',
  },
  {
    code: 'pa',
    htmlLang: 'pa',
    name: 'ਪੰਜਾਬੀ',
    dir: 'ltr',
    ready: true,
    // Gurmukhi needs GPOS mark attachment, which troika does not do.
    richNarrative: false,
    narrativeFont: null,
  },
  {
    code: 'fa',
    htmlLang: 'fa',
    name: 'فارسی',
    dir: 'rtl',
    ready: true,
    richNarrative: true,
    narrativeFont: '/fonts/narrative-fa.woff',
  },
]

export const READY_LOCALES = LOCALES.filter((locale) => locale.ready)

export function getLocale(code: string | undefined): Locale {
  return READY_LOCALES.find((locale) => locale.code === code) ?? READY_LOCALES[0]
}

export function isLocaleCode(value: string | undefined): value is LocaleCode {
  return READY_LOCALES.some((locale) => locale.code === value)
}

/**
 * Prefixes a canonical path for a locale.
 *
 * English stays at the root. The site is already deployed and linked to, and
 * moving every existing URL under `/en` to gain symmetry would break every one
 * of those links for nothing.
 */
export function localePath(code: LocaleCode, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (code === DEFAULT_LOCALE) return clean
  return clean === '/' ? `/${code}` : `/${code}${clean}`
}

/** The inverse: the canonical, locale-free path for a URL. */
export function canonicalPath(pathname: string): string {
  const [, first, ...rest] = pathname.split('/')
  if (!isLocaleCode(first) || first === DEFAULT_LOCALE) return pathname
  return `/${rest.join('/')}`.replace(/\/$/, '') || '/'
}

/**
 * Best supported match for the browser's stated preferences.
 *
 * Matches on the primary subtag, so `fr-CA`, `fr-FR` and `fr` all resolve to
 * French, and returns undefined rather than guessing when nothing matches.
 */
export function preferredLocale(languages: readonly string[]): LocaleCode | undefined {
  for (const tag of languages) {
    const primary = tag.toLowerCase().split('-')[0]
    const match = READY_LOCALES.find((locale) => locale.code === primary)
    if (match) return match.code
  }
  return undefined
}
