import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from '@/components/LocaleLink'
import { Container } from '@/components/Container'
import { Avatar } from '@/components/community/Avatar'
import { ConsentCheck } from '@/components/community/ConsentCheck'
import { CrisisLine } from '@/components/community/CrisisLine'
import { PublicNotice } from '@/components/community/PublicNotice'
import { UntranslatedNotice } from '@/components/UntranslatedNotice'
import {
  CONTENT_WARNINGS,
  createPost,
  currentProfile,
  ensureProfile,
  fetchCommunity,
  fetchTags,
  isConfigured,
  POST_TYPES,
  type Community,
  type PostType,
  type Profile,
} from '@/lib/community'
import { useI18n, useT } from '@/lib/i18n'
import { usePageTitle } from '@/lib/usePageTitle'

const MIN = 20
const MAX = 8000
const MAX_TAGS = 6

export default function ShareExperience() {
  const t = useT()
  const { path } = useI18n()
  usePageTitle(t.titles.share)
  const navigate = useNavigate()

  const [community, setCommunity] = useState<Community | null>(null)
  const [tagOptions, setTagOptions] = useState<string[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)

  const [postType, setPostType] = useState<PostType>('my_story')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [contentWarning, setContentWarning] = useState('')
  const [allowComments, setAllowComments] = useState(true)
  const [consented, setConsented] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const tag = document.createElement('meta')
    tag.name = 'robots'
    tag.content = 'noindex, nofollow'
    document.head.appendChild(tag)
    return () => tag.remove()
  }, [])

  useEffect(() => {
    if (!isConfigured) return
    void (async () => {
      try {
        const record = await fetchCommunity()
        setCommunity(record)
        // The community's topics come first: they are what the feed filters
        // by, so a story tagged with one can be found from its chip.
        setTagOptions([...new Set([...record.topics, ...(await fetchTags(record.id))])])
        // Deliberately not creating an identity here. Opening the composer to
        // see what it asks for should not sign anyone into anything — the
        // session is minted on the first keystroke instead, which is the point
        // at which somebody has actually decided to write. If one already
        // exists from a previous visit, the name is shown straight away.
        setProfile(await currentProfile())
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Could not open the composer.')
      }
    })()
  }, [])

  const remaining = MAX - body.length
  const canPost =
    body.trim().length >= MIN && remaining >= 0 && Boolean(community) && consented && !busy

  function toggleTag(tag: string) {
    setTags((current) =>
      current.includes(tag)
        ? current.filter((t) => t !== tag)
        : current.length >= MAX_TAGS
          ? current
          : [...current, tag],
    )
  }

  async function publish() {
    if (!canPost || !community) return
    setBusy(true)
    setError('')
    try {
      const me = profile ?? (await ensureProfile())
      if (!me) throw new Error('Could not start a session.')
      const id = await createPost(
        {
          communityId: community.id,
          postType,
          title,
          body,
          tags,
          contentWarning: contentWarning || null,
          allowComments,
        },
        me.id,
      )
      // Through `path`, or a French reader lands on the English story page.
      navigate(path(`/community/story/${id}`))
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not publish that. Please try again.',
      )
      setBusy(false)
    }
  }

  if (!isConfigured) {
    return (
      <Container width="wide" className="py-16 md:py-20">
        <h1 className="display-lg text-ink">Share an experience</h1>
        <p className="lede mt-4 max-w-2xl">
          This is where you will be able to write about what happened to you, under a name made up
          for you rather than your own.
        </p>
        <div className="callout mt-8 max-w-2xl p-7">
          <p className="eyebrow mb-3">Not open yet</p>
          <p className="prose-amr">
            The team is still setting this section up, so nothing can be posted for the moment.
            Everything else on the site is working — the articles, the accounts people have already
            shared, and the worksheet for your next appointment.
          </p>
        </div>
        <Link to="/community" className="btn btn-ghost mt-8">
          Back to Community
        </Link>
        <div className="mt-10 max-w-2xl">
          <CrisisLine />
        </div>
      </Container>
    )
  }

  const field =
    'w-full rounded-xl border border-ink-faint bg-paper px-4 py-3 text-[1.0625rem] text-ink'

  return (
    <>
      <UntranslatedNotice />
      <Container width="default" className="py-12 md:py-16">
        <h1 className="display-lg text-ink">Share an experience</h1>
        <p className="lede mt-3 max-w-2xl">
          Your lived experience — in your own words. This is personal experience, not universal
          medical advice.
        </p>

        <PublicNotice className="mt-8 max-w-3xl" />

        <div className="card mt-8 space-y-6 p-6 md:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="community" className="block text-sm font-semibold text-ink">
                Community
              </label>
              <select id="community" disabled className={`${field} mt-2 opacity-70`}>
                <option>{community?.name ?? 'Loading…'}</option>
              </select>
            </div>
            <div>
              <label htmlFor="post-type" className="block text-sm font-semibold text-ink">
                Post type
              </label>
              <select
                id="post-type"
                value={postType}
                onChange={(event) => setPostType(event.target.value as PostType)}
                className={`${field} mt-2`}
              >
                {POST_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-ink">
              Title <span className="font-normal text-ink-faint">— optional</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              maxLength={120}
              autoComplete="off"
              placeholder="A short title"
              onChange={(event) => setTitle(event.target.value)}
              className={`${field} mt-2`}
            />
          </div>

          <div>
            <label htmlFor="story" className="block text-sm font-semibold text-ink">
              Your story
            </label>
            <textarea
              id="story"
              rows={9}
              value={body}
              autoComplete="off"
              placeholder="What happened, and what you'd want someone in your situation to know…"
              onChange={(event) => {
                setBody(event.target.value)
                // First keystroke: mint the pseudonym so the privacy preview can
                // show the real name well before anything is published.
                if (!profile)
                  void ensureProfile()
                    .then(setProfile)
                    .catch(() => {})
              }}
              className={`${field} mt-2 resize-y leading-relaxed`}
            />
            <p className="mt-2 text-sm text-ink-faint">
              {body.trim().length > 0 && body.trim().length < MIN
                ? `A little more — at least ${MIN} characters.`
                : remaining < 400
                  ? `${remaining} characters left`
                  : ' '}
            </p>
          </div>

          {tagOptions.length > 0 ? (
            <fieldset>
              <legend className="text-sm font-semibold text-ink">
                Topics{' '}
                <span className="font-normal text-ink-faint">— optional, up to {MAX_TAGS}</span>
              </legend>
              <p className="mt-1 text-sm text-ink-soft">
                People browsing Community can find your story by these.
              </p>
              <ul className="mt-3 flex list-none flex-wrap gap-2">
                {tagOptions.map((tag) => {
                  const on = tags.includes(tag)
                  return (
                    <li key={tag}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                          on
                            ? 'border-forest bg-forest-soft font-medium text-forest-deep'
                            : 'border-sand-line bg-paper text-ink-soft hover:border-ink-faint'
                        }`}
                      >
                        <span aria-hidden="true">#</span>
                        {tag}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </fieldset>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2 sm:max-w-sm">
              <label htmlFor="cw" className="block text-sm font-semibold text-ink">
                Content warning <span className="font-normal text-ink-faint">— optional</span>
              </label>
              <select
                id="cw"
                value={contentWarning}
                onChange={(event) => setContentWarning(event.target.value)}
                className={`${field} mt-2`}
              >
                <option value="">None</option>
                {CONTENT_WARNINGS.map((warning) => (
                  <option key={warning} value={warning}>
                    {warning}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={allowComments}
              onChange={(event) => setAllowComments(event.target.checked)}
              className="h-4 w-4 accent-[var(--color-forest)]"
            />
            <span className="text-sm font-medium text-ink">Allow comments</span>
          </label>
        </div>

        <section className="callout mt-6 p-6">
          <p className="eyebrow mb-4">Privacy preview</p>
          <div className="flex items-center gap-3">
            <Avatar name={profile?.display_name ?? 'AA'} size="sm" />
            <div>
              <p className="text-sm text-ink">
                Posting as{' '}
                <strong className="font-semibold">
                  {profile?.display_name ?? 'a name made up for you'}
                </strong>
              </p>
              <p className="text-sm text-ink-soft">Visible to: anyone on the internet</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            That name was made up for you, and it is the only one anyone sees — we do not know who
            you are either. Before you publish, reread your story for anything that would point at
            you: your full name, your town, your hospital or ward, your workplace, a phone number or
            email, or an exact appointment date.
          </p>
          <div className="mt-5 border-t border-sand-line pt-5">
            <ConsentCheck checked={consented} onChange={setConsented} />
          </div>
        </section>

        {error ? (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-rust bg-rust-wash px-4 py-3 text-sm text-ink"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <Link to="/community" className="btn btn-ghost">
            Cancel
          </Link>
          <button
            type="button"
            onClick={publish}
            disabled={!canPost}
            className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
          >
            {busy ? 'Publishing…' : 'Publish story'}
          </button>
        </div>

        <div className="mt-10 max-w-2xl">
          <CrisisLine />
        </div>
      </Container>
    </>
  )
}
