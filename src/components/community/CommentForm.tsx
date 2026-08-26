import { useId, useState } from 'react'
import { LIMITS } from '@/lib/communityLimits'

/**
 * The form.
 *
 * Under post-moderation its job is not to reassure someone that a person will
 * read this first — it is to make sure they understand that what they write
 * goes live immediately, while they can still choose their words.
 */
export function CommentForm({
  onSubmit,
}: {
  onSubmit: (body: string, displayName: string) => Promise<void>
}) {
  const bodyId = useId()
  const nameId = useId()
  const [body, setBody] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const tooShort = body.trim().length > 0 && body.trim().length < LIMITS.bodyMin
  const remaining = LIMITS.bodyMax - body.length
  const canSubmit = body.trim().length >= LIMITS.bodyMin && remaining >= 0 && !busy

  async function handleSubmit() {
    if (!canSubmit) return
    setBusy(true)
    setError('')
    try {
      await onSubmit(body.trim(), displayName.trim())
      setBody('')
      setDisplayName('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card p-6 md:p-8">
      <h2 className="display-md text-ink">Say it here</h2>

      <p className="prose-amr mt-3 max-w-2xl text-[0.9375rem]">
        Write as much or as little as you like. Use any name you want — a first name, a nickname, or
        nothing at all. <strong>What you write appears on this page straight away</strong>, so
        please leave out anything that would identify you or someone else: your hospital, your town,
        your doctor's name. You can delete your own comment at any time, and one of us reads through
        everything each day.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor={nameId} className="block text-sm font-semibold text-ink">
            A name to post under <span className="font-normal text-ink-faint">— optional</span>
          </label>
          <input
            id={nameId}
            type="text"
            value={displayName}
            maxLength={LIMITS.nameMax}
            autoComplete="off"
            placeholder="Leave blank to post as Anonymous"
            onChange={(event) => setDisplayName(event.target.value)}
            className="mt-2 w-full max-w-sm rounded-xl border border-sand-line bg-paper px-4 py-3 text-[0.9375rem] text-ink placeholder:text-ink-faint/70"
          />
        </div>

        <div>
          <label htmlFor={bodyId} className="block text-sm font-semibold text-ink">
            What happened
          </label>
          <textarea
            id={bodyId}
            rows={7}
            value={body}
            autoComplete="off"
            onChange={(event) => setBody(event.target.value)}
            className="mt-2 w-full resize-y rounded-xl border border-sand-line bg-paper px-4 py-3 text-[0.9375rem] leading-relaxed text-ink placeholder:text-ink-faint/70"
            placeholder="There is no right way to write this."
          />
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-sm text-ink-faint">
            <span>{tooShort ? `A little more — at least ${LIMITS.bodyMin} characters.` : ' '}</span>
            <span className={remaining < 0 ? 'font-semibold text-rust-deep' : ''}>
              {remaining < 200 ? `${remaining} characters left` : ' '}
            </span>
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-rust bg-rust-wash px-4 py-3 text-sm text-ink"
          >
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn btn-primary disabled:opacity-50"
        >
          {busy ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  )
}
