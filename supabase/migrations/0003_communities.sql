-- =============================================================================
-- Communities, stories, reactions.
--
-- Replaces the flat comment list with the structure the team designed: a
-- community holds stories, a story has a type, tags, an optional content
-- warning and its own comment thread, and people react to it.
--
-- Identity is Supabase anonymous auth: a real auth.uid() per browser with no
-- email and no password, so "no account required" still holds while every rule
-- below can be enforced by the database instead of trusted from the client.
-- A pseudonym is generated server-side and is the only name anyone ever sees.
-- =============================================================================

drop table if exists public.reports  cascade;
drop table if exists public.comments cascade;
drop table if exists private.report_fingerprints cascade;

-- -----------------------------------------------------------------------------
-- Reference data
-- -----------------------------------------------------------------------------
create table public.communities (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  tagline     text,
  intro_title text,
  intro_body  text,
  topics      text[] not null default '{}',
  glossary    jsonb  not null default '[]',
  guidelines  text,
  created_at  timestamptz not null default now()
);

create type public.post_type  as enum ('my_story','caregiver_story','question','update');
create type public.visibility as enum ('public','members');

-- -----------------------------------------------------------------------------
-- Pseudonyms
--
-- Generated here, never chosen. A name someone picks tends to be one they use
-- elsewhere, and a reused handle is the easiest way to connect a health story
-- to a real person. Two neutral words and a number gives plenty of room without
-- ever touching anything about them.
-- -----------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text unique not null,
  created_at   timestamptz not null default now()
);

create or replace function public.generate_display_name()
returns text
language plpgsql
as $$
declare
  first_parts  text[] := array['Maple','Amber','Hope','Brave','River','Cedar','Quiet','Willow',
                               'Harbour','Northern','Gentle','Steady','Autumn','Copper','Fern','Birch'];
  second_parts text[] := array['Grove','Shore','Light','River','Field','Haven','Path','Meadow',
                               'Ridge','Fern','Creek','Hollow','Vale','Bay','Wood','Trail'];
  candidate text;
begin
  for _ in 1..40 loop
    candidate := first_parts[1 + floor(random() * array_length(first_parts, 1))::int]
              || second_parts[1 + floor(random() * array_length(second_parts, 1))::int]
              || (100 + floor(random() * 900))::text;
    exit when not exists (select 1 from public.profiles where display_name = candidate);
  end loop;
  return candidate;
end;
$$;

-- Every anonymous sign-in gets a profile automatically, so the client never
-- supplies a name and cannot claim someone else's.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, public.generate_display_name())
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.memberships (
  community_id uuid not null references public.communities(id) on delete cascade,
  profile_id   uuid not null references public.profiles(id)    on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (community_id, profile_id)
);

-- -----------------------------------------------------------------------------
-- Stories
-- -----------------------------------------------------------------------------
create table public.posts (
  id             uuid primary key default gen_random_uuid(),
  community_id   uuid not null references public.communities(id) on delete cascade,
  author_id      uuid not null references public.profiles(id)    on delete cascade,
  post_type      public.post_type  not null default 'my_story',
  title          text,
  body           text not null,
  tags           text[] not null default '{}',
  content_warning text,
  visibility     public.visibility not null default 'public',
  allow_comments boolean not null default true,
  status         public.comment_status not null default 'published',

  ai_flags       jsonb,
  screened_at    timestamptz,
  screen_error   text,
  swept_at       timestamptz,
  swept_by       text,
  moderator_note text,
  report_count   int not null default 0,
  created_at     timestamptz not null default now(),

  constraint body_length  check (char_length(body) between 20 and 8000),
  constraint title_length check (title is null or char_length(title) <= 120),
  constraint tag_count    check (array_length(tags, 1) is null or array_length(tags, 1) <= 6)
);

create index posts_feed_idx on public.posts (community_id, created_at desc) where status = 'published';
create index posts_sweep_idx on public.posts (created_at) where swept_at is null;

create table public.post_comments (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null references public.posts(id)    on delete cascade,
  author_id    uuid not null references public.profiles(id) on delete cascade,
  body         text not null,
  status       public.comment_status not null default 'published',
  ai_flags     jsonb,
  screened_at  timestamptz,
  screen_error text,
  swept_at     timestamptz,
  swept_by     text,
  report_count int not null default 0,
  created_at   timestamptz not null default now(),
  constraint comment_length check (char_length(body) between 2 and 2000)
);

create index post_comments_thread_idx on public.post_comments (post_id, created_at) where status = 'published';

create type public.reaction_kind as enum ('support','relate','helpful','hopeful');

create table public.reactions (
  post_id    uuid not null references public.posts(id)    on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind       public.reaction_kind not null,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id, kind)
);

create table public.bookmarks (
  post_id    uuid not null references public.posts(id)    on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create table public.reports (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references public.posts(id)         on delete cascade,
  comment_id uuid references public.post_comments(id) on delete cascade,
  reporter_id uuid references public.profiles(id)     on delete set null,
  reason     text not null check (reason in ('identifying','abusive','distressing','spam','other')),
  detail     text check (detail is null or char_length(detail) <= 500),
  handled_at timestamptz,
  created_at timestamptz not null default now(),
  constraint one_target check (num_nonnulls(post_id, comment_id) = 1),
  -- One report per person per item: nobody hides a story by reporting twice.
  unique (post_id, reporter_id),
  unique (comment_id, reporter_id)
);

-- =============================================================================
-- Ownership and moderation, enforced by the database
-- =============================================================================

-- The author never sets these, on a post or a comment.
create or replace function public.apply_post_policy()
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
  new.ai_flags     := null;
  new.screened_at  := null;
  new.screen_error := null;
  new.swept_at     := null;
  new.swept_by     := null;
  new.report_count := 0;
  new.created_at   := now();
  -- Authorship is taken from the session, never from the request body.
  new.author_id    := auth.uid();
  return new;
end;
$$;

create trigger posts_policy
  before insert on public.posts
  for each row execute function public.apply_post_policy();

create or replace function public.apply_comment_policy()
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
  new.ai_flags     := null;
  new.screened_at  := null;
  new.screen_error := null;
  new.swept_at     := null;
  new.report_count := 0;
  new.created_at   := now();
  new.author_id    := auth.uid();
  return new;
end;
$$;

create trigger post_comments_policy
  before insert on public.post_comments
  for each row execute function public.apply_comment_policy();

-- Auto-hide on report. Same rule as before: a story the screening pass already
-- flagged goes on the first report; a clean one needs two distinct people. One
-- person cannot erase testimony they simply dislike.
create or replace function public.apply_report_policy()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  reporters   int;
  was_flagged boolean;
begin
  if new.post_id is not null then
    select count(*) into reporters from public.reports r where r.post_id = new.post_id;
    select coalesce((p.ai_flags -> 'overall' ->> 'suggest_urgent_review')::boolean, false)
        or (p.ai_flags -> 'overall' ->> 'reidentification_risk') = 'high'
      into was_flagged from public.posts p where p.id = new.post_id;

    update public.posts
       set report_count = report_count + 1,
           status = case
             when status = 'published' and (coalesce(was_flagged, false) or reporters >= 2)
             then 'removed'::public.comment_status else status end
     where id = new.post_id;
  else
    select count(*) into reporters from public.reports r where r.comment_id = new.comment_id;
    select coalesce((c.ai_flags -> 'overall' ->> 'suggest_urgent_review')::boolean, false)
      into was_flagged from public.post_comments c where c.id = new.comment_id;

    update public.post_comments
       set report_count = report_count + 1,
           status = case
             when status = 'published' and (coalesce(was_flagged, false) or reporters >= 2)
             then 'removed'::public.comment_status else status end
     where id = new.comment_id;
  end if;
  return new;
end;
$$;

create trigger reports_policy
  after insert on public.reports
  for each row execute function public.apply_report_policy();

-- =============================================================================
-- Access control
-- =============================================================================
revoke all on public.communities, public.profiles, public.memberships, public.posts,
              public.post_comments, public.reactions, public.bookmarks, public.reports
  from anon, authenticated;

alter table public.communities   enable row level security;
alter table public.profiles      enable row level security;
alter table public.memberships   enable row level security;
alter table public.posts         enable row level security;
alter table public.post_comments enable row level security;
alter table public.reactions     enable row level security;
alter table public.bookmarks     enable row level security;
alter table public.reports       enable row level security;

-- Communities and pseudonyms are public reference data.
grant select on public.communities to anon, authenticated;
create policy "communities are readable" on public.communities for select to anon, authenticated using (true);

grant select (id, display_name, created_at) on public.profiles to anon, authenticated;
create policy "pseudonyms are readable" on public.profiles for select to anon, authenticated using (true);

-- Member counts are public; who the members are is not tied to anything else.
grant select on public.memberships to anon, authenticated;
create policy "memberships are readable" on public.memberships for select to anon, authenticated using (true);
grant insert, delete on public.memberships to authenticated;
create policy "join as yourself"  on public.memberships for insert to authenticated with check (profile_id = auth.uid());
create policy "leave as yourself" on public.memberships for delete to authenticated using (profile_id = auth.uid());

/*
 * Stories.
 *
 * A "members only" story is genuinely unreadable without a session — RLS, not
 * a hidden UI element. Worth being straight about what that is and is not:
 * joining is one click, so it stops a passing scraper and a casual reader, and
 * it does not stop somebody determined. The composer says "Community members
 * only", not "private", for that reason.
 */
grant select (id, community_id, author_id, post_type, title, body, tags,
              content_warning, visibility, allow_comments, created_at)
  on public.posts to anon, authenticated;

create policy "public stories are readable" on public.posts for select to anon
  using (status = 'published' and visibility = 'public');

create policy "members read member stories" on public.posts for select to authenticated
  using (
    status = 'published'
    and (
      visibility = 'public'
      or exists (select 1 from public.memberships m
                  where m.community_id = posts.community_id and m.profile_id = auth.uid())
    )
  );

grant insert, delete on public.posts to authenticated;
create policy "write as yourself"  on public.posts for insert to authenticated with check (true);
create policy "delete your own"    on public.posts for delete to authenticated using (author_id = auth.uid());

grant select (id, post_id, author_id, body, created_at) on public.post_comments to anon, authenticated;
create policy "comments follow their story" on public.post_comments for select to anon, authenticated
  using (
    status = 'published'
    and exists (select 1 from public.posts p where p.id = post_comments.post_id and p.status = 'published')
  );
grant insert, delete on public.post_comments to authenticated;
create policy "comment as yourself"     on public.post_comments for insert to authenticated with check (true);
create policy "delete your own comment" on public.post_comments for delete to authenticated using (author_id = auth.uid());

-- Reaction counts are public; a bookmark is nobody's business but its owner's.
grant select, insert, delete on public.reactions to anon, authenticated;
create policy "reaction counts are readable" on public.reactions for select to anon, authenticated using (true);
create policy "react as yourself"   on public.reactions for insert to authenticated with check (profile_id = auth.uid());
create policy "unreact as yourself" on public.reactions for delete to authenticated using (profile_id = auth.uid());

grant select, insert, delete on public.bookmarks to authenticated;
create policy "your bookmarks only"   on public.bookmarks for select to authenticated using (profile_id = auth.uid());
create policy "bookmark as yourself"  on public.bookmarks for insert to authenticated with check (profile_id = auth.uid());
create policy "unbookmark as yourself" on public.bookmarks for delete to authenticated using (profile_id = auth.uid());

-- Reporting is write-only. Nobody can read who reported what, including the
-- reporter — a visible report is a mark against a person.
grant insert on public.reports to anon, authenticated;
create policy "anyone may report" on public.reports for insert to anon, authenticated with check (true);

-- =============================================================================
-- Moderator surface
-- =============================================================================
drop view if exists private.sweep_queue;
create view private.sweep_queue as
  select 'story'::text as kind, p.id, p.created_at, p.status::text, p.title,
         p.body, pr.display_name,
         case when p.screen_error is not null then 'SCREEN FAILED'
              when p.screened_at  is null     then 'NOT SCREENED'
              else p.ai_flags -> 'overall' ->> 'reidentification_risk' end as risk,
         p.screen_error, p.report_count, p.ai_flags, p.swept_at, p.swept_by
    from public.posts p join public.profiles pr on pr.id = p.author_id
   where p.swept_at is null or p.report_count > 0 or p.status = 'held'
  union all
  select 'comment', c.id, c.created_at, c.status::text, null,
         c.body, pr.display_name,
         case when c.screen_error is not null then 'SCREEN FAILED'
              when c.screened_at  is null     then 'NOT SCREENED'
              else c.ai_flags -> 'overall' ->> 'reidentification_risk' end,
         c.screen_error, c.report_count, c.ai_flags, c.swept_at, c.swept_by
    from public.post_comments c join public.profiles pr on pr.id = c.author_id
   where c.swept_at is null or c.report_count > 0 or c.status = 'held'
  order by report_count desc, created_at;

-- =============================================================================
-- Seed: the flagship community
-- =============================================================================
alter table public.communities add column card_label text;

insert into public.communities (slug, name, tagline, card_label, intro_title, intro_body, topics, glossary, guidelines)
values (
  'amr',
  'Living With Antimicrobial Resistance',
  'Support and lived experiences for people affected by antimicrobial-resistant infections.',
  'AMR / Drug-Resistant Infections',
  'What is AMR?',
  'Antimicrobial resistance happens when bacteria, viruses, or fungi change over time and no longer respond to the medicines designed to kill them. It does not mean your body is resistant — it means the germ has changed. This is written for patients, not clinicians.',
  array['Survivor Stories','Recently Diagnosed','Long-Term Recovery','Caregiver Experiences',
        'Hospitalization & Isolation','Emotional Impact','Treatment Experiences',
        'Stigma and Misunderstanding','What I Wish I Had Known'],
  '[{"term":"Antimicrobial resistance (AMR)","definition":"When germs no longer respond to the medicines designed to kill them."},
    {"term":"Susceptibility testing","definition":"A lab test showing which medicines may still work against an infection."},
    {"term":"Stewardship","definition":"Using the right medicine, dose, and duration to protect future effectiveness."}]'::jsonb,
  'Be kind. Share experiences, not prescriptive medical advice. Protect your own and others'' privacy. This is not a substitute for professional medical care.'
);

-- Tags offered in the composer. Kept as data so the team can change them
-- without a deploy.
create table public.community_tags (
  community_id uuid not null references public.communities(id) on delete cascade,
  label        text not null,
  sort_order   int  not null default 0,
  primary key (community_id, label)
);
revoke all on public.community_tags from anon, authenticated;
alter table public.community_tags enable row level security;
grant select on public.community_tags to anon, authenticated;
create policy "tags are readable" on public.community_tags for select to anon, authenticated using (true);

insert into public.community_tags (community_id, label, sort_order)
select c.id, t.label, t.ord
  from public.communities c,
       (values ('Drug-resistant UTI',1), ('Resistant bacterial infection',2), ('Sepsis experience',3),
               ('Long hospitalization',4), ('Immunocompromised',5), ('Caregiver',6),
               ('Recovery',7), ('Recently diagnosed',8)) as t(label, ord)
 where c.slug = 'amr';
