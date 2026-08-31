-- =============================================================================
-- Fix: comments were unreadable, because their policy could not read the column
-- it was checking.
--
-- The policy asked "is the parent story published?", which reads posts.status.
-- RLS policies execute as the calling role, so the column-level grants apply
-- inside the policy too — and anon is deliberately granted eleven columns of
-- `posts`, not `status`. The policy therefore failed with "permission denied
-- for table posts" and every comment thread came back empty with a 401.
--
-- The check itself is right and worth keeping: a comment must disappear when
-- the story it belongs to is removed. It moves into a security definer function
-- so it runs as the owner, sees `status`, and returns only a boolean — which
-- reveals nothing a reader could not already infer from the story's absence.
-- =============================================================================

create or replace function public.post_is_visible(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.posts p where p.id = target and p.status = 'published');
$$;

revoke all on function public.post_is_visible(uuid) from public;
grant execute on function public.post_is_visible(uuid) to anon, authenticated;

drop policy if exists "comments follow their story" on public.post_comments;
create policy "comments follow their story"
  on public.post_comments for select to anon, authenticated
  using (status = 'published' and public.post_is_visible(post_id));
