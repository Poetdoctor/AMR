import { Link } from '@/components/LocaleLink'
import { Avatar } from './Avatar'
import { ContentWarningGate } from './ContentWarningGate'
import { ReportMenu } from './ReportMenu'
import {
  POST_TYPES,
  REACTIONS,
  type Post,
  type ReactionKind,
  type ReportReason,
} from '@/lib/community'

function typeLabel(id: string): string {
  return POST_TYPES.find((t) => t.id === id)?.label ?? 'Story'
}

export function PostCard({
  post,
  communityLabel,
  linkToStory = true,
  onReact,
  onBookmark,
  onReport,
  onDelete,
}: {
  post: Post
  communityLabel: string
  linkToStory?: boolean
  onReact: (kind: ReactionKind, on: boolean) => Promise<void>
  onBookmark: (on: boolean) => Promise<void>
  onReport: (reason: ReportReason) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const heading = post.title?.trim() || 'Untitled'

  return (
    <article className="card p-6 md:p-7">
      <header className="flex items-start gap-3.5">
        <Avatar name={post.author} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{post.author}</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-sand px-2.5 py-0.5 font-medium text-ink-soft">
              {typeLabel(post.post_type)}
            </span>
            <span className="text-ink-faint">{communityLabel}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              post.visibility === 'public'
                ? 'bg-rust-wash text-rust-deep'
                : 'bg-forest-soft text-forest-deep'
            }`}
          >
            {post.visibility === 'public' ? 'Public story' : 'Members only'}
          </span>
          <ReportMenu isMine={post.isMine} onReport={onReport} onDelete={onDelete} />
        </div>
      </header>

      <h3 className="mt-5 font-display text-xl leading-snug font-bold tracking-tight text-ink">
        {linkToStory ? (
          <Link to={`/community/story/${post.id}`} className="hover:text-rust-deep">
            {heading}
          </Link>
        ) : (
          heading
        )}
      </h3>

      <div className="mt-3">
        <ContentWarningGate warning={post.content_warning}>
          <p className="text-[0.9375rem] leading-relaxed whitespace-pre-line text-ink-soft">
            {post.body}
          </p>
        </ContentWarningGate>
      </div>

      {post.tags.length > 0 ? (
        <ul className="mt-4 flex list-none flex-wrap gap-2">
          {post.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-sand px-2.5 py-1 text-xs text-ink-soft">
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      <footer className="mt-5 flex flex-wrap items-center gap-2">
        {REACTIONS.map((reaction) => {
          const count = post.reactions[reaction.id]
          const active = post.myReactions.includes(reaction.id)
          return (
            <button
              key={reaction.id}
              type="button"
              aria-pressed={active}
              onClick={() => onReact(reaction.id, !active)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                active
                  ? 'border-forest bg-forest-soft font-medium text-forest-deep'
                  : 'border-sand-line bg-paper text-ink-soft hover:border-ink-faint hover:text-ink'
              }`}
            >
              {reaction.label}
              {count > 0 ? <span className="ms-1.5 tabular-nums">{count}</span> : null}
            </button>
          )
        })}

        <span className="ms-auto flex items-center gap-4 text-sm text-ink-faint">
          <Link
            to={`/community/story/${post.id}`}
            className="hover:text-ink"
            aria-label={`${post.commentCount} ${post.commentCount === 1 ? 'comment' : 'comments'} on this story`}
          >
            <span className="tabular-nums">{post.commentCount}</span>{' '}
            {post.commentCount === 1 ? 'comment' : 'comments'}
          </Link>
          <button
            type="button"
            aria-label={post.bookmarked ? 'Saved — remove from saved' : 'Save this story'}
            onClick={() => onBookmark(!post.bookmarked)}
            className={post.bookmarked ? 'font-medium text-rust-deep' : 'hover:text-ink'}
          >
            {post.bookmarked ? 'Saved' : 'Save'}
          </button>
        </span>
      </footer>
    </article>
  )
}
