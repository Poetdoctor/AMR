-- =============================================================================
-- Access-control tests for communities, stories, comments and reactions.
--
-- Stories publish without a human reading them first, so these rules are the
-- safeguard rather than a backstop. Every assertion is something that must be
-- impossible for someone holding the publishable key — which ships in the
-- browser bundle — or for a signed-in visitor acting on somebody else's behalf.
--
-- Run:  npm run test:db
-- =============================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;

create or replace function pg_temp.must_fail(stmt text, label text)
returns void language plpgsql as $$
begin
  begin execute stmt;
  -- Any error means the statement was rejected, which is what "must fail"
  -- means here: a privilege error, a missing column, a unique violation from
  -- the one-report-per-person constraint. Narrowing this to privilege errors
  -- only would silently skip the constraint tests.
  exception when others then
    raise notice '  ok   %', label; return;
  end;
  raise exception 'SECURITY FAILURE: % -- succeeded but must not', label;
end $$;

create or replace function pg_temp.must_equal(got anyelement, want anyelement, label text)
returns void language plpgsql as $$
begin
  if got is distinct from want then
    raise exception 'FAILURE: % -- got %, want %', label, got, want;
  end if;
  raise notice '  ok   %', label;
end $$;

-- Two anonymous visitors, as Supabase anonymous auth would create them.
reset role;
insert into auth.users (id) values
  ('aaaaaaaa-0000-0000-0000-000000000001'),
  ('bbbbbbbb-0000-0000-0000-000000000002');

\echo 'profiles'
select pg_temp.must_equal((select count(*)::int from public.profiles), 2,
  'signing in creates a pseudonym automatically');
select pg_temp.must_equal(
  (select count(distinct display_name)::int from public.profiles), 2,
  'pseudonyms are unique');
select pg_temp.must_equal(
  (select bool_and(display_name ~ '^[A-Z][a-z]+[A-Z][a-z]+[0-9]{3}$') from public.profiles), true,
  'pseudonyms look like MapleGrove123');

-- Seed content as user A.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';

insert into public.memberships (community_id, profile_id)
select id, 'aaaaaaaa-0000-0000-0000-000000000001' from public.communities where slug = 'amr';

insert into public.posts (id, community_id, author_id, title, body, visibility)
select '11111111-1111-1111-1111-111111111111', id,
       'bbbbbbbb-0000-0000-0000-000000000002',  -- deliberately wrong; must be overridden
       'Six weeks in isolation',
       'The hardest part of my hospitalization was not the IV line, it was the isolation room.',
       'public'
  from public.communities where slug = 'amr';

insert into public.posts (id, community_id, author_id, title, body, visibility)
select '22222222-2222-2222-2222-222222222222', id, auth.uid(),
       'Something I only want members to see',
       'A story shared with the community rather than with the whole internet, deliberately.',
       'members'
  from public.communities where slug = 'amr';

\echo 'authorship'
select pg_temp.must_equal(
  (select author_id from public.posts where id = '11111111-1111-1111-1111-111111111111'),
  'aaaaaaaa-0000-0000-0000-000000000001'::uuid,
  'author is taken from the session, not the request body');

reset role; reset request.jwt.claim.sub;
select pg_temp.must_equal((select report_count from public.posts where id='11111111-1111-1111-1111-111111111111'), 0,
  'insert cannot pre-set report_count');
select pg_temp.must_equal((select swept_at from public.posts where id='11111111-1111-1111-1111-111111111111'), null::timestamptz,
  'insert cannot pre-set swept_at');

\echo 'what a logged-out visitor sees'
set role anon;
select pg_temp.must_equal((select count(*)::int from public.posts), 1,
  'sees the public story and not the members-only one');
select pg_temp.must_fail('select status from public.posts',         'cannot read status');
select pg_temp.must_fail('select ai_flags from public.posts',       'cannot read ai_flags');
select pg_temp.must_fail('select moderator_note from public.posts', 'cannot read moderator_note');
select pg_temp.must_fail('select report_count from public.posts',   'cannot read report_count');
select pg_temp.must_fail('select swept_at from public.posts',       'cannot read the sweep record');
select pg_temp.must_fail($$insert into public.posts (community_id, author_id, body)
  select id, 'aaaaaaaa-0000-0000-0000-000000000001', 'Posting without signing in at all, which must fail.'
  from public.communities limit 1$$, 'cannot post');
select pg_temp.must_fail($$update public.posts set body = 'defaced'$$, 'cannot edit a story');
select pg_temp.must_fail($$delete from public.posts$$,                'cannot delete a story');
select pg_temp.must_fail('select * from public.bookmarks',            'cannot read bookmarks');
select pg_temp.must_fail('select * from public.reports',              'cannot read who reported what');
select pg_temp.must_fail('select * from private.sweep_queue',         'cannot read the moderation queue');

\echo 'comment threads'
-- The trigger takes author_id from the session, so a comment must be written
-- while one exists.
set role authenticated;
set request.jwt.claim.sub = 'bbbbbbbb-0000-0000-0000-000000000002';
insert into public.post_comments (post_id, author_id, body)
values ('11111111-1111-1111-1111-111111111111','bbbbbbbb-0000-0000-0000-000000000002','Wishing you strength.');
reset role; reset request.jwt.claim.sub;

set role anon;
-- Regression: this policy checks the parent story's status, which anon is not
-- granted. Reading it as the caller made every thread fail with 401.
select pg_temp.must_equal((select count(*)::int from public.post_comments), 1,
  'a logged-out reader can read a comment thread');
select pg_temp.must_fail('select status from public.post_comments', 'cannot read comment status');
reset role;

\echo 'members-only visibility'
set role authenticated;
set request.jwt.claim.sub = 'bbbbbbbb-0000-0000-0000-000000000002';
select pg_temp.must_equal((select count(*)::int from public.posts), 1,
  'a signed-in NON-member still cannot see the members-only story');

insert into public.memberships (community_id, profile_id)
select id, 'bbbbbbbb-0000-0000-0000-000000000002' from public.communities where slug = 'amr';
select pg_temp.must_equal((select count(*)::int from public.posts), 2,
  'joining the community reveals it');

\echo 'you may only act as yourself'
-- RLS filters rather than raising: a DELETE that matches no permitted row
-- succeeds affecting zero rows. So the assertion is that the story survives,
-- not that the statement errored. Testing for an exception here would have
-- passed against a policy that actually allowed the delete.
delete from public.posts where id = '11111111-1111-1111-1111-111111111111';
reset role; reset request.jwt.claim.sub;
select pg_temp.must_equal(
  (select count(*)::int from public.posts where id = '11111111-1111-1111-1111-111111111111'), 1,
  'someone else''s story survives their delete attempt');
set role authenticated;
set request.jwt.claim.sub = 'bbbbbbbb-0000-0000-0000-000000000002';
select pg_temp.must_fail(
  $$insert into public.reactions (post_id, profile_id, kind)
    values ('11111111-1111-1111-1111-111111111111','aaaaaaaa-0000-0000-0000-000000000001','support')$$,
  'cannot react as somebody else');
select pg_temp.must_fail(
  $$insert into public.bookmarks (post_id, profile_id)
    values ('11111111-1111-1111-1111-111111111111','aaaaaaaa-0000-0000-0000-000000000001')$$,
  'cannot bookmark as somebody else');

insert into public.reactions (post_id, profile_id, kind)
values ('11111111-1111-1111-1111-111111111111','bbbbbbbb-0000-0000-0000-000000000002','support');
select pg_temp.must_equal((select count(*)::int from public.reactions), 1, 'can react as yourself');

\echo 'auto-hide on report'
reset role; reset request.jwt.claim.sub;
-- A story the screening pass flagged: one report is enough.
update public.posts
   set ai_flags = '{"overall":{"reidentification_risk":"high","suggest_urgent_review":true}}'::jsonb,
       screened_at = now()
 where id = '11111111-1111-1111-1111-111111111111';
insert into public.reports (post_id, reporter_id, reason)
values ('11111111-1111-1111-1111-111111111111','aaaaaaaa-0000-0000-0000-000000000001','identifying');
select pg_temp.must_equal((select status from public.posts where id='11111111-1111-1111-1111-111111111111'),
  'removed'::public.comment_status, 'one report hides a flagged story');

-- A clean story: one report is not enough, two distinct people are.
update public.posts
   set ai_flags = '{"overall":{"reidentification_risk":"low","suggest_urgent_review":false}}'::jsonb,
       screened_at = now()
 where id = '22222222-2222-2222-2222-222222222222';
insert into public.reports (post_id, reporter_id, reason)
values ('22222222-2222-2222-2222-222222222222','aaaaaaaa-0000-0000-0000-000000000001','other');
select pg_temp.must_equal((select status from public.posts where id='22222222-2222-2222-2222-222222222222'),
  'published'::public.comment_status, 'one report does NOT hide a clean story');

select pg_temp.must_fail(
  $$insert into public.reports (post_id, reporter_id, reason)
    values ('22222222-2222-2222-2222-222222222222','aaaaaaaa-0000-0000-0000-000000000001','spam')$$,
  'the same person cannot report twice to force a takedown');

insert into public.reports (post_id, reporter_id, reason)
values ('22222222-2222-2222-2222-222222222222','bbbbbbbb-0000-0000-0000-000000000002','abusive');
select pg_temp.must_equal((select status from public.posts where id='22222222-2222-2222-2222-222222222222'),
  'removed'::public.comment_status, 'two different people do hide it');

\echo 'kill switch'
update public.community_settings set auto_publish = false;
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
insert into public.posts (id, community_id, author_id, body)
select '33333333-3333-3333-3333-333333333333', id, auth.uid(),
       'Written while the kill switch is off, so this must be held for approval.'
  from public.communities where slug = 'amr';
reset role; reset request.jwt.claim.sub;
select pg_temp.must_equal((select status from public.posts where id='33333333-3333-3333-3333-333333333333'),
  'held'::public.comment_status, 'the kill switch holds new stories');
set role anon;
select pg_temp.must_equal(
  (select count(*)::int from public.posts where id='33333333-3333-3333-3333-333333333333'), 0,
  'a held story is invisible to the public');
reset role;
update public.community_settings set auto_publish = true;

\echo ''
\echo 'ALL COMMUNITY ACCESS TESTS PASSED'
