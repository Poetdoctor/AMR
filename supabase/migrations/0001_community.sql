-- =============================================================================
-- Community: moderated comments.
--
-- Comments publish on submit and a human sweeps daily (team decision,
-- 2026-08-26). Because nothing reads a comment before the public does, the
-- rules in this file ARE the safeguard — not the front end, and not the edge
-- functions. Anything enforced only in application code can be bypassed by
-- anyone holding the anon key, which is public by design.
--
-- Three principles this file follows:
--   1. Default deny. Revoke everything, then grant exactly what is needed.
--   2. The database decides status, not the caller. A trigger sets it on
--      insert, so no client -- including one using the service role -- can
--      insert a pre-swept, pre-screened or force-published row.
--   3. Anything identifying that is not the comment itself lives in the
--      `private` schema, which PostgREST does not expose at all.
-- =============================================================================

create schema if not exists private;

-- -----------------------------------------------------------------------------
-- Types
-- -----------------------------------------------------------------------------
create type public.comment_status as enum ('published', 'removed', 'held');

-- Drawn from the recurring patterns in the team's own interviews, not invented
-- categories. See docs/doc-a-* and docs/doc-b-*.
create type public.comment_theme as enum (
  'being_explained_to',   -- nobody explained the diagnosis, the drug, the plan
  'isolation',            -- precautions turning physical distance into social distance
  'treatment_and_life',   -- appointments, travel, work, the shape of a life
  'cost_and_access',      -- what it costs, and how far away it is
  'coping_and_support',   -- what people found for themselves
  'other'
);

-- -----------------------------------------------------------------------------
-- Kill switch
--
-- One row. Flip `auto_publish` to false in Supabase Studio and new comments are
-- held for approval instead of published, in about five seconds, with no
-- deploy. Everything downstream already handles both states.
-- -----------------------------------------------------------------------------
create table public.community_settings (
  id           boolean primary key default true check (id),
  auto_publish boolean not null default true,
  updated_at   timestamptz not null default now()
);
insert into public.community_settings (id) values (true);

comment on table public.community_settings is
  'Single-row kill switch. auto_publish=false holds new comments for approval.';

-- -----------------------------------------------------------------------------
-- Comments
-- -----------------------------------------------------------------------------
create table public.comments (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  display_name      text,
  body              text not null,
  theme             public.comment_theme  not null default 'other',
  status            public.comment_status not null default 'published',

  -- SHA-256 of a random token held in the author's browser. Lets someone delete
  -- their own comment with no account. Never exposed to anon.
  delete_token_hash text,

  -- Screening output. Moderator-facing only.
  ai_flags          jsonb,
  screened_at       timestamptz,

  -- The daily sweep. A null swept_at means no person has read this yet, which
  -- is what makes "is the rota actually happening?" an answerable question.
  swept_at          timestamptz,
  swept_by          text,
  moderator_note    text,

  report_count      int not null default 0,

  constraint body_length         check (char_length(body) between 20 and 4000),
  constraint display_name_length check (display_name is null or char_length(display_name) <= 40)
);

comment on column public.comments.delete_token_hash is
  'SHA-256 of the author''s browser token. Enables self-deletion without accounts.';
comment on column public.comments.swept_at is
  'Null means no human has reviewed this comment yet.';

-- Serves the public list: newest published first, optionally filtered by theme.
create index comments_public_idx  on public.comments (created_at desc) where status = 'published';
-- Serves the moderator queue.
create index comments_unswept_idx on public.comments (created_at)      where swept_at is null;

-- -----------------------------------------------------------------------------
-- The database decides status, not the caller.
--
-- Runs on every insert regardless of role, so a compromised or buggy edge
-- function still cannot publish while the kill switch is off, nor insert a row
-- that claims to have already been screened or swept.
-- -----------------------------------------------------------------------------
create or replace function public.apply_publish_policy()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.status := case
    when (select auto_publish from public.community_settings where id) then 'published'
    else 'held'
  end::public.comment_status;

  -- Fields only this database may set.
  new.ai_flags     := null;
  new.screened_at  := null;
  new.swept_at     := null;
  new.swept_by     := null;
  new.report_count := 0;
  new.created_at   := now();
  return new;
end;
$$;

create trigger comments_publish_policy
  before insert on public.comments
  for each row execute function public.apply_publish_policy();

-- -----------------------------------------------------------------------------
-- Reports
--
-- The report row itself holds nothing about who sent it. Telling two reporters
-- apart is necessary for the "two independent reports" rule, so a daily-salted,
-- non-reversible fingerprint lives in `private` instead, and is purged.
-- -----------------------------------------------------------------------------
create table public.reports (
  id         uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  reason     text not null check (reason in ('identifying','abusive','distressing','spam','other')),
  detail     text check (detail is null or char_length(detail) <= 500),
  handled_at timestamptz
);

create table private.report_fingerprints (
  comment_id uuid not null references public.comments(id) on delete cascade,
  ip_hash    text not null,
  created_at timestamptz not null default now(),
  primary key (comment_id, ip_hash)
);

create table private.submission_throttle (
  ip_hash      text primary key,
  window_start timestamptz not null default now(),
  count        int not null default 1
);

-- -----------------------------------------------------------------------------
-- Auto-hide on report.
--
-- Hides immediately when the screening pass had already flagged the comment as
-- high-risk or urgent -- a genuinely harmful comment is usually one the screen
-- also noticed, so it disappears on the first report. Otherwise it takes two
-- distinct fingerprints, which is hard for one person to fake and unlikely to
-- be coordinated at this scale. A moderator reviews and can restore either way.
-- -----------------------------------------------------------------------------
create or replace function public.apply_report_policy()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  distinct_reporters int;
  was_flagged        boolean;
begin
  select count(*) into distinct_reporters
    from private.report_fingerprints f where f.comment_id = new.comment_id;

  select coalesce(
           (c.ai_flags -> 'overall' ->> 'suggest_urgent_review')::boolean, false)
         or (c.ai_flags -> 'overall' ->> 'reidentification_risk') = 'high'
    into was_flagged
    from public.comments c where c.id = new.comment_id;

  update public.comments
     set report_count = report_count + 1,
         status = case
           when status = 'published'
            and (coalesce(was_flagged, false) or distinct_reporters >= 2)
           then 'removed'::public.comment_status
           else status
         end
   where id = new.comment_id;

  return new;
end;
$$;

create trigger reports_apply_policy
  after insert on public.reports
  for each row execute function public.apply_report_policy();

-- =============================================================================
-- Access control
-- =============================================================================

-- 1. Default deny. Supabase grants the anon role broad access to new tables in
--    the public schema, so take it back before granting anything deliberately.
revoke all on public.comments            from anon, authenticated;
revoke all on public.reports             from anon, authenticated;
revoke all on public.community_settings  from anon, authenticated;
revoke all on schema private             from anon, authenticated;
revoke all on all tables in schema private from anon, authenticated;

alter table public.comments           enable row level security;
alter table public.reports            enable row level security;
alter table public.community_settings enable row level security;

-- 2. WHICH ROWS. Published only -- a removed or held comment is not returned to
--    anyone, by any query, from any client. There is no insert, update or
--    delete policy for anon, and absent a policy the answer is no. Every write
--    goes through an edge function using the service role.
create policy "public reads published comments"
  on public.comments for select to anon
  using (status = 'published');

-- 3. WHICH COLUMNS. The flags, the moderator's notes, the report count, the
--    status and the author's delete-token hash stay unreachable even on a
--    published row.
grant select (id, created_at, display_name, body, theme)
  on public.comments to anon;

-- Reports and settings are entirely write-only / invisible to the public.
-- No policies, no grants: reporting goes through an edge function too.

-- =============================================================================
-- Moderator surface
--
-- Supabase Studio is the moderation UI for now (content spec: do not build a
-- custom panel before knowing whether the table editor is painful). This view
-- makes Studio genuinely usable by flattening the screening JSON into columns
-- and sorting worst-first, so a moderator with fifteen minutes reads the three
-- comments that need them rather than the forty that do not.
-- =============================================================================
create view private.sweep_queue as
  select
    c.id,
    c.created_at,
    c.status,
    c.theme,
    c.display_name,
    c.body,
    case
      when c.screened_at is null then 'NOT SCREENED'
      else c.ai_flags -> 'overall' ->> 'reidentification_risk'
    end as risk,
    coalesce((c.ai_flags -> 'overall' ->> 'suggest_urgent_review')::boolean, false) as urgent,
    jsonb_array_length(coalesce(c.ai_flags -> 'identifying_details', '[]'::jsonb)) as identifying,
    jsonb_array_length(coalesce(c.ai_flags -> 'distress_details',    '[]'::jsonb)) as distress,
    c.report_count,
    c.ai_flags,
    c.swept_at,
    c.swept_by
  from public.comments c
  where c.swept_at is null
     or c.report_count > 0
     or c.status = 'held'
  order by
    c.report_count desc,
    coalesce((c.ai_flags -> 'overall' ->> 'suggest_urgent_review')::boolean, false) desc,
    c.created_at;

comment on view private.sweep_queue is
  'The daily sweep. Worst first. Empties only when a person sets swept_at.';

-- Housekeeping: fingerprints and throttle rows are only useful while fresh.
create or replace function private.purge_transient()
returns void
language sql
security definer
set search_path = private
as $$
  delete from private.report_fingerprints where created_at < now() - interval '7 days';
  delete from private.submission_throttle  where window_start < now() - interval '2 days';
$$;
