# Community backend

Everything the Community section needs, and the order to set it up in. The
design and the reasoning behind each choice are in the phase 6 design document;
this is the operational half.

## What is here

```
migrations/0001_community.sql   Schema, RLS, grants, triggers, moderator view
tests/00_roles.sql              Recreates Supabase's roles so tests run anywhere
tests/01_access.sql             The assertions that must hold. Negative-tested.
functions/submit-comment        Accepts a comment, rate-limits, screens in the background
functions/delete-comment        Author self-deletion, proved by a browser token
functions/report-comment        Reporting; the database decides what a report does
functions/sweep-nudge           Daily Discord nudge when comments go unread
```

## Setting it up

**1. Create the project** at supabase.com. Note the project URL and the two keys
under Project Settings → API.

**2. Run the migration.** Supabase Studio → SQL Editor → paste
`migrations/0001_community.sql` → Run.

**3. Set the function secrets** (Project Settings → Edge Functions → Secrets):

| Secret                | Value                                                           |
| --------------------- | --------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`   | From console.anthropic.com. Billed to the team.                 |
| `FINGERPRINT_SALT`    | Any long random string. Makes rate-limit hashes non-reversible. |
| `SITE_ORIGIN`         | `https://your-site.netlify.app` — locks CORS to your site.      |
| `DISCORD_WEBHOOK_URL` | Channel Settings → Integrations → Webhooks → New.               |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.

**4. Deploy the functions:**

```bash
npx supabase link --project-ref <your-ref>
npx supabase functions deploy submit-comment delete-comment report-comment sweep-nudge
```

**5. Set the site's environment variables** in Netlify (Site configuration →
Environment variables) — `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Both
are public and belong in the bundle. See `.env.example` for what must never go
there.

**6. Schedule the nudge.** Studio → SQL Editor:

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule('community-sweep-nudge', '0 17 * * *', $$
  select net.http_post(
    url     := 'https://<your-ref>.supabase.co/functions/v1/sweep-nudge',
    headers := '{"Authorization": "Bearer <your-anon-key>"}'::jsonb
  );
$$);

-- Housekeeping: fingerprints and throttle rows are only useful while fresh.
select cron.schedule('community-purge', '30 3 * * *', $$select private.purge_transient()$$);
```

**7. Add the moderators.** Project Settings → Team → Invite. Give them the
**Developer** role, not Owner or Administrator — enough to read and edit rows,
not enough to delete the project or rotate keys.

## Moderating

Studio → Table Editor → schema `private` → `sweep_queue`. Sorted worst-first:
reported comments, then anything the screening pass marked urgent, then oldest.

For each comment: read it, edit `body` if it needs redacting, set `status` to
`removed` if it should go, then **set `swept_at` to now and `swept_by` to your
name**. That last step is what empties the queue and what makes "has anyone
actually been doing this?" answerable.

`risk` showing `NOT SCREENED` means the screening call did not complete — read
that comment as though nothing had checked it, because nothing has.

## The kill switch

```sql
update public.community_settings set auto_publish = false;
```

New comments are then held for approval instead of published, in about five
seconds, with no deploy. Set a held comment's `status` to `published` to release
it. Flip it back to `true` when the incident is over.

## Testing

```bash
npm run test:db     # needs Docker running, or set DATABASE_URL
```

Applies the migration to a throwaway Postgres and asserts that a holder of the
anon key cannot read a removed comment, read the moderator's columns, insert,
edit, delete, republish, report directly, reach the private schema, or flip the
kill switch — and that the triggers behave. These assertions have been
negative-tested: widening the RLS policy or granting anon one extra column each
make the suite fail with a specific message. It runs in CI on every push.
