import { useId } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useI18n } from '@/lib/i18n'
import { writePreference } from '@/lib/languagePreference'
import { canonicalPath, localePath, READY_LOCALES, type LocaleCode } from '@/lib/locales'

/**
 * Language switcher.
 *
 * A native `<select>` on purpose: it is one tab stop, it is operable by
 * keyboard and screen reader without any of our own code, and on a phone it
 * opens the platform's own picker rather than a menu we would have to make
 * accessible ourselves. Five languages do not need a custom component.
 *
 * Switching keeps you on the page you were reading rather than dropping you at
 * the homepage — `/fr/stories` from `/stories`. Losing your place is a small
 * thing in English and a large one if you only just found a version you can
 * read.
 *
 * Each language is named in its own language, so you can find yours without
 * being able to read the one currently on screen.
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, t } = useI18n()
  const navigate = useNavigate()
  const { pathname, search, hash } = useLocation()
  const id = useId()

  if (READY_LOCALES.length < 2) return null

  function change(code: LocaleCode) {
    writePreference(code)
    navigate(`${localePath(code, canonicalPath(pathname))}${search}${hash}`)
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor={id} className="sr-only">
        {t.language.label}
      </label>
      <select
        id={id}
        value={locale.code}
        onChange={(event) => change(event.target.value as LocaleCode)}
        className="cursor-pointer rounded-full border border-sand-line bg-transparent px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
      >
        {READY_LOCALES.map((option) => (
          /*
           * `lang` on each option so a screen reader pronounces "Français" in
           * French rather than spelling it out in the page's language.
           */
          <option key={option.code} value={option.code} lang={option.htmlLang}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  )
}
