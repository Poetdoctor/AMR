-- =============================================================================
-- Access-control tests for the Community schema.
--
-- With no human reading a comment before the public does, these rules are the
-- safeguard. So they are tested rather than trusted: every assertion below is
-- something that must be impossible for a holder of the anon key, which is
-- public by design and sits in the shipped JavaScript bundle.
--
-- Run:  npm run test:db
-- =============================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;

create or replace function pg_temp.must_fail(stmt text, label text)
returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when insufficient_privilege or undefined_table or undefined_column then
    raise notice '  ok   %', label;
    return;
  end;
  raise exception 'SECURITY FAILURE: % -- statement succeeded but must not', label;
end $$;

create or replace function pg_temp.must_equal(got anyelement, want anyelement, label text)
returns void language plpgsql as $$
begin
  if got is distinct from want then
    raise exception 'FAILURE: % -- got %, want %', label, got, want;
  end if;
  raise notice '  ok   %', label;
end $$;

-- ── Seed ─────────────────────────────────────────────────────────────────────
reset role;
insert into public.comments (id, body, display_name, theme)
values ('11111111-1111-1111-1111-111111111111',
        'A published comment, long enough to satisfy the length constraint.', 'Pat', 'isolation');

insert into public.comments (id, body)
values ('22222222-2222-2222-2222-222222222222',
        'This one will be removed by a moderator, and must vanish completely.');
update public.comments set status = 'removed' where id = '22222222-2222-2222-2222-222222222222';

-- ── What the public may do ───────────────────────────────────────────────────
\echo 'anon read path'
set role anon;

select pg_temp.must_equal(
  (select count(*)::int from public.comments), 1,
  'sees exactly the one published comment');

select pg_temp.must_equal(
  (select count(*)::int from public.comments where id = '22222222-2222-2222-2222-222222222222'), 0,
  'cannot see a removed comment');

select pg_temp.must_equal(
  (select body from public.comments limit 1),
  'A published comment, long enough to satisfy the length constraint.',
  'can read the five public columns');

-- ── What the public must not do ──────────────────────────────────────────────
\echo 'anon is denied everything else'
select pg_temp.must_fail('select status from public.comments',            'cannot read status');
select pg_temp.must_fail('select ai_flags from public.comments',          'cannot read ai_flags');
select pg_temp.must_fail('select moderator_note from public.comments',    'cannot read moderator_note');
select pg_temp.must_fail('select delete_token_hash from public.comments', 'cannot read delete_token_hash');
select pg_temp.must_fail('select report_count from public.comments',      'cannot read report_count');
select pg_temp.must_fail('select swept_at, swept_by from public.comments','cannot read sweep record');
select pg_temp.must_fail('select screen_error from public.comments',      'cannot read screen_error');

select pg_temp.must_fail(
  $$insert into public.comments (body) values ('trying to post directly, bypassing the edge function')$$,
  'cannot insert a comment directly');
select pg_temp.must_fail(
  $$update public.comments set body = 'defaced' where true$$,
  'cannot edit a comment');
select pg_temp.must_fail(
  $$delete from public.comments where true$$,
  'cannot delete a comment');
select pg_temp.must_fail(
  $$update public.comments set status = 'published' where true$$,
  'cannot republish a removed comment');

select pg_temp.must_fail('select * from public.reports',            'cannot read reports');
select pg_temp.must_fail($$insert into public.reports (comment_id, reason)
                           values ('11111111-1111-1111-1111-111111111111','spam')$$,
                         'cannot report directly, bypassing rate limiting');
select pg_temp.must_fail('select * from public.community_settings',  'cannot read the kill switch');
select pg_temp.must_fail($$update public.community_settings set auto_publish = false$$,
                         'cannot flip the kill switch');

select pg_temp.must_fail('select * from private.submission_throttle',   'cannot read the throttle table');
select pg_temp.must_fail('select * from private.report_fingerprints',   'cannot read report fingerprints');
select pg_temp.must_fail('select * from private.sweep_queue',           'cannot read the moderation queue');

-- ── The database decides status, not the caller ──────────────────────────────
\echo 'insert trigger'
reset role;

insert into public.comments (id, body, status, ai_flags, swept_at, swept_by, report_count, screen_error)
values ('33333333-3333-3333-3333-333333333333',
        'A caller trying to insert a row that claims to be already screened and swept.',
        'published', '{"overall":{"reidentification_risk":"low"}}'::jsonb, now(), 'nobody', 99, 'faked');

select pg_temp.must_equal((select ai_flags    from public.comments where id='33333333-3333-3333-3333-333333333333'), null::jsonb, 'insert cannot pre-set ai_flags');
select pg_temp.must_equal((select swept_at    from public.comments where id='33333333-3333-3333-3333-333333333333'), null::timestamptz, 'insert cannot pre-set swept_at');
select pg_temp.must_equal((select swept_by    from public.comments where id='33333333-3333-3333-3333-333333333333'), null::text, 'insert cannot pre-set swept_by');
select pg_temp.must_equal((select report_count from public.comments where id='33333333-3333-3333-3333-333333333333'), 0, 'insert cannot pre-set report_count');
select pg_temp.must_equal((select screen_error from public.comments where id='33333333-3333-3333-3333-333333333333'), null::text, 'insert cannot pre-set screen_error');

\echo 'kill switch'
update public.community_settings set auto_publish = false;
insert into public.comments (id, body)
values ('44444444-4444-4444-4444-444444444444',
        'Posted while the kill switch is off, so this must be held rather than published.');
select pg_temp.must_equal((select status from public.comments where id='44444444-4444-4444-4444-444444444444'),
                          'held'::public.comment_status, 'kill switch holds new comments');

-- Even a caller explicitly asking to publish is overridden.
insert into public.comments (id, body, status)
values ('55555555-5555-5555-5555-555555555555',
        'A caller explicitly asking for published while the kill switch is off.', 'published');
select pg_temp.must_equal((select status from public.comments where id='55555555-5555-5555-5555-555555555555'),
                          'held'::public.comment_status, 'kill switch overrides an explicit status');

set role anon;
select pg_temp.must_equal((select count(*)::int from public.comments), 2, 'held comments are invisible to the public');
reset role;
update public.community_settings set auto_publish = true;

-- ── Auto-hide on report ──────────────────────────────────────────────────────
\echo 'report policy'
-- A comment the screening pass flagged as high risk: one report is enough.
insert into public.comments (id, body) values
  ('66666666-6666-6666-6666-666666666666', 'A flagged comment that names a hospital and a small town.');
update public.comments
   set ai_flags = '{"overall":{"reidentification_risk":"high","suggest_urgent_review":true}}'::jsonb,
       screened_at = now()
 where id = '66666666-6666-6666-6666-666666666666';

insert into private.report_fingerprints (comment_id, ip_hash) values ('66666666-6666-6666-6666-666666666666','hash-a');
insert into public.reports (comment_id, reason) values ('66666666-6666-6666-6666-666666666666','identifying');
select pg_temp.must_equal((select status from public.comments where id='66666666-6666-6666-6666-666666666666'),
                          'removed'::public.comment_status, 'one report hides an AI-flagged comment');

-- A clean comment: one report is not enough, two distinct reporters are.
insert into public.comments (id, body) values
  ('77777777-7777-7777-7777-777777777777', 'A perfectly ordinary comment that somebody simply dislikes.');
update public.comments
   set ai_flags = '{"overall":{"reidentification_risk":"low","suggest_urgent_review":false}}'::jsonb,
       screened_at = now()
 where id = '77777777-7777-7777-7777-777777777777';

insert into private.report_fingerprints (comment_id, ip_hash) values ('77777777-7777-7777-7777-777777777777','hash-a');
insert into public.reports (comment_id, reason) values ('77777777-7777-7777-7777-777777777777','other');
select pg_temp.must_equal((select status from public.comments where id='77777777-7777-7777-7777-777777777777'),
                          'published'::public.comment_status, 'one report does NOT hide a clean comment');

insert into private.report_fingerprints (comment_id, ip_hash) values ('77777777-7777-7777-7777-777777777777','hash-b');
insert into public.reports (comment_id, reason) values ('77777777-7777-7777-7777-777777777777','abusive');
select pg_temp.must_equal((select status from public.comments where id='77777777-7777-7777-7777-777777777777'),
                          'removed'::public.comment_status, 'two independent reports hide a clean comment');

-- ── Moderator queue ──────────────────────────────────────────────────────────
\echo 'sweep queue'
select pg_temp.must_equal((select count(*)::int > 0 from private.sweep_queue), true,
                          'sweep queue lists unswept and reported comments');
update public.comments set swept_at = now(), swept_by = 'zahra' where swept_at is null and report_count = 0;
select pg_temp.must_equal(
  (select count(*)::int from private.sweep_queue where report_count = 0 and status = 'published'), 0,
  'a swept, unreported comment leaves the queue');

\echo ''
\echo 'ALL ACCESS TESTS PASSED'
