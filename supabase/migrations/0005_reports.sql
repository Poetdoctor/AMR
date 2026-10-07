-- =============================================================================
-- Reporting, reworked after review.
--
-- Three changes, all to how a report is made and what it does:
--
-- 1. More reasons, matching what people expect from a report menu elsewhere,
--    plus two that only this section needs: "this is mine and I want it
--    removed", for an author who no longer has the browser they posted from,
--    and "something else", which must say what.
--
-- 2. A report is made by a session, as itself. Before this, a logged-out
--    report carried reporter_id = null, and because Postgres treats nulls as
--    distinct the one-report-per-person constraint did not apply to it: one
--    visitor reporting twice hid a story that the rule says needs two people.
--    The insert policy was also `with check (true)`, so a signed-in visitor
--    could file reports under anybody's id.
--
-- 3. "This is mine" hides the item at once rather than waiting for the daily
--    sweep. Removal is the conservative direction, the person asking is the
--    one with most to lose from waiting, and a moderator restores it at the
--    sweep if the claim was not genuine. It is also the only way back for an
--    author who lost the session that would have let them delete it directly.
-- =============================================================================

alter table public.reports drop constraint if exists reports_reason_check;
alter table public.reports add constraint reports_reason_check check (
  reason in ('identifying', 'abusive', 'hate', 'misinformation', 'spam', 'distressing', 'mine', 'other')
);

-- "Something else" is useless to a moderator without the something.
alter table public.reports add constraint reports_other_says_what check (
  reason <> 'other' or char_length(btrim(coalesce(detail, ''))) > 0
);

revoke insert on public.reports from anon;
drop policy if exists "anyone may report" on public.reports;
create policy "report as yourself" on public.reports
  for insert to authenticated with check (reporter_id = auth.uid());

-- Same rule as before — a flagged item goes on the first report, a clean one
-- needs two distinct people — counted by person rather than by row, and with
-- the author's own request acting immediately.
create or replace function public.apply_report_policy()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  reporters   int;
  was_flagged boolean;
  hide        boolean;
begin
  if new.post_id is not null then
    select count(distinct r.reporter_id) into reporters
      from public.reports r where r.post_id = new.post_id;
    select coalesce((p.ai_flags -> 'overall' ->> 'suggest_urgent_review')::boolean, false)
        or (p.ai_flags -> 'overall' ->> 'reidentification_risk') = 'high'
      into was_flagged from public.posts p where p.id = new.post_id;
    hide := new.reason = 'mine' or coalesce(was_flagged, false) or reporters >= 2;

    update public.posts
       set report_count = report_count + 1,
           status = case when status = 'published' and hide
                         then 'removed'::public.comment_status else status end
     where id = new.post_id;
  else
    select count(distinct r.reporter_id) into reporters
      from public.reports r where r.comment_id = new.comment_id;
    select coalesce((c.ai_flags -> 'overall' ->> 'suggest_urgent_review')::boolean, false)
      into was_flagged from public.post_comments c where c.id = new.comment_id;
    hide := new.reason = 'mine' or coalesce(was_flagged, false) or reporters >= 2;

    update public.post_comments
       set report_count = report_count + 1,
           status = case when status = 'published' and hide
                         then 'removed'::public.comment_status else status end
     where id = new.comment_id;
  end if;
  return new;
end;
$$;

-- The moderation queue gains the reasons, so a moderator sees "mine" or a
-- written note without opening the reports table alongside it.
drop view if exists private.sweep_queue;
create view private.sweep_queue as
  select 'story'::text as kind, p.id, p.created_at, p.status::text, p.title,
         p.body, pr.display_name,
         case when p.screen_error is not null then 'SCREEN FAILED'
              when p.screened_at  is null     then 'NOT SCREENED'
              else p.ai_flags -> 'overall' ->> 'reidentification_risk' end as risk,
         p.screen_error, p.report_count, p.ai_flags, p.swept_at, p.swept_by,
         (select string_agg(r.reason || coalesce(': ' || r.detail, ''), ' | ' order by r.created_at)
            from public.reports r where r.post_id = p.id) as reports
    from public.posts p join public.profiles pr on pr.id = p.author_id
   where p.swept_at is null or p.report_count > 0 or p.status = 'held'
  union all
  select 'comment', c.id, c.created_at, c.status::text, null,
         c.body, pr.display_name,
         case when c.screen_error is not null then 'SCREEN FAILED'
              when c.screened_at  is null     then 'NOT SCREENED'
              else c.ai_flags -> 'overall' ->> 'reidentification_risk' end,
         c.screen_error, c.report_count, c.ai_flags, c.swept_at, c.swept_by,
         (select string_agg(r.reason || coalesce(': ' || r.detail, ''), ' | ' order by r.created_at)
            from public.reports r where r.comment_id = c.id)
    from public.post_comments c join public.profiles pr on pr.id = c.author_id
   where c.swept_at is null or c.report_count > 0 or c.status = 'held'
  order by report_count desc, created_at;
