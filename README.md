# AMR — the human side

The website for the **iGEM UBC Human Practices** project on the psychosocial
impact of antimicrobial resistance.

Static site, no backend by default. The one planned exception is the Community
section (moderated comments, Supabase) in phase 6.

- Build rules, stack and phase order: [`CLAUDE.md`](CLAUDE.md)
- Exact copy, quotes and content requirements: [`docs/content-spec.md`](docs/content-spec.md)

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script              | What it does                                                         |
| ------------------- | -------------------------------------------------------------------- |
| `npm run dev`       | Vite dev server with hot reload                                      |
| `npm run build`     | Typecheck, then build to `dist/`                                     |
| `npm run preview`   | Serve the built `dist/` locally                                      |
| `npm run smoke`     | Layout + accessibility checks on the built site (needs local Chrome) |
| `npm run format`    | Prettier, including Tailwind class sorting                           |
| `npm run typecheck` | Types only, no build                                                 |

`npm run smoke` looks for Chrome at the default macOS path; override with
`CHROME_PATH=/path/to/chrome npm run smoke`.

## What's built so far

| Phase | Section                                        | Status                          |
| ----- | ---------------------------------------------- | ------------------------------- |
| 1     | Scaffold, routing shell, deploy pipeline       | **Done**                        |
| 2     | Team and Mission pages (set the design system) | **Done**                        |
| 3     | Stories                                        | Route exists, in-progress page  |
| 4     | Learn + Decap CMS at `/admin`                  | Route exists, in-progress page  |
| 5     | Tool (client-side visit-prep form)             | Route exists, in-progress page  |
| 6     | Community (Supabase, moderation queue)         | Route exists, in-progress page  |
| 7     | Home narrative scrollytelling (R3F)            | Static landing stands in for it |

Sections not yet built resolve to a stated "in progress" page rather than a
404, so navigation is complete and testable from day one.

## Layout

```
docs/content-spec.md    Source of truth for all copy — do not paraphrase it
scripts/smoke.mjs       Layout + a11y checks run in CI
src/
  components/           Shared UI (header, footer, cards, callouts, layout)
  config/site.ts        The few outward-facing values the team sets once
  content/team/*.md     Team roster — a Decap CMS collection, not code
  content/stories/*.md  Testimonial accounts, same collection pattern
  content/learn/*.md    Learn articles, same collection pattern
admin/                  The Decap CMS page, built as a second Vite entry
public/admin/config.yml The CMS content model — fetched at runtime, not bundled
  lib/                  Front-matter parsing and content loading
  pages/                One file per route
  styles/global.css     Design tokens and the shared component classes
public/uploads/         Decap media library target (team photos etc.)
```

## Design system

Everything lives in [`src/styles/global.css`](src/styles/global.css) as Tailwind
v4 `@theme` tokens plus a small set of component classes (`.card`, `.callout`,
`.btn`, `.display-*`, `.prose-amr`, `.eyebrow`, `.lede`). The identity comes
from the Team and Mission pages: cream ground, bold serif display headings
(Fraunces), rust accents, card grids, soft rounded callout boxes. New sections
extend these tokens rather than inventing their own styling.

Two colour rules worth knowing:

- `rust` is a **fill/border** colour. `rust-deep` is the **text** accent.
  Rust-as-text on a sand surface lands at 4.4:1 and fails AA.
- Every text/surface pairing in the token set clears 4.5:1. If you add a colour,
  check it before you use it.

Fonts are self-hosted through `@fontsource` — the site makes **no third-party
requests at all**, which is what keeps the "no analytics, no session replay"
constraint true rather than merely intended.

## Content editing

The team roster is a content collection (`src/content/team/*.md`), not component
code, so entries can be added or edited without a code change. Each file has
`name`, `role`, `quote`, `photo` and `order`.

**Empty-card rule:** an entry appears on the public grid once its `name`, `role`
and `quote` are filled in. A missing `photo` falls back to a designed monogram
avatar, so an entry can publish before its photo is uploaded. Ali Mohammad
Yazdani's entry has its photo but no `role` or `quote` yet, so it is hidden —
the grid shows five cards now and six once those two fields are filled in.

Photos live in `public/uploads/` and are referenced as `/uploads/<file>`. Keep
filenames lowercase and hyphenated: spaces become `%20` in URLs and Decap
rewrites them on upload anyway. The portrait set is 420x280 (3:2) and the cards
are sized to match it exactly, so replacements should keep that ratio to avoid
cropping faces.

### Editing through the CMS

Decap CMS serves the editing UI at **`/admin`**. It writes markdown directly into
`src/content/`, which commits to the repo and triggers a normal redeploy. Access
control is repo access: anyone who is a collaborator on the GitHub repo can sign
in. There is no separate user list.

The content model lives in [`public/admin/config.yml`](public/admin/config.yml)
and is fetched at runtime, so changing a field or a hint does not need a rebuild.

Two things about this setup are deliberate and worth not undoing:

- **Decap is bundled from npm, not loaded from a CDN.** The usual install is a
  `<script src="https://unpkg.com/decap-cms...">` tag. Bundling it keeps the
  promise that this site makes no third-party requests from any page. It builds
  as a second Vite entry (`admin/index.html`), so the ~5 MB CMS bundle never
  reaches the public site — the two share nothing but a JSX runtime chunk.
- **`src/content` is excluded from Prettier.** Decap writes markdown in its own
  style. If CI format-checked those files, every edit made through the CMS would
  fail the build.

`npm run test:content` guards the seam between the two: it round-trips awkward
values through js-yaml (the library Decap serialises with) and back through
`src/lib/frontmatter.ts`, and asserts that every field the loaders read is
actually declared in `config.yml`. A field renamed on one side but not the other
otherwise fails silently — the editor's change just has no effect.

#### Editing locally, without GitHub

```bash
npx decap-server     # in one terminal
npm run dev          # in another, then open http://localhost:5173/admin/
```

`local_backend: true` in the config makes `/admin` talk to that proxy and write
to your working copy instead of committing. Without the proxy running you will
see failed requests to `localhost:8081` in the console — that is expected, and it
only happens on localhost.

#### Making login work on the deployed site — one-time setup

`backend: github` needs an OAuth client to exchange the GitHub login for a token.
The site itself is static and cannot do that exchange, so a provider has to.

**On Netlify** (simplest — it ships one):

1. Register a GitHub OAuth App: GitHub → Settings → Developer settings → OAuth
   Apps → New. Homepage URL is the deployed site; **Authorization callback URL**
   is `https://api.netlify.com/auth/done`.

   The repo is private, so the token needs GitHub's `repo` scope. Netlify's
   provider requests that scope for the `github` backend already — there is
   nothing extra to configure, but it does mean each editor is asked to grant
   private-repo access the first time they sign in.

2. In Netlify: Site configuration → Access control → OAuth → Install provider →
   GitHub, and paste the client ID and secret from step 1.
3. Visit `/admin` and click _Login with GitHub_.

**On Vercel**, there is no built-in provider — you need to deploy a small OAuth
proxy and point the config at it by adding `base_url` (and `auth_endpoint`) under
`backend:` in `config.yml`. If nobody wants to maintain that, host on Netlify;
this is the one thing the choice of host actually decides.

Until step 2 is done, `/admin` loads and shows the login screen but cannot
complete sign-in. Use `decap-server` locally in the meantime.

### Story attribution

`docs/content-spec.md` requires confirming that each interviewee consented to
being named publicly on a website — not just to being interviewed — before their
story goes live under their real name. That is a person's job, not a build step,
so each story in `src/content/stories/*.md` carries an `attribution` field:

| Value       | Effect                                                         |
| ----------- | -------------------------------------------------------------- |
| `name`      | Publishes under the real `name`, and shows the `context` line  |
| `anonymous` | Publishes under `anonymousAs` instead; `context` is suppressed |
| `withheld`  | Does not publish at all                                        |

Both seeded stories are set to `name`: the team confirmed that Norma Washburn
and Sunny Loo consented to being named publicly. If that ever needs to be walked
back, switch the field rather than editing the prose — and keep `anonymousAs`
genuinely non-identifying, since the Mission page already names Sunny Loo as a
patient partner on the BC Antimicrobial Stewardship Program.

Story content comes from `docs/Web Content .pdf` ("AMR Beyond the Diagnosis").
Everything presented as an interviewee's words is a verbatim quote from it; the
connecting prose is the site's own voice, and the Stories page says so.

## Deploying

Configured for **either** host — pick one, delete the other config if you like.

- **Netlify:** [`netlify.toml`](netlify.toml). Build `npm run build`, publish `dist`.
- **Vercel:** [`vercel.json`](vercel.json). Framework preset Vite, output `dist`.

Both set SPA rewrites (client-side routing), keep `/admin/*` out of the SPA
catch-all so Decap can be served there in phase 4, add long-lived caching for
hashed assets, and send `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy` and a `Permissions-Policy` that switches off geolocation,
microphone, camera and topics.

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs format check,
typecheck, build and the smoke test on every push and PR.

## Non-negotiables

These are constraints, not preferences. Full list in [`CLAUDE.md`](CLAUDE.md).

- The Tool section stays 100% client-side. Nothing typed into it is ever sent
  anywhere.
- Comments are never auto-published. Every submission is `pending` until a human
  moderator approves it.
- No analytics, session replay, or field-level capture, anywhere.
- `prefers-reduced-motion` gets a real non-animated path, not a degraded one.
- Every page carries the "educational, not medical advice" disclaimer.
