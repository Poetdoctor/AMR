import { useId, useState } from 'react'

export function CustomQuestions({
  questions,
  onChange,
}: {
  questions: string[]
  onChange: (questions: string[]) => void
}) {
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
        Your own questions
      </label>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
        Anything the list above does not cover. This is the part that matters most.
      </p>

      <div className="mt-3 flex gap-2">
        <input
          id={id}
          type="text"
          value={draft}
          autoComplete="off"
          placeholder="Type a question and press Enter"
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
          Add
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
                Remove
                <span className="sr-only">{` question: ${question}`}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
