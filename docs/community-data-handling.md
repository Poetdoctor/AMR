# Community: what we store, and how contact information is handled

For review by the team's supervisor. Prepared 2026-10-07.

The site has one part that stores anything people type: the Community
section, where people living with antimicrobial-resistant infections can
share their experience and reply to each other. Reviewers asked that a
supervisor look at how it handles personal and contact information before
it is relied on. This document sets out what the section stores, what
people are told, and the decisions we would like you to check.

The rest of the site stores nothing. The visit-preparation worksheet runs
entirely in the reader's browser, and there is no analytics or tracking
anywhere.

## What people are told before they post

Every page where someone can write shows this notice:

> **Everything posted here is public.** Anyone on the internet can read it.
> You appear only under a name made up for you. Leave out your real name,
> contact details and anything else that could identify you or someone else
> — once it is posted, who sees it is out of our hands.

Nothing can be posted until this box is ticked. It is unticked again for
every post:

> I have read the community guidelines and terms of use. I understand that
> what I post is public, and that any personal or contact information I
> choose to include will be visible to everyone and out of the team's
> control.

The full guidelines and terms are at `/community/guidelines` on the site.
The source is `src/content/community/guidelines.md`, and your edits can go
straight there.

## Our position on contact information

- We do not ask for contact details, and we advise people not to share them.
- If someone chooses to share their **own** contact details after accepting
  the terms, we allow it. The terms tell them it is public, that it is out of
  our control once posted, and that we may remove it if it looks like
  someone else's or looks unsafe.
- Nobody may post **someone else's** contact details. Anyone can report
  this ("It shares personal or contact information").
- Nothing automatic detects contact details today. Moderators find them at
  the daily review or through reports.

**This is the main thing we would like you to confirm or change.** The
cautious alternative is for moderators to remove all contact details by
default, even ones people chose to share.

## What is stored

| What | Where | Who can see it | How long |
| --- | --- | --- | --- |
| Story and comment text, title, tags, content warning | Our database (Supabase) | Anyone, while published | Until the author or a moderator deletes it. There is no automatic expiry. |
| Made-up username (e.g. MapleGrove123) and when it was created | Our database | Anyone | As long as the person's posts exist |
| Reactions, and which community someone joined | Our database | Anyone, as counts and usernames | Until removed |
| Saved stories | Our database | Only that person | Until removed |
| Reports: reason, optional note, which username made it | Our database | Moderators only | Until the reported item is deleted |
| Moderation record: status, who reviewed, when | Our database | Moderators only | Until the item is deleted |
| A random session key that allows someone to delete their own posts | The person's own browser | Only that browser | Until they clear their browser data |
| Anonymous sign-in records, normally including IP address and browser type | Supabase's authentication logs | Supabase project members | Supabase's retention (not yet checked) |
| Routine web server logs | Netlify (site hosting) | Netlify account members | Netlify's retention |

**Not collected anywhere:** real names, email addresses, phone numbers,
home addresses, health records, or analytics of any kind. There are no
accounts and no profiles beyond the made-up username.

**Health information.** We do not collect health records, but people's
stories are about their health by nature, and some tags describe health
conditions (for example "Immunocompromised", "Sepsis experience"). This is
information people choose to publish, under a made-up name, after being
told it is public.

## Who moderates, and how

- Moderation is credited publicly to "the website administration". No
  individual is named on the site.
- Moderators are members of the team's Supabase project. They review
  everything new each day and record who reviewed it and when.
- Posts appear immediately. Something is hidden before review in three
  cases:
  - two different people report it;
  - the author reports it as "This is mine and I want it removed";
  - in an emergency, the team flips a switch so new posts wait for approval.
- People can contact the website administration at
  **humanpractices@ubcigem.com** for removal requests and questions.

## How someone gets something removed

1. **Themselves, straight away.** They delete it from the same browser. It is
   deleted from the database, not just hidden.
2. **Through the site.** They report it as "This is mine and I want it
   removed". It is hidden immediately, and a moderator deletes it at the next
   review.
3. **By email,** to humanpractices@ubcigem.com. This also covers someone
   whose details were posted by another person.

## Questions for you

1. **Contact information.** Is it acceptable to allow people to share their
   own contact details once they have consented, or should moderators remove
   them by default?
2. **Age.** Should the terms set a minimum age, and if so, what?
3. **Retention.** Should posts, reports and moderation records be deleted
   after a set period?
4. **Recording consent.** At present, consent is enforced on the page only,
   and nothing records which version of the terms someone agreed to or when.
   Should it be stored with each post?
5. **Where the data is held.** Which region the Supabase project is hosted in
   has not been checked. If the project counts as a UBC activity, BC's
   privacy law for public bodies (FIPPA) may set requirements about storing
   personal information outside Canada. Does it apply here?
6. **The inbox.** Who reads humanpractices@ubcigem.com, and how quickly
   should removal requests be answered?
7. **The terms themselves.** Please read `/community/guidelines`. The
   wording is a first draft written by the team.

## Known gaps, not yet fixed

These came up while preparing this document. They are recorded here so that
nothing above overstates what the system does.

- **Automatic screening is not running.** The design includes an automatic
  check that flags identifying details for moderators. Since the database
  was redesigned on 2026-08-31, that check points at a table that no longer
  exists, so nothing is screened. Moderators should treat every post as
  unchecked.
- **The nightly clean-up job would fail** for the same reason, if it is
  scheduled. It was meant to delete short-lived technical records, such as
  the salted hash of an IP address used for rate limiting.
- **Older "members only" stories.** Stories can no longer be posted as
  members-only. A few older ones may exist, and their authors cannot see them
  unless they have joined the community.
