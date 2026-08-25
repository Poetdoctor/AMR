import { QUESTION_GROUPS } from '@/lib/visitPrep'

export function QuestionPicker({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <div className="space-y-8">
      {QUESTION_GROUPS.map((group) => (
        <fieldset key={group.id}>
          <legend className="font-display text-lg font-bold text-ink">{group.label}</legend>
          <p className="mt-1 mb-4 text-sm leading-relaxed text-ink-soft">{group.note}</p>
          <ul className="list-none space-y-2.5">
            {group.questions.map((question) => {
              const checked = selected.includes(question.id)
              return (
                <li key={question.id}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                      checked
                        ? 'border-rust bg-rust-wash'
                        : 'border-sand-line bg-paper hover:border-ink-faint'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(question.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-rust)]"
                    />
                    <span className="text-[0.9375rem] leading-relaxed text-ink">
                      {question.text}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </fieldset>
      ))}
    </div>
  )
}
