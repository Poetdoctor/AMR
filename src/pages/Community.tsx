import { useCallback, useEffect, useState } from 'react'
import { Link } from '@/components/LocaleLink'
import { Container } from '@/components/Container'
import { PageHeader } from '@/components/PageHeader'
import { PostCard } from '@/components/community/PostCard'
import { CrisisLine } from '@/components/community/CrisisLine'
import { Disclaimer } from '@/components/Disclaimer'
import { UntranslatedNotice } from '@/components/UntranslatedNotice'
import {
  ensureProfile,
  currentProfile,
  fetchCommunity,
  fetchMemberCount,
  fetchPosts,
  isConfigured,
  isMember,
  joinCommunity,
  leaveCommunity,
  report,
  toggleBookmark,
  toggleReaction,
  deletePost,
  type Community as CommunityRecord,
  type Post,
  type Profile,
} from '@/lib/community'
import { useT } from '@/lib/i18n'
import { usePageTitle } from '@/lib/usePageTitle'

/**
 * Community index.
 *
 * Reading needs no session at all — nobody is signed into anything merely for
 * visiting. An identity appears the first time someone joins, reacts or writes.
 *
 * The section is noindex (see netlify.toml): stories are published without a
 * human reading them first, so an accidental self-identification should be
 * visible for the hours it is up rather than cached by search engines for
 * months.
 */
export default function Community() {
  const t = useT()
  usePageTitle(t.titles.community)

  const [community, setCommunity] = useState<CommunityRecord | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [members, setMembers] = useState(0)
  const [joined, setJoined] = useState(false)
  const [loading, setLoading] = useState(isConfigured)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

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
      const record = await fetchCommunity()
      const me = await currentProfile()
      const [feed, count, member] = await Promise.all([
        fetchPosts(record.id, me?.id),
        fetchMemberCount(record.id),
        me ? isMember(record.id, me.id) : Promise.resolve(false),
      ])
      setCommunity(record)
      setProfile(me)
      setPosts(feed)
      setMembers(count)
      setJoined(member)
      setError('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'We could not load this just now.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  /** Any action that must be attributable creates the identity on demand. */
  const withProfile = useCallback(
    async (action: (me: Profile) => Promise<void>) => {
      setBusy(true)
      setError('')
      try {
        const me = profile ?? (await ensureProfile())
        if (!me) throw new Error('Could not start a session.')
        if (!profile) setProfile(me)
        await action(me)
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'That did not work. Please try again.')
      } finally {
        setBusy(false)
      }
    },
    [profile],
  )

  const handleJoin = () =>
    withProfile(async (me) => {
      if (!community) return
      if (joined) {
        await leaveCommunity(community.id, me.id)
        setJoined(false)
        setMembers((n) => Math.max(0, n - 1))
      } else {
        await joinCommunity(community.id, me.id)
        setJoined(true)
        setMembers((n) => n + 1)
      }
      await load()
    })

  // Reachable whenever the Supabase environment is missing — a fresh checkout,
  // a preview build, a misconfigured deploy. It is a page someone can land on,
  // so it gets a heading like any other.
  if (!isConfigured) {
    return (
      <>
        <PageHeader
          eyebrow={t.nav.community}
          title={t.pages.community.title}
          subhead={t.pages.community.subhead}
        />
        <Container width="wide" className="py-16">
          <div className="callout max-w-2xl p-7">
            <p className="eyebrow mb-4">{t.pages.community.openingSoon}</p>
            <p className="prose-amr">{t.pages.community.openingSoonBody}</p>
          </div>
        </Container>
      </>
    )
  }

  return (
    <>
      {/*
        Deliberately unconditional. Most of this page's words come from
        `community_settings` in the database — the intro, the guidelines, the
        glossary — which the team writes in English through Supabase Studio,
        and so does every post. There is nothing here to key a `when` off, and
        a reader in French should be told that before they start reading.
      */}
      <UntranslatedNotice />
      <header className="bg-forest py-14 text-cream md:py-16">
        <Container width="wide">
          <p className="text-xs font-semibold tracking-[0.16em] text-cream/70 uppercase">
            Flagship community
          </p>
          <h1 className="display-lg mt-3 max-w-3xl text-cream">
            {community?.name ?? 'Living With Antimicrobial Resistance'}
          </h1>
          {community?.tagline ? (
            <p className="mt-3 max-w-2xl text-cream/80">{community.tagline}</p>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <span className="text-sm text-cream/80">
              <span className="tabular-nums">{members}</span>{' '}
              {members === 1 ? 'member' : 'members'}
            </span>
            <button
              type="button"
              onClick={handleJoin}
              disabled={busy}
              className="rounded-full bg-cream px-5 py-2 text-sm font-semibold text-forest-deep transition-colors hover:bg-cream-deep disabled:opacity-60"
            >
              {joined ? 'Leave community' : 'Join community'}
            </button>
            <Link
              to="/community/share"
              className="rounded-full border border-cream/40 px-5 py-2 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
            >
              Share an experience
            </Link>
          </div>
        </Container>
      </header>

      <Container width="wide" className="py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-12">
          <div className="space-y-8">
            {community?.intro_body ? (
              <section className="card p-6 md:p-7">
                <h2 className="display-md text-ink">{community.intro_title}</h2>
                <p className="prose-amr mt-3">{community.intro_body}</p>
                {community.topics.length > 0 ? (
                  <ul className="mt-5 flex list-none flex-wrap gap-2">
                    {community.topics.map((topic) => (
                      <li
                        key={topic}
                        className="rounded-full bg-sand px-3 py-1.5 text-sm text-ink-soft"
                      >
                        {topic}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ) : null}

            <section>
              <h2 className="display-md text-ink">{t.pages.community.latest}</h2>

              {error ? (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-rust bg-rust-wash px-4 py-3 text-sm text-ink"
                >
                  {error}
                </p>
              ) : null}

              <div className="mt-5 space-y-5">
                {loading ? <p className="text-sm text-ink-faint">Loading…</p> : null}

                {!loading && posts.length === 0 ? (
                  <div className="card p-7">
                    <p className="prose-amr">{t.pages.community.empty}</p>
                    <Link to="/community/share" className="btn btn-primary mt-5">
                      {t.titles.share}
                    </Link>
                  </div>
                ) : null}

                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    communityLabel={community?.card_label ?? ''}
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
                            await load()
                          }
                        : undefined
                    }
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            {community?.guidelines ? (
              <section className="card p-5">
                <h2 className="font-display text-base font-bold text-ink">
                  Community guidelines
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
                  {community.guidelines}
                </p>
              </section>
            ) : null}

            {community && community.glossary.length > 0 ? (
              <section className="card p-5">
                <h2 className="font-display text-base font-bold text-ink">
                  {t.pages.community.glossary}
                </h2>
                <dl className="mt-3 space-y-3.5">
                  {community.glossary.map((entry) => (
                    <div key={entry.term}>
                      <dt className="text-sm font-semibold text-ink">{entry.term}</dt>
                      <dd className="mt-0.5 text-sm leading-relaxed text-ink-soft">
                        {entry.definition}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            <CrisisLine />
            <Disclaimer />
          </aside>
        </div>
      </Container>
    </>
  )
}
