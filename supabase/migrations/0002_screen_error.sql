-- =============================================================================
-- Make a failing screen visible.
--
-- Screening is deliberately fail-safe: it runs after the comment is already
-- published, and an error there changes nothing about what the public sees.
-- The cost of that is a silent failure looks exactly like a clean result from
-- the moderator's side.
--
-- It happened immediately: screening was dead on arrival because the Anthropic
-- account had no credit, and nothing in the product could say so. Recording the
-- reason means the sweep queue distinguishes "nobody has screened this yet"
-- from "screening tried and failed, and here is why".
-- =============================================================================

alter table public.comments add column screen_error text;

comment on column public.comments.screen_error is
  'Why the screening pass failed, if it did. Null when it succeeded or has not run.';

-- Not granted to anon: it can carry API detail that is nobody else's business.

-- `create or replace view` cannot insert a column into the middle of the list,
-- so the view is dropped and rebuilt. It holds no data.
drop view if exists private.sweep_queue;
create view private.sweep_queue as
  select
    c.id,
    c.created_at,
    c.status,
    c.theme,
    c.display_name,
    c.body,
    case
      when c.screen_error is not null then 'SCREEN FAILED'
      when c.screened_at  is null     then 'NOT SCREENED'
      else c.ai_flags -> 'overall' ->> 'reidentification_risk'
    end as risk,
    c.screen_error,
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

-- The database owns this column like the others: a caller must not be able to
-- insert a row that claims screening already failed (or already succeeded).
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

  new.ai_flags     := null;
  new.screened_at  := null;
  new.screen_error := null;
  new.swept_at     := null;
  new.swept_by     := null;
  new.report_count := 0;
  new.created_at   := now();
  return new;
end;
$$;
