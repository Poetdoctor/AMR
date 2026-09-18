import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import en, { type Dict } from '@/locales/en'
import { DEFAULT_LOCALE, getLocale, localePath, type Locale, type LocaleCode } from '@/lib/locales'

/**
 * Translation lookup for the interface.
 *
 * English is imported statically and every other language is fetched on
 * demand, which is the right way round: the default locale renders on the
 * first frame with no request, and a reader of one language never downloads
 * the other four. The dictionaries are small, but there will be five of them
 * and then more.
 */

const DICTS = import.meta.glob<{ default: Dict }>('../locales/*.ts')

interface I18n {
  locale: Locale
  t: Dict
  /** Prefixes a canonical path for the active locale. */
  path: (to: string) => string
}

const I18nContext = createContext<I18n>({
  locale: getLocale(DEFAULT_LOCALE),
  t: en,
  path: (to) => to,
})

export const useI18n = () => useContext(I18nContext)

/** Just the strings, for the common case. */
export const useT = () => useContext(I18nContext).t

export function I18nProvider({ code, children }: { code: LocaleCode; children: ReactNode }) {
  const locale = getLocale(code)
  const [dict, setDict] = useState<Dict>(en)

  useEffect(() => {
    if (locale.code === DEFAULT_LOCALE) {
      setDict(en)
      return
    }
    let live = true
    const load = DICTS[`../locales/${locale.code}.ts`]
    /*
     * A missing dictionary is a build mistake, not a reader's problem: keep
     * the English strings on screen rather than emptying the interface. The
     * locale registry's `ready` flag is what is supposed to prevent this.
     */
    if (!load) {
      console.error(`No dictionary for locale "${locale.code}" — falling back to English.`)
      return
    }
    void load().then((module) => {
      if (live) setDict(module.default)
    })
    return () => {
      live = false
    }
  }, [locale.code])

  /*
   * The document's own language and direction. Screen readers switch voice on
   * `lang`, and `dir` is what turns the whole layout around for Farsi — both
   * belong on <html>, which React does not render, so they are set here.
   */
  useEffect(() => {
    const root = document.documentElement
    root.lang = locale.htmlLang
    root.dir = locale.dir
  }, [locale.htmlLang, locale.dir])

  const value = useMemo<I18n>(
    () => ({ locale, t: dict, path: (to: string) => localePath(locale.code, to) }),
    [locale, dict],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
