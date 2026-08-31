import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Container } from '@/components/Container'
import { PostCard } from '@/components/community/PostCard'
import { Avatar } from '@/components/community/Avatar'
import { CrisisLine } from '@/components/community/CrisisLine'
import { Disclaimer } from '@/components/Disclaimer'
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
import { usePageTitle } from '@/lib/usePageTitle'
import NotFound from './NotFound'

export default function CommunityStory() {
  const { id } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<StoryComment[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [label, setLabel] = useState('')
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [missing, setMissing] = useState(false)

  usePageTitle(post?.title ?? 'Community')

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
    <Container width="wide" className="py-10 md:py-14">
      <Link
        to="/community"
        className="text-sm font-semibold text-rust-deep underline-offset-4 hover:underline"
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
            onReport={async (reason) => {
              await report({ postId: post.id }, reason, profile?.id ?? null)
              await load()
            }}
            onDelete={
              post.isMine
                ? async () => {
                    await deletePost(post.id)
                    window.location.assign('/community')
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
                    <p className="mt-1 text-[0.9375rem] leading-relaxed whitespace-pre-line text-ink-soft">
                      {comment.body}
                    </p>
                    <div className="mt-2 flex gap-4 text-xs">
                      {comment.isMine ? (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm('Delete your comment?')) return
                            await deleteComment(comment.id)
                            await load()
                          }}
                          className="font-semibold text-rust-deep hover:underline"
                        >
                          Delete
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={async () => {
                          await report({ commentId: comment.id }, 'other', profile?.id ?? null)
                          await load()
                        }}
                        className="text-ink-faint hover:text-ink-soft hover:underline"
                      >
                        Report
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {post.allow_comments ? (
              <div className="mt-6">
                <label htmlFor="new-comment" className="block text-sm font-semibold text-ink">
                  Add a comment
                </label>
                <textarea
                  id="new-comment"
                  rows={3}
                  value={draft}
                  autoComplete="off"
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Something you want this person to hear."
                  className="mt-2 w-full resize-y rounded-xl border border-sand-line bg-paper px-4 py-3 text-[0.9375rem] leading-relaxed text-ink placeholder:text-ink-faint/70"
                />
                <button
                  type="button"
                  disabled={draft.trim().length < 2}
                  onClick={() =>
                    withProfile(async (me) => {
                      await addComment(post.id, draft, me.id)
                      setDraft('')
                      await load()
                    })
                  }
                  className="btn btn-primary mt-3 disabled:opacity-50"
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
  )
}
