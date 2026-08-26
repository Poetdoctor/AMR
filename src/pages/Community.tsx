import { useCallback, useEffect, useMemo, useState } from 'react'
import { Container } from '@/components/Container'
import { PageHeader } from '@/components/PageHeader'
import { CommentForm } from '@/components/community/CommentForm'
import { CommentCard } from '@/components/community/CommentCard'
import { CrisisLine } from '@/components/community/CrisisLine'
import {
  deleteComment,
  fetchComments,
  forgetToken,
  isConfigured,
  rememberToken,
  reportComment,
  submitComment,
  themeLabel,
  THEMES,
  tokenFor,
  type Comment,
  type ReportReason,
} from '@/lib/community'
import { usePageTitle } from '@/lib/usePageTitle'

/**
 * Community.
 *
 * Comments publish on submit and a human sweeps daily. The safeguards that
 * arrangement requires are: this page is noindex (see netlify.toml — an
 * accidental self-identification should be visible for hours, not cached by
 * search engines for months), authors can delete their own comment instantly,
 * and every comment carries a Report action that hides it fast when the
 * screening pass had already flagged it.
 */
export default function Community() {
  usePageTitle('Community')

  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(isConfigured)
  const [loadError, setLoadError] = useState('')
  const [theme, setTheme] = useState<string>('all')
  const [justPosted, setJustPosted] = useState<string | null>(null)

  // Belt and braces with the X-Robots-Tag header: crawlers that run JavaScript
  // see this too, and it survives a change of host.
  useEffect(() => {
    const tag = document.createElement('meta')
    tag.name = 'robots'
    tag.content = 'noindex, nofollow'
    document.head.appendChild(tag)
    return () => tag.remove()
  }, [])

  const load = useCallback(async () => {
    if (!isConfigured) return
    try {
      setComments(await fetchComments())
      setLoadError('')
    } catch {
      setLoadError('We could not load the comments just now. Please try again shortly.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleSubmit = useCallback(async (body: string, displayName: string) => {
    const result = await submitComment(body, displayName)
    rememberToken(result.comment.id, result.deleteToken)
    setJustPosted(result.held ? 'held' : 'live')
    if (!result.held) setComments((current) => [result.comment, ...current])
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    const token = tokenFor(id)
    if (!token) throw new Error('This browser cannot prove that comment is yours.')
    await deleteComment(id, token)
    forgetToken(id)
    setComments((current) => current.filter((comment) => comment.id !== id))
  }, [])

  const handleReport = useCallback(
    async (id: string, reason: ReportReason) => {
      await reportComment(id, reason)
      // A report may have hidden it. Reload so the list reflects reality rather
      // than optimism.
      void load()
    },
    [load],
  )

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const comment of comments) map.set(comment.theme, (map.get(comment.theme) ?? 0) + 1)
    return map
  }, [comments])

  const visible = theme === 'all' ? comments : comments.filter((c) => c.theme === theme)

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Somewhere to say it out loud"
        subhead="Both of the patients we interviewed told us the same thing, separately: a community for this does not exist. This is our attempt at one."
      />

      <Container width="wide" className="py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-14">
          <div className="space-y-10">
            {isConfigured ? (
              <CommentForm onSubmit={handleSubmit} />
            ) : (
              <div className="callout p-7 md:p-9">
                <p className="eyebrow mb-4">Opening shortly</p>
                <p className="prose-amr">
                  This section is built but not yet connected. It will open once the team has
                  finished setting it up.
                </p>
              </div>
            )}

            {justPosted ? (
              <p
                role="status"
                className="rounded-xl border border-rust bg-rust-wash px-4 py-3 text-sm leading-relaxed text-ink"
              >
                {justPosted === 'live'
                  ? "Posted — it's on the page now. If you want it gone, use Delete on your comment. That works from this browser, no account needed."
                  : 'Thank you. Comments are being checked by a person before they appear at the moment, so this will show up shortly.'}
              </p>
            ) : null}

            {isConfigured ? (
              <section>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="display-md text-ink">What people have said</h2>
                  <span className="text-sm text-ink-faint">
                    {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                  </span>
                </div>

                {comments.length > 0 ? (
                  <nav aria-label="Filter by theme" className="mt-5">
                    <ul className="flex list-none flex-wrap gap-2">
                      {[{ id: 'all', label: 'All' }, ...THEMES].map((option) => {
                        const count =
                          option.id === 'all' ? comments.length : (counts.get(option.id) ?? 0)
                        if (option.id !== 'all' && count === 0) return null
                        const active = theme === option.id
                        return (
                          <li key={option.id}>
                            <button
                              type="button"
                              aria-pressed={active}
                              onClick={() => setTheme(option.id)}
                              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                                active
                                  ? 'bg-rust text-cream'
                                  : 'border border-sand-line bg-paper text-ink-soft hover:border-ink-faint hover:text-ink'
                              }`}
                            >
                              {option.label}{' '}
                              <span className={active ? 'text-cream/75' : 'text-ink-faint'}>
                                {count}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </nav>
                ) : null}

                <div className="mt-6 space-y-5">
                  {loading ? <p className="text-sm text-ink-faint">Loading…</p> : null}

                  {loadError ? (
                    <p
                      role="alert"
                      className="rounded-xl border border-rust bg-rust-wash px-4 py-3 text-sm text-ink"
                    >
                      {loadError}
                    </p>
                  ) : null}

                  {!loading && !loadError && comments.length === 0 ? (
                    <p className="prose-amr">
                      Nobody has written anything yet. If you have lived through any of this, you
                      would be the first — and the reason someone else finds this page not empty.
                    </p>
                  ) : null}

                  {visible.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      isMine={Boolean(tokenFor(comment.id))}
                      onDelete={handleDelete}
                      onReport={handleReport}
                    />
                  ))}

                  {!loading && comments.length > 0 && visible.length === 0 ? (
                    <p className="text-sm text-ink-faint">Nothing under {themeLabel(theme)} yet.</p>
                  ) : null}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <CrisisLine />
            <div className="rounded-2xl border border-sand-line bg-cream-deep p-5 text-sm leading-relaxed text-ink-soft">
              <h2 className="font-display text-base font-bold text-ink">
                How this is looked after
              </h2>
              <ul className="mt-3 list-none space-y-2.5">
                {[
                  'Comments appear as soon as they are written. One of us reads through everything each day.',
                  'You can delete your own comment at any time, from the browser you wrote it on.',
                  'Every comment has a Report action, and reporting can take one down straight away.',
                  'This page is not indexed by search engines.',
                ].map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rust"
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </>
  )
}
