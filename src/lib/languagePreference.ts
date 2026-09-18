import { isLocaleCode, type LocaleCode } from '@/lib/locales'

/**
 * Remembers which language somebody chose, in their browser and nowhere else.
 *
 * This is a preference, not a record: it never leaves the device, it is only
 * ever written when a reader uses the switcher themselves, and the site works
 * identically with it missing (private windows, cleared storage, storage
 * blocked entirely — all of which throw rather than return null, hence the
 * try/catch on both sides).
 */

const KEY = 'amr.language'

export function readPreference(): LocaleCode | undefined {
  try {
    const value = window.localStorage.getItem(KEY) ?? undefined
    return isLocaleCode(value) ? value : undefined
  } catch {
    return undefined
  }
}

export function writePreference(code: LocaleCode): void {
  try {
    window.localStorage.setItem(KEY, code)
  } catch {
    // A reader who blocks storage simply gets the language they navigated to.
  }
}
