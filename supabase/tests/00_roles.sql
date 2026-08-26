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
