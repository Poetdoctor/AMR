import { useEffect, useRef, useState } from 'react'
import { Container } from '@/components/Container'
import { PageHeader } from '@/components/PageHeader'
import { TextAreaField, TextField } from '@/components/tool/Field'
import { QuestionPicker } from '@/components/tool/QuestionPicker'
import { CustomQuestions } from '@/components/tool/CustomQuestions'
import { PrepSheet } from '@/components/tool/PrepSheet'
import { UntranslatedNotice } from '@/components/UntranslatedNotice'
import {
  areQuestionsTranslated,
  EMPTY_PREP,
  isEmpty,
  toPlainText,
  type VisitPrep,
} from '@/lib/visitPrep'
import * as storage from '@/lib/visitPrepStorage'
import { useI18n, useT } from '@/lib/i18n'
import { usePageTitle } from '@/lib/usePageTitle'

/**
 * Visit-prep worksheet — 100% client-side, permanently.
 *
 * There is no fetch, no form element that could submit, no analytics and no
 * third-party script anywhere in this feature or on this site. Export is the
 * browser's print dialog, an in-memory Blob download, and the clipboard. Saving
 * to this browser is opt-in and off by default (see lib/visitPrepStorage.ts).
 *
 * If anyone ever adds a network call here, they have broken the one promise
 * this page makes to the people using it.
 */
export default function Tool() {
  const t = useT()
  const { locale } = useI18n()
  usePageTitle(t.titles.tool)

  const [prep, setPrep] = useState<VisitPrep>(EMPTY_PREP)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [restored, setRestored] = useState(false)
  const statusTimer = useRef<number | undefined>(undefined)

  // Restore only if this browser was previously given permission to save.
  useEffect(() => {
    const enabled = storage.isSavingEnabled()
    setSaving(enabled)
    if (!enabled) return
    const stored = storage.load()
    if (stored) {
      setPrep(stored)
      setRestored(true)
    }
  }, [])

  useEffect(() => {
    if (saving) storage.save(prep)
  }, [prep, saving])

  useEffect(() => () => window.clearTimeout(statusTimer.current), [])

  function announce(message: string) {
    setStatus(message)
    window.clearTimeout(statusTimer.current)
    statusTimer.current = window.setTimeout(() => setStatus(''), 4000)
  }

  function update<K extends keyof VisitPrep>(key: K, value: VisitPrep[K]) {
    setPrep((current) => ({ ...current, [key]: value }))
    setRestored(false)
  }

  function toggleQuestion(id: string) {
    setPrep((current) => ({
      ...current,
      selectedQuestions: current.selectedQuestions.includes(id)
        ? current.selectedQuestions.filter((q) => q !== id)
        : [...current.selectedQuestions, id],
    }))
  }

  function toggleSaving(enabled: boolean) {
    setSaving(enabled)
    storage.setSavingEnabled(enabled, prep)
    announce(enabled ? t.tool.statusSavingOn : t.tool.statusSavingOff)
  }

  function clearAll() {
    setPrep(EMPTY_PREP)
    storage.clearStored()
    setRestored(false)
    announce(t.tool.statusCleared)
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(toPlainText(prep, t.tool, locale.code))
      announce(t.tool.statusCopied)
    } catch {
      announce(t.tool.statusCopyBlocked)
    }
  }

  function download() {
    // Built in memory and released immediately — the file never goes anywhere
    // but the folder the person chooses.
    const blob = new Blob([toPlainText(prep, t.tool, locale.code)], {
      type: 'text/plain;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'visit-preparation.txt'
    link.click()
    URL.revokeObjectURL(url)
    announce(t.tool.statusDownloaded)
  }

  const empty = isEmpty(prep)

  return (
    <>
      <UntranslatedNotice when={!areQuestionsTranslated(locale.code)} />
      <PageHeader
        eyebrow={t.tool.eyebrow}
        title={t.tool.title}
        subhead={t.tool.subhead}
        className="print-hide"
      />

      <Container width="wide" className="print-hide py-12 md:py-16">
        <div className="callout p-6 md:p-7" role="note">
          <h2 className="font-display text-lg font-bold text-ink">{t.tool.privacyTitle}</h2>
          <p className="prose-amr mt-2 text-[0.9375rem]">{t.tool.privacyBody}</p>
          <p className="prose-amr mt-2 text-[0.9375rem]">{t.tool.privacyShared}</p>
        </div>
      </Container>

      <Container width="wide" className="pb-20 md:pb-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14">
          {/*
            Deliberately not a <form>. Nothing here is ever submitted, and without
            a form element there is no path by which a stray Enter key could put
            any of this into a URL.
          */}
          <div className="tool-form print-hide space-y-12">
            {restored ? (
              <p className="rounded-xl border border-rust bg-rust-wash px-4 py-3 text-sm text-ink">
                {t.tool.restored}
              </p>
            ) : null}

            <section className="space-y-5">
              <h2 className="display-md text-ink">{t.tool.basics}</h2>
              <p className="prose-amr max-w-xl text-[0.9375rem]">{t.tool.basicsNote}</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label={t.tool.withWho}
                  value={prep.appointmentWith}
                  onChange={(v) => update('appointmentWith', v)}
                  placeholder={t.tool.withWhoHint}
                />
                <TextField
                  label={t.tool.when}
                  value={prep.appointmentWhen}
                  onChange={(v) => update('appointmentWhen', v)}
                  placeholder={t.tool.whenHint}
                />
              </div>
              <TextField
                label={t.tool.diagnosis}
                value={prep.diagnosis}
                onChange={(v) => update('diagnosis', v)}
                placeholder={t.tool.diagnosisHint}
              />
              <TextField
                label={t.tool.medications}
                value={prep.medications}
                onChange={(v) => update('medications', v)}
                placeholder={t.tool.medicationsHint}
              />
            </section>

            <section className="space-y-5">
              <h2 className="display-md text-ink">{t.tool.happening}</h2>
              <TextAreaField
                label={t.tool.sinceLast}
                hint={t.tool.sinceLastHint}
                value={prep.whatsBeenHappening}
                onChange={(v) => update('whatsBeenHappening', v)}
                placeholder="…"
              />
            </section>

            <section className="space-y-5">
              <h2 className="display-md text-ink">{t.tool.questions}</h2>
              <p className="prose-amr max-w-xl text-[0.9375rem]">{t.tool.questionsNote}</p>
              <QuestionPicker selected={prep.selectedQuestions} onToggle={toggleQuestion} />
              <CustomQuestions
                questions={prep.customQuestions}
                onChange={(v) => update('customQuestions', v)}
              />
            </section>

            <section className="space-y-5">
              <h2 className="display-md text-ink">{t.tool.notClinical}</h2>
              <TextAreaField
                label={t.tool.affecting}
                hint={t.tool.affectingHint}
                value={prep.howItsAffectingMe}
                onChange={(v) => update('howItsAffectingMe', v)}
                placeholder="…"
              />
              <TextAreaField
                label={t.tool.leaveWith}
                hint={t.tool.leaveWithHint}
                value={prep.wantToLeaveWith}
                onChange={(v) => update('wantToLeaveWith', v)}
                rows={3}
                placeholder="…"
              />
            </section>
          </div>

          <aside className="tool-preview lg:sticky lg:top-24 lg:self-start">
            <div className="card overflow-hidden">
              <div className="print-hide border-b border-sand-line bg-cream-deep px-6 py-4">
                <h2 className="font-display text-base font-bold text-ink">{t.tool.sheet}</h2>
                <p className="mt-0.5 text-sm text-ink-faint">{t.tool.sheetNote}</p>
              </div>

              <div className="max-h-[26rem] overflow-y-auto px-6 py-6 lg:max-h-[32rem]">
                <PrepSheet prep={prep} />
              </div>

              <div className="print-hide border-t border-sand-line bg-cream-deep px-6 py-5">
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    disabled={empty}
                    className="btn btn-primary disabled:opacity-50"
                  >
                    {t.tool.print}
                  </button>
                  <button
                    type="button"
                    onClick={download}
                    disabled={empty}
                    className="btn btn-ghost disabled:opacity-50"
                  >
                    {t.tool.download}
                  </button>
                  <button
                    type="button"
                    onClick={copy}
                    disabled={empty}
                    className="btn btn-ghost disabled:opacity-50"
                  >
                    {t.tool.copy}
                  </button>
                </div>

                <hr className="rule my-5" />

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={saving}
                    onChange={(event) => toggleSaving(event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-rust)]"
                  />
                  <span className="text-sm leading-relaxed text-ink-soft">
                    <span className="font-semibold text-ink">{t.tool.keepTitle}</span>
                    <br />
                    {t.tool.keepBody}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={clearAll}
                  disabled={empty}
                  className="mt-4 text-sm font-semibold text-rust-deep underline-offset-4 hover:underline disabled:no-underline disabled:opacity-50"
                >
                  {t.tool.clear}
                </button>

                <p
                  role="status"
                  aria-live="polite"
                  className="mt-3 min-h-[1.25rem] text-sm text-ink-faint"
                >
                  {status}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </>
  )
}
