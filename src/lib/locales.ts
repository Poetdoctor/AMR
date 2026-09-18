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
}

export const DEFAULT_LOCALE: LocaleCode = 'en'

export const LOCALES: Locale[] = [
  { code: 'en', htmlLang: 'en', name: 'English', dir: 'ltr', ready: true },
  { code: 'fr', htmlLang: 'fr', name: 'Français', dir: 'ltr', ready: true },
  // Phase 3: these need their dictionaries, their content collections, and —
  // for the Home narrative — a subset font per script, because the 3D text
  // renderer ships a Latin-only default and draws nothing for a glyph it does
  // not have. See docs/i18n.md.
  { code: 'zh', htmlLang: 'zh-Hans', name: '简体中文', dir: 'ltr', ready: false },
  { code: 'pa', htmlLang: 'pa', name: 'ਪੰਜਾਬੀ', dir: 'ltr', ready: false },
  { code: 'fa', htmlLang: 'fa', name: 'فارسی', dir: 'rtl', ready: false },
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
