# Content Spec: AMR Psychosocial Support Site

Exact copy, quotes, and content requirements for every section. See
`CLAUDE.md` at the repo root for build rules, stack, and order — this
file is content only.

## Changelog from v1
- Added a **Learn** section (blog-style articles).
- Reinstated a **Community** section (live comments) — with a moderation
  design, not the "no live UGC" constraint from v1.
- Content is no longer placeholder-only: this version maps real material
  from the team's IHP interviews (two source documents, referred to below
  as **Doc A** — "AMR Beyond the Diagnosis" narrative — and **Doc B** —
  provider interview synthesis) directly onto site sections.
- Narrative framing corrected: **AMR-general is the flagship**, not UTI.
  Doc A's core testimony (Norma Washburn, Sunny Loo — a vasculitis
  patient) is AMR-wide, not UTI-specific. UTI content ties in as one
  illustrated case connected to the team's diagnostic device, not as the
  frame for the whole narrative.
- Added an **Admin / Content Management** section — v2 specified a
  moderation queue and "non-technical-friendly" content editing without
  actually giving admins an interface to do either. Fixed using existing
  tools (Supabase Studio, Decap CMS) rather than a custom-built panel.
- **v3:** replaced the placeholder About/Team section with two real
  tabs, **Team** and **Mission** — exact content and photos supplied by
  the team, not scaffolded placeholder copy. Added a visual design
  system reference (see Tech stack) based on these two pages.

## Hard constraints

- **Tool section stays 100% client-side, no exceptions.** Nothing typed
  into the visit-prep tool is ever sent to a server.
- **Comments are never auto-published.** Every submission enters a
  moderation queue (`status: pending`) and is invisible to other visitors
  until a moderator sets `status: approved`. This is the primary safety
  mechanism for the Community section — not the AI redaction pass (see
  below), which is an assist, not a substitute.
- **No account required to browse.** A lightweight display name (not
  necessarily email/auth) is enough to comment — pseudonyms encouraged,
  no real-name requirement.
- **No analytics or embeds that do session replay or field-level capture,**
  anywhere on the site, especially the Tool.
- **Accessibility:** respect `prefers-reduced-motion` with a non-animated
  fallback for all scroll content; full keyboard nav; alt text; sufficient
  contrast; reading order independent of scroll animation.
- **Every page carries a visible disclaimer:** educational, not medical
  advice, does not replace consultation with a healthcare provider.
- **Community section specifically also includes:** a visible "Report"
  action on every comment, and a permanent, non-intrusive line linking to
  a crisis resource (e.g. Talk Suicide Canada) in that section's footer.

## Content Map (from the team's actual interview material)

### Home — Narrative scrollytelling beats

Build as 6 scroll-triggered beats, one idea per beat. Content below is
real material from Doc A — use as the actual copy, lightly edited for
beat-length, not placeholder text.

**3D staging note:** each beat below is one stop along the camera's
path (see `CLAUDE.md` tech stack for the React Three Fiber setup) —
abstract/geometric scene, not a literal illustration of the scene's
subject. Text overlays the 3D scene at each stop; it doesn't need to be
embedded in the 3D space itself.

1. **Hook — the emotional entry point.**
   > "A sinking feeling is what you feel first: I've had this before and
   > oh no, it's happening again." — Norma Washburn, AMR patient

   Frame the "rollercoaster" pattern Doc A describes: initial hope, then
   despair, encouragement, and back down again — establish this isn't a
   single bad day, it's a recurring emotional cycle.

2. **What AMR actually means — correcting the core misconception.**
   > "A common misconception is that the person has become resistant to
   > antibiotics. They haven't; the bacteria have."

   Pair with Norma's daughter's line about "superbug," and Dr.
   Blondel-Hill's provider-facing recommendation from Doc B: *"Reinforce
   that bacteria are resistant—not the patient."* This is the single
   highest-leverage correction in your whole site per the stigma
   literature — lead with it early, not buried.

3. **The patient-physician gap.**
   > "I want others to understand how I feel and stop long enough to
   > allow me to share how I feel instead of going straight into...the
   > treatment" — Sunny Loo, vasculitis patient

   Pair with Norma's point about physicians rushing and not explaining
   options/side effects, and Dr. Liu's observation (Doc B) that as
   physicians specialize, they debrief patients on basics less.

4. **Isolation — physical becomes social.**
   Cover: PPE for visitors, family members needing gowns/gloves before a
   visit, patients beginning to see themselves as "dirty" or contagious,
   distancing from partners and family out of fear of transmission. Note
   this is the beat that maps directly to your "partner moves the bed,
   grandma stops visiting" framing — it's already documented in Doc A,
   not something you need to source separately. Close with: both Norma
   (church/prayer) and Sunny (online gaming with friends) found their own
   workarounds, and both told you a real patient community doesn't
   currently exist — this is the direct setup for your Community section.

5. **Treatment has to fit a life.**
   Repeat appointments, geographic access disparities, Norma collapsing
   from the volume of hospital visits, IV-vs-oral treatment practicality.

6. **Closing — call to whole-person care.**
   > "We fail to address the whole person." — Norma

   > "When we talk about our experience, we are just asking to be
   > understood, to be supported." — Sunny Loo

   Transition directly into Learn / Tool / Community.

Generalization note: after beat 6, one short additional beat noting this
pattern (mechanism → dismissal → isolation → burden) shows up across AMR
conditions broadly, with your diagnostic-device work as one concrete,
detailed example — not a separate full narrative track per condition.

### Learn — Article stubs

Source from Doc B's provider synthesis. Suggested first four articles:

1. **"What Antimicrobial Resistance Actually Means"** — the mechanism,
   correcting the "I am resistant" misconception (Blondel-Hill quote
   above; Hancock's point that public understanding is limited because
   antibiotics still usually work in practice, masking the problem).
2. **"Why Isolation Precautions Feel Personal"** — what precautions are
   for, Blondel-Hill's recommendation that providers explain precautions
   *before* they happen and reassess whether they're still needed
   (her "future thoughts" on timely de-isolation reassessment).
3. **"The Psychosocial Side of AMR: What Providers Are Seeing"** —
   synthesize the shared findings from Doc B across Hancock, Lester,
   Blondel-Hill, Liu, Lesley Kooner, and Mroz: anxiety, stigma, fear of
   transmission, and the shared conclusion that psychosocial burden is
   "important and overlooked."
4. **"Who Faces Greater Risk"** — Hancock's note on populations at
   elevated AMR risk (women, catheterized/wheelchair-bound patients).

Cite the two real academic sources from Doc A's works-cited list at the
bottom of the Learn landing page:
- Crago et al. (2022), *Canada Communicable Disease Report* 48(11/12) —
  public knowledge/attitudes on AMR and antibiotic use.
- Mellinghoff et al. (2026), *Clinical Microbiology and Infection*
  32(8), 1244–1249 — ethical implications of coping with isolation for
  multidrug-resistant organisms.

Build as `src/content/learn/*.md`, rendered as a list + individual post
pages. Editing happens through the Decap CMS admin UI (see Admin section
below), not by hand-editing files in the repo.

### Stories — Curated testimonials

Doc A already contains this section's core content, attributed:
- Norma Washburn (full quotes throughout Doc A)
- Sunny Loo, vasculitis patient (full quotes throughout Doc A)

**Before publishing these under full name:** confirm with whoever ran
these interviews that Norma and Sunny consented specifically to public
attribution by name on a website, not just to being interviewed for the
project's internal research/documentation. Doc A reads like it was
already drafted for public use (full Works Cited, attributed quotes),
which suggests this was likely already handled — but it's a two-minute
confirmation worth doing before this goes live under real names.

### Community — Moderated comments

New section. Design:

- **Submission flow:** visitor writes a comment → (optional) sets a
  display name/pseudonym → submits → stored with `status: pending`,
  not visible to other visitors yet.
- **AI-assist pass:** run the pending comment through an LLM call with a
  prompt instructing it to flag/suggest redactions for identifying
  details (names, specific employer, specific small-town/rare-diagnosis
  combinations). Surface these suggestions to a human moderator — do
  **not** auto-redact-and-publish. The AI pass catches structured PII;
  it will not catch distress content (see Doc A's own material — Norma
  describing collapsing from exhaustion is exactly the kind of content a
  PII filter wouldn't flag but a human moderator would want to see).
- **Human moderator approves, edits, or rejects** before `status`
  changes to `approved` and the comment becomes publicly visible.
- **Report button** on every published comment, routing to the same
  moderation queue for re-review.
- **Footer note** on this section with a link to a crisis resource
  (e.g. Talk Suicide Canada).
- Backend: **Supabase** is a good fit — managed Postgres, built-in Row
  Level Security so `pending` rows are genuinely unqueryable by the
  public (not just hidden in the UI), minimal setup for a small team.

### Admin / Content Management

Two separate admin surfaces, matched to the two kinds of content — do not
build one custom system to cover both, it's more work for a worse result
than using what each stack already provides.

- **Learn articles + Stories + Team roster (static markdown content):**
  add [**Decap CMS**](https://decapcms.org) (free, open source,
  git-based). It gives editors a simple web form UI to add/edit markdown
  entries — including image upload fields for the Team collection's
  photos — and submissions commit directly to the repo, which triggers a
  normal redeploy on Vercel/Netlify. Authenticate via GitHub OAuth using
  each team member's existing GitHub login — don't stand up a separate
  auth system for this. Access is controlled the same way repo access
  already is: whoever is a collaborator on the GitHub repo can log into
  the CMS.
- **Community moderation queue:** use **Supabase Studio's built-in table
  editor** as the moderator's interface for the MVP — it already exists,
  already has auth (your Supabase project login), and already lets a
  moderator view `pending` rows, edit content, and flip `status` to
  `approved`/`rejected`. Access is controlled via Supabase project
  membership (add each moderator as a project member).
  - **Phase 2, only if the raw table editor turns out to be too
    unwieldy in practice:** a minimal custom page — a protected route
    listing pending comments with Approve/Reject buttons — can replace
    this later. Don't build it up front; it's added scope for a problem
    you don't know you have yet.
- **Who has access** is a team-management decision, not a build task:
  decide now which team members get GitHub-collaborator access (Learn/
  Stories editing) and which get Supabase project-member access (comment
  moderation) — they don't have to be the same people.

### Team

Real content and photos supplied by the team — build this exactly as
given below. **Architecture change from earlier draft:** don't hardcode
these six people as JSX/component content. Model the team roster as a
Decap CMS collection (`src/content/team/*.md`, one file per person —
same pattern as Learn articles), with fields: photo (image upload),
name, role, quote. The Team page renders whatever entries exist in that
collection. This means any card — not just the incomplete one — can be
added, edited, or have its photo swapped later without a code change,
which is the general form of what you actually need for your own card
right now.

**Header:** "The six people reading your story"

**Subhead:** "We're the Human Practices subteam of iGEM UBC. If you
write to us, one of us answers. There's no inbox in between."

Five of the six entries below have finished content — seed these into
the CMS collection now. **Ali Mohammad Yazdani's entry: leave the photo
and quote fields empty.** He'll fill them in himself later through the
Decap admin panel, no code change needed.

**Empty-card behavior:** don't render a card with the literal fallback
strings ("Year and major" / "One honest line about why this project
matters to them.") live on the public site — that reads as a bug, not
an intentional state. Default to simply not rendering a card until its
photo and quote fields are both filled in, so the live grid shows five
complete cards until Ali adds his, then six. (If you'd rather show a
placeholder state instead of hiding it, that's a fine alternative — just
make it an intentional "bio coming soon" design, not the raw template
text.)

1. **Zahra Savoji** — *Third-year neuroscience*
   > "This project is invaluable for me because of my deep passion in
   > connecting with patients meaningfully in ways that provide them
   > with compassionate and inclusive care."

2. **Ali Mohammad Yazdani** — *(left empty — to be filled in via the
   admin panel)*

3. **Julia Kim** — *Second-year neuroscience*
   > "Having grown up across different countries, I've seen firsthand
   > how healthcare access and communication vary wildly depending on
   > where you are, which is why inclusive, patient-centered research
   > matters so much to me."

4. **Daniel Rostin** — *Second-year pharmaceutical sciences*
   > "This project is important to me because it combines scientific
   > innovation with education and raising awareness about
   > antimicrobial resistance, showing the importance of patient-centred
   > research."

5. **Rachael Zhang** — *Third-year microbiology and immunology*
   > "This project is important to me because I believe empowering
   > young people with knowledge about AMR and equitable access to care
   > can create a lasting impact on our community."

6. **Denzel Hu** — *Fourth-year microbiology and immunology*
   > "As a child of immigrants who struggled to navigate a foreign
   > healthcare system, access to healthcare holds profound meaning to
   > me. iGEM's HP team brings an amazing opportunity to give care to
   > those who need it."

**Callout box — "iGEM, in one paragraph":**
> "iGEM is an international competition where student teams spend a
> year building something in synthetic biology. Every team has a Human
> Practices group whose job is to ask whether the thing being built is
> actually wanted, and by whom. That's us."

Below the callout: a photo of the global iGEM community at the Grand
Jamboree, captioned "The global iGEM community at the Grand Jamboree."

**Photo assets for the five finished entries:** source these from
wherever this design currently lives (Figma/Framer export or an
existing site) and upload them into the CMS collection as its seed
content — don't hand-place files directly in the repo, since these
should also be swappable later through the same admin flow as Ali's.

### Mission

**Header:** "What we're doing, and why"

**Subhead:** "Three stages, in order. The literature search is
finished; we're at the start of the second one, which is where you come
in."

**01 — The problem**
> Antimicrobial resistance is usually counted: prescriptions written,
> resistant samples, days in hospital, dollars. British Columbia has
> some of the best of that data anywhere: nineteen years of it,
> fifty-one million prescriptions, a stewardship programme that cut
> antibiotic use in small children by more than half. It is genuinely
> good work, and it describes an organism rather than a person.
>
> We spent this spring reading everything we could find on the other
> side of it, and three things stood out. Most of what exists comes
> from hospital samples, which systematically misses the people least
> likely to end up in a hospital record. The studies that do ask
> patients directly are small, scattered across different countries and
> different infections, and almost none of them are from BC. And the
> same barriers keep surfacing in all of them anyway: shame, isolation,
> silence, cost, and the plain fact that nobody explained the diagnosis.
>
> The burden also falls unevenly. Our review kept landing on the same
> groups: people in long-term care, people experiencing homelessness,
> refugees, Indigenous communities living with underfunded
> infrastructure, cancer patients, newborns, and the healthcare workers
> alongside them. Resistance follows the fault lines that were already
> there. That makes it an equity problem, not just a microbiology one.

**02 — What we're doing**
> The reading is done, and we've been learning from people who know
> this from the inside. Dr. Bob Hancock, Canada Research Chair in
> Health and Genomics at UBC, walked us through the science and where
> public understanding of it falls short. Dr. Richard Lester, an
> infectious disease physician, showed us how this looks from the
> clinic. And Sunny Loo, who lives with vasculitis and long-term
> antibiotic dependency and is a patient partner on the BC Antimicrobial
> Stewardship Program, has been shaping what we ask, and how we ask it.
> Now we're going to the people the papers are about.

- **Ask the people it happened to.** Surveys, one-to-one interviews and
  written accounts, from patients, from the family and friends who
  looked after them, and from the nurses and physicians who treat these
  infections in BC.
- **Name the barriers, in their words.** Turn what we hear into an
  honest map of the psychosocial barriers people actually run into,
  starting from what exists in each community rather than what it
  lacks.
- **Fix the explaining problem.** With UBC Geering Up we're building
  AMR teaching for school-age students, and we publish patient and
  clinician interviews on our social channels, because "nobody told me"
  came up too often to ignore.
- **Take it back to the bench.** Use the map to steer our own team's
  laboratory work, and publish the whole thing in plain language, free
  to read, for patients as well as researchers.

**03 — What we hope changes**
> That a patient with a resistant infection gets asked how they're
> coping, not only how the wound looks. That nobody spends a week in an
> isolation room without being told why, in words they can use with
> their own family. That BC has patient-side evidence at all, so the
> next strategy written here can be built for the people it lands
> hardest on, rather than around them. And that the next team of
> students designing something for AMR starts by reading what patients
> said, because it exists and it's easy to find.
>
> We're one undergraduate team with one season. We're not going to fix
> this. We can make the human side of it harder to overlook.

**Callout box — "Stage two only works if people talk to us":**
> "Everything above depends on hearing from people who have lived it.
> If you have, ten minutes of your time changes what we're able to
> say."

Button: **"Share your experience"**

**Note on the "Share your experience" button:** based on the surrounding
copy ("surveys, one-to-one interviews and written accounts"), this reads
as a call to participate in the team's ongoing IHP research — i.e. it
should link to whatever intake method the team is using to recruit
interview/survey participants (a contact form, email, or survey tool),
not to the site's public Community comment section, which is a different
audience (general AMR patients/public) with a different purpose (peer
support, not research recruitment). Confirm which intake method this
should point to before wiring the button.

---

Tech stack, build order, and scope live only in `CLAUDE.md` at the repo
root — not duplicated here. If anything in this file appears to
conflict with `CLAUDE.md` on those points, `CLAUDE.md` is authoritative.
