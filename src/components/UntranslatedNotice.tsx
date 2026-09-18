import { useI18n } from '@/lib/i18n'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { Container } from './Container'

/**
 * Says, in the reader's own language, that what follows is not in it.
 *
 * The alternative designs are both worse. A blank page hides work that exists
 * and reads as a broken site. A silent fallback to English leaves somebody
 * scrolling a page they cannot read with no explanation and no way to know
 * whether a translation exists elsewhere — and it teaches them that the
 * language switcher lied. Saying so plainly costs one line and is the honest
 * version.
 *
 * It also means the team can publish an English article the day it is written
 * instead of holding it until four translations are ready.
 *
 * The English copy below it is marked `lang="en"` by the caller where it
 * wraps a whole page, so a screen reader switches voice instead of reading
 * English words with French phonetics.
 *
 * A bare `<UntranslatedNotice />` with no `when` is a to-do: it means that
 * page's copy still lives in a component and has not been moved anywhere a
 * translator can reach it.
 */
export function UntranslatedNotice({
  when = true,
  className = '',
}: {
  /**
   * Whether this page's content actually fell back to English. Pages backed by
   * the content collections pass the entry's own `translated` flag; pages whose
   * copy still lives in components leave it at the default until it moves.
   */
  when?: boolean
  className?: string
}) {
  const { locale, t } = useI18n()
  if (!when || locale.code === DEFAULT_LOCALE) return null

  return (
    <div className={`border-b border-sand-line bg-sand ${className}`}>
      <Container width="wide">
        <p role="note" className="py-3.5 text-sm leading-relaxed text-ink-soft">
          {t.untranslated.notice}
        </p>
      </Container>
    </div>
  )
}
