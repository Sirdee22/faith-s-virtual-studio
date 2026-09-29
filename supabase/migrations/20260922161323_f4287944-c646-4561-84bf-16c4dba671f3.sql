-- Real admin accounts (email + password) to replace the single shared password.

create extension if not exists pgcrypto with schema extensions;

create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- No grants to anon/authenticated: this table is never readable from the
-- public API. Only the service-role server code (adminClient()) can touch it.
alter table public.admin_users enable row level security;
grant all on public.admin_users to service_role;

-- Checks an email/password pair against the stored bcrypt hash, entirely
-- inside Postgres, so the plaintext password never needs custom hashing code
-- in the app. Returns the matching user's id and email, or no rows.
create or replace function public.verify_admin_login(p_email text, p_password text)
returns table (id uuid, email text)
language sql
security definer
set search_path = public, extensions
as $$
  select admin_users.id, admin_users.email
  from public.admin_users
  where admin_users.email = lower(p_email)
    and admin_users.password_hash = extensions.crypt(p_password, admin_users.password_hash)
  limit 1;
$$;

revoke all on function public.verify_admin_login(text, text) from public;
grant execute on function public.verify_admin_login(text, text) to service_role;

-- Add your own admin account: run this once in the SQL Editor with your
-- real email and a password of your choosing. You can run it again later
-- with a different email to add more admins.
-- insert into public.admin_users (email, password_hash)
-- values ('you@example.com', extensions.crypt('your-password-here', extensions.gen_salt('bf')));
