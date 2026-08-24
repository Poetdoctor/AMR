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

Decap CMS (phase 4) will serve the editing UI at `/admin` and write to these
same files. Until then, edit the markdown directly.

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

Both seeded stories default to `anonymous` pending that confirmation. Keep
`anonymousAs` genuinely non-identifying: the Mission page already names Sunny Loo
as a patient partner on the BC Antimicrobial Stewardship Program, so repeating
that detail on an "anonymous" card would identify her immediately.

Story bodies are written without names or pronouns so they read correctly under
any of the three settings.

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
