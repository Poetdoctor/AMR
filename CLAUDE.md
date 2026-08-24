# AMR Psychosocial Support Site — Project Instructions

Static, no-backend-by-default website (one exception: Community
comments, see below) for an iGEM UBC Human Practices project on the
psychosocial impact of antimicrobial resistance (AMR).

**Before doing anything else, read `docs/content-spec.md`.** It has the
exact copy, quotes, and photo/content requirements for every section.
Don't paraphrase or invent content for Home, Learn, Stories, Team, or
Mission — it's already written; pull from that file.

## Hard constraints — do not violate these

- **Tool section (visit-prep form) stays 100% client-side, no
  exceptions.** Nothing typed into it is ever sent to a server or
  logged anywhere.
- **Comments are never auto-published.** Every submission enters a
  moderation queue (`status: pending`) and is invisible to other
  visitors until a moderator sets `status: approved`. This is the
  primary safety mechanism for Community — not the AI redaction pass,
  which is an assist, not a substitute for human review.
- **No account required to browse.** A lightweight display name is
  enough to comment — pseudonyms encouraged, no real-name requirement.
- **No analytics or embeds that do session replay or field-level
  capture,** anywhere on the site, especially the Tool.
- **Accessibility:** respect `prefers-reduced-motion` with a
  non-animated fallback for all scroll content; full keyboard nav; alt
  text; sufficient contrast; reading order independent of scroll
  animation.
- **Every page carries a visible disclaimer:** educational, not medical
  advice, does not replace consultation with a healthcare provider.
- **Community section also includes:** a visible "Report" action on
  every comment, and a permanent line linking to a crisis resource
  (e.g. Talk Suicide Canada) in that section's footer.
- **Don't hardcode the Team roster as component content.** It's a Decap
  CMS collection (`src/content/team/*.md`) so any entry — including
  incomplete ones — can be added or edited later without a code change.
  See `docs/content-spec.md` for the empty-card behavior spec.

## Tech stack

- **Visual design system:** the Team and Mission pages (in
  `docs/content-spec.md`) establish the site's real identity — cream/
  beige background, bold serif display headings, rust/orange accents,
  card grids, soft rounded callout boxes. Extend this to every other
  page rather than defaulting to generic component styling.
- Vite + React (or Next.js static export).
- **React Three Fiber** (Three.js + React bindings) + **drei** for
  Home's scroll sequence. Camera moves along a fixed path through a 3D
  scene as the user scrolls; each of the 6 narrative beats is a distinct
  point/scene along that path — the "travel into the story" effect.
  - **Use abstract/procedural environments, not modeled realistic
    scenes** — primitives, gradients, particle fields, simple geometry.
    Nobody on the team is a 3D artist and six unique realistic
    environments isn't buildable in the time you have. Abstract 3D
    still delivers camera-travel-through-space; it doesn't need to look
    like a hospital room to land the beat about isolation.
  - **Mandatory fallback, not optional:** detect `prefers-reduced-motion`
    and low-end/mobile devices, and serve the flat 2D version instead —
    same six beats, same copy, cross-fade instead of camera travel. The
    accessibility constraint above already requires this; 3D makes it
    far easier to violate by accident than 2D did, so build the fallback
    path alongside the 3D path, not as an afterthought.
  - Test on an actual low-end/mid-range phone early, not just desktop
    Chrome — WebGL performance on mobile GPUs is where this kind of
    build usually breaks.
- Tailwind CSS or CSS modules.
- Supabase for the Community section only (comments + moderation
  queue). Everything else stays static, no backend.
- Decap CMS (`/admin` route) for Learn articles, Stories, and the Team
  roster. GitHub OAuth for admin login — no separate auth system.
- Deploy: Vercel or Netlify, static build + Supabase project.

## Build order

1. Scaffold, routing shell, deploy pipeline.
2. Team and Mission pages first — content's finished and they set the
   visual design system everything else should match.
3. Stories (static, low complexity).
4. Learn (static, markdown-driven) + Decap CMS setup — this covers
   Learn, Stories, and Team roster editing all at once.
5. Tool (client-side form + export/print, no backend).
6. Community (Supabase, moderation queue, AI-assist pass, report flow —
   highest complexity, build once the rest is solid).
7. Home narrative scrollytelling (highest design effort — build last).

Confirm with me before moving to the next numbered phase rather than
building all seven in one pass — some of these (Community especially)
are worth reviewing before building on top of.

## Out of scope

- Separate fully-built narrative tracks per AMR condition beyond the
  general narrative + UTI as one illustrated case.
- Modeled/realistic 3D assets — abstract/procedural scenes only (see
  Tech stack). No 3D artist on the team.
- Auto-publishing comments without moderation, under any configuration.
