import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Link } from '@/components/LocaleLink'
import { Container } from '@/components/Container'
import { PostCard } from '@/components/community/PostCard'
import { Avatar } from '@/components/community/Avatar'
import { ConsentCheck } from '@/components/community/ConsentCheck'
import { CrisisLine } from '@/components/community/CrisisLine'
import { PublicNotice } from '@/components/community/PublicNotice'
import { ReportControl } from '@/components/community/ReportControl'
import { Disclaimer } from '@/components/Disclaimer'
import { UntranslatedNotice } from '@/components/UntranslatedNotice'
import {
  addComment,
  currentProfile,
  deleteComment,
  deletePost,
  ensureProfile,
  fetchComments,
  fetchCommunity,
  fetchPost,
  isConfigured,
  report,
  toggleBookmark,
  toggleReaction,
  type Post,
  type Profile,
  type StoryComment,
} from '@/lib/community'
import { useI18n, useT } from '@/lib/i18n'
import { usePageTitle } from '@/lib/usePageTitle'
import NotFound from './NotFound'

export default function CommunityStory() {
  const t = useT()
  const { path } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<StoryComment[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [label, setLabel] = useState('')
  const [draft, setDraft] = useState('')
  const [consented, setConsented] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [missing, setMissing] = useState(false)

  usePageTitle(post?.title ?? t.titles.community)

  useEffect(() => {
    const tag = document.createElement('meta')
    tag.name = 'robots'
    tag.content = 'noindex, nofollow'
    document.head.appendChild(tag)
    return () => tag.remove()
  }, [])

  const load = useCallback(async () => {
    if (!isConfigured || !id) return
    try {
      const me = await currentProfile()
      const [record, story] = await Promise.all([fetchCommunity(), fetchPost(id, me?.id)])
      if (!story) {
        setMissing(true)
        return
      }
      setProfile(me)
      setPost(story)
      setLabel(record.card_label ?? '')
      setComments(await fetchComments(id, me?.id))
      setError('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'We could not load this just now.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const withProfile = useCallback(
    async (action: (me: Profile) => Promise<void>) => {
      setError('')
      try {
        const me = profile ?? (await ensureProfile())
        if (!me) throw new Error('Could not start a session.')
        if (!profile) setProfile(me)
        await action(me)
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'That did not work. Please try again.')
      }
    },
    [profile],
  )

  if (!isConfigured) {
    return (
      <Container width="wide" className="py-16 md:py-20">
        <h1 className="display-lg text-ink">Community is not open yet</h1>
        <p className="lede mt-4 max-w-2xl">
          Stories people have written will appear here once the team has finished setting this
          section up. Nothing is missing and nothing has been removed — it simply has not opened.
        </p>
        <Link to="/community" className="btn btn-ghost mt-8">
          Back to Community
        </Link>
        <div className="mt-10 max-w-2xl">
          <CrisisLine />
        </div>
      </Container>
    )
  }

  if (missing) return <NotFound />
  if (loading) {
    return (
      <Container width="wide" className="py-20">
        <h1 className="display-md text-ink">A story from the community</h1>
        <p className="mt-4 text-sm text-ink-faint">Loading…</p>
      </Container>
    )
  }
  if (!post) return <NotFound />

  return (
    <>
      <UntranslatedNotice />
      <Container width="wide" className="py-10 md:py-14">
        <Link
          to="/community"
          className="text-sm font-semibold text-rust-deep underline underline-offset-4"
        >
          <span aria-hidden="true">← </span>All of Community
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-12">
          <div className="space-y-8">
            <PostCard
              post={post}
              communityLabel={label}
              linkToStory={false}
              onReact={(kind, on) =>
                withProfile(async (me) => {
                  await toggleReaction(post.id, me.id, kind, on)
                  await load()
                })
              }
              onBookmark={(on) =>
                withProfile(async (me) => {
                  await toggleBookmark(post.id, me.id, on)
                  await load()
                })
              }
              onReport={(reason, detail) => report({ postId: post.id }, reason, detail)}
              onDelete={
                post.isMine
                  ? async () => {
                      await deletePost(post.id)
                      navigate(path('/community'))
                    }
                  : undefined
              }
            />

            <section>
              <h2 className="display-md text-ink">Comments</h2>

              <p className="mt-4 rounded-xl bg-sand px-4 py-3 text-sm text-ink-soft">
                This is community experience, not medical advice.
              </p>

              {error ? (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-rust bg-rust-wash px-4 py-3 text-sm text-ink"
                >
                  {error}
                </p>
              ) : null}

              <ul className="mt-5 list-none space-y-4">
                {comments.map((comment) => (
                  <li key={comment.id} className="flex items-start gap-3">
                    <Avatar name={comment.author} size="sm" />
                    <div className="min-w-0 flex-1 rounded-xl border border-sand-line bg-paper px-4 py-3">
                      <p className="text-sm font-semibold text-ink">{comment.author}</p>
                      <p className="mt-1 text-[1.0625rem] leading-relaxed whitespace-pre-line text-ink-soft">
                        {comment.body}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-3">
                        {comment.isMine ? (
                          <button
                            type="button"
                            onClick={async () => {
                              if (!window.confirm('Delete your comment? It is deleted for good.'))
                                return
                              await deleteComment(comment.id)
                              await load()
                            }}
                            className="text-sm font-semibold text-rust-deep underline underline-offset-4"
                          >
                            Delete my comment
                          </button>
                        ) : null}
                        <ReportControl
                          what="comment"
                          onReport={(reason, detail) =>
                            report({ commentId: comment.id }, reason, detail)
                          }
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {post.allow_comments ? (
                <div className="mt-8">
                  <PublicNotice className="mb-5" />
                  <label htmlFor="new-comment" className="block text-sm font-semibold text-ink">
                    Add a comment
                  </label>
                  <p className="mt-1 text-sm text-ink-soft">
                    {profile ? (
                      <>
                        You will appear as{' '}
                        <strong className="font-semibold text-ink">{profile.display_name}</strong>,
                        a name made up for you. Nobody, including us, can see who you are.
                      </>
                    ) : (
                      'You will appear under a name made up for you, never your own. Nobody, including us, can see who you are.'
                    )}
                  </p>
                  <textarea
                    id="new-comment"
                    rows={3}
                    value={draft}
                    autoComplete="off"
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Something you want this person to hear."
                    className="mt-2 w-full resize-y rounded-xl border border-ink-faint bg-paper px-4 py-3 text-[1.0625rem] leading-relaxed text-ink placeholder:text-ink-faint"
                  />
                  <div className="mt-4">
                    <ConsentCheck checked={consented} onChange={setConsented} />
                  </div>
                  <button
                    type="button"
                    disabled={draft.trim().length < 2 || !consented}
                    onClick={() =>
                      withProfile(async (me) => {
                        await addComment(post.id, draft, me.id)
                        setDraft('')
                        setConsented(false)
                        await load()
                      })
                    }
                    className="btn btn-primary mt-4 disabled:opacity-50"
                  >
                    Post comment
                  </button>
                </div>
              ) : (
                <p className="mt-6 text-sm text-ink-faint">
                  The person who wrote this asked for it not to have comments.
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <CrisisLine />
            <Disclaimer />
          </aside>
        </div>
      </Container>
    </>
  )
}
