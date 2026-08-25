import { useId } from 'react'

/**
 * Labelled inputs for the worksheet.
 *
 * `autoComplete="off"` and `spellCheck` are set deliberately: browsers offer to
 * remember and suggest previously typed values, and these fields hold health
 * information that should not turn up as an autofill suggestion on a shared
 * machine. Browsers may ignore the hint, which is exactly why the page also
 * tells people not to use a shared computer for this.
 */
export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const id = useId()
  const hintId = `${id}-hint`

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="mt-1 text-sm leading-relaxed text-ink-soft">
          {hint}
        </p>
      ) : null}
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        aria-describedby={hint ? hintId : undefined}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
        className="mt-2.5 w-full rounded-xl border border-sand-line bg-paper px-4 py-3 text-[0.9375rem] text-ink placeholder:text-ink-faint/70"
      />
    </div>
  )
}

export function TextAreaField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}) {
  const id = useId()
  const hintId = `${id}-hint`

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="mt-1 text-sm leading-relaxed text-ink-soft">
          {hint}
        </p>
      ) : null}
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        aria-describedby={hint ? hintId : undefined}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
        className="mt-2.5 w-full resize-y rounded-xl border border-sand-line bg-paper px-4 py-3 text-[0.9375rem] leading-relaxed text-ink placeholder:text-ink-faint/70"
      />
    </div>
  )
}
