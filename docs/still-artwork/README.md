# The still-narrative illustrations

Eleven square illustrations, one per beat of the Home narrative, drawn
to [`../still-artwork-brief.md`](../still-artwork-brief.md). See
`contact-sheet.png` for the whole set in narrative order.

**These shipped.** They live in `public/stills/` as WebP at 896 × 896
and are wired into `ARTWORK` in
`src/components/home/SceneStill.tsx`. The hand-drawn SVG scenes in that
same file are still there and still work — they render for any beat
without an image, so removing an entry from `ARTWORK` falls back
cleanly rather than leaving a hole.

## How they were made

**Generated, not commissioned.** Beat 1 was generated first and then
used as a style reference for the other ten, which is what holds the
set together — prompting each beat independently produces eleven
different illustrators. Beat 8 was generated twice; the first attempt
had no person in it and lost the comparison the beat is built on.

The source design is in the team's Canva account:
`DAHWEYK08-g`, "AMR still-narrative illustrations" — eleven pages at
1080 × 1080, one illustration each, exported at 896 for the site. To
change one, replace that page's image and re-export, or generate a
fresh image and put it through the same conversion.

**This should be disclosed.** The site's argument is that these are
real accounts handled carefully, and a reviewer who works out that the
artwork was generated has been handed a reason to doubt that. A line in
the site credits costs nothing and removes the problem. Undisclosed is
the version that costs the project something.

If the team later commissions a human illustrator, the brief still
stands and these become reference: drop new files into `public/stills/`
under the same names and nothing else changes.

## What the set established

Worth keeping whoever works on these next:

- **The palette is enough.** Cream ground, two browns, one burnt-orange
  accent. No image needed a fourth colour.
- **The accent marks the patient.** In beats 4, 6, 10 and 11 the orange
  is the person the beat is about, and it is the fastest way to find
  them in the frame.
- **The figure works as a silhouette at any size.** Circle and rounded
  rectangle, no features, and posture still carries the beat.
- **Restraint reads as seriousness.** The strongest images are the
  emptiest ones.
- **Detail that matters is invisible at thumbnail size.** Beat 7's
  connecting lines and beat 11's distant figures do not exist at 200px.
  Judge these at full size.

## Notes on individual beats

**8 · The monster is a word** — the figure is at lower left with an
enormous shadow sweeping up behind it and a single orange dot at its
feet. The organism is the smallest mark in the picture, which is the
argument: the fear is vastly larger than the thing. Do not let a
redraw make the bacterium interesting.

**11 · And it was never one person** — this came out architectural
rather than the "warm lights receding" the brief asked for: lit
doorways in a dark structure, dozens of small figures standing in them
going back to the horizon. It is further from its brief than any other
image, and it is the most affecting one in the set. Kept deliberately.

**4 · The hospital that doesn't see you** — the walking figures are
mid-stride and incidental rather than hostile, which is what keeps the
beat from blaming clinicians. Nobody in it is doing anything wrong, and
that is the easiest thing to lose in a redraw.

## Constraints anything replacing these must meet

- **896 × 896 WebP**, opaque, on the card ground `#f4ecdb`.
- **Under 120 KB each, 900 KB for the set.** Enforced by
  `scripts/check-bundle.mjs`; the build fails over either. The current
  set is 752 KB, largest image 74.8 KB.
- **Alt text is required** by the type in `SceneStill.tsx`, and
  `npm run smoke` fails on an image without it. Describe what is shown,
  not what it means — the beat's words already carry the meaning.
- **No text in the artwork.** The words beside it are set in five
  languages; a word baked into an image stays English in four of them.
