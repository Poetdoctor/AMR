-- Recreates the roles Supabase provides, so the migration and its tests can run
-- against a plain Postgres in CI or locally. Not applied to the real project.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end $$;

grant usage on schema public to anon, authenticated, service_role;
-- Mirrors Supabase's default: anon starts with broad access, which is exactly
-- why the migration revokes it explicitly rather than assuming it has none.
grant all on all tables in schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;

-- Stub of the parts of Supabase's auth schema the community migration relies
-- on, so the RLS rules can be tested against a plain Postgres. The real project
-- has these already; this file is never applied to it.
create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- Tests impersonate a user with:  set local request.jwt.claim.sub = '<uuid>';
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

grant usage on schema auth to anon, authenticated, service_role;
