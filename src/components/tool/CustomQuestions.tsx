import { useId, useState } from 'react'
import { useT } from '@/lib/i18n'

export function CustomQuestions({
  questions,
  onChange,
}: {
  questions: string[]
  onChange: (questions: string[]) => void
}) {
  const t = useT()
  const [draft, setDraft] = useState('')
  const id = useId()

  function add() {
    const text = draft.trim()
    if (!text) return
    onChange([...questions, text])
    setDraft('')
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {t.tool.ownTitle}
      </label>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{t.tool.ownNote}</p>

      <div className="mt-3 flex gap-2">
        <input
          id={id}
          type="text"
          value={draft}
          autoComplete="off"
          placeholder={t.tool.ownQuestionPlaceholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              add()
            }
          }}
          className="min-w-0 flex-1 rounded-xl border border-sand-line bg-paper px-4 py-3 text-[0.9375rem] text-ink placeholder:text-ink-faint/70"
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim()}
          className="btn btn-ghost shrink-0 disabled:opacity-50"
        >
          {t.tool.add}
        </button>
      </div>

      {questions.length > 0 ? (
        <ul className="mt-4 list-none space-y-2.5">
          {questions.map((question, index) => (
            <li
              key={`${question}-${index}`}
              className="flex items-start justify-between gap-3 rounded-xl border border-rust bg-rust-wash p-3.5"
            >
              <span className="text-[0.9375rem] leading-relaxed text-ink">{question}</span>
              <button
                type="button"
                onClick={() => onChange(questions.filter((_, i) => i !== index))}
                className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-rust-deep hover:bg-cream"
              >
                {t.tool.remove}
                <span className="sr-only">{t.tool.removeLabel.replace('{q}', question)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
