-- ==========================================
-- FIX USER ASSIGNMENT (RLS & TRIGGER)
-- ==========================================

-- 1. Enable RLS on profiles (ensure it's on)
alter table public.profiles enable row level security;

-- 2. Drop existing policies to avoid conflicts (clean slate for profiles)
drop policy if exists "Provider Admins can view all profiles" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Public profiles" on public.profiles; -- Remove any old loose policies

-- 3. Create Policy: Provider Admins can see ALL profiles (needed for assignment)
create policy "Provider Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'PROVIDER_ADMIN'
    )
  );

-- 4. Create Policy: Users can see their OWN profile
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- 5. Create Policy: Users can update their OWN profile
create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- ==========================================
-- RE-RUN TRIGGER SETUP (Just in case)
-- ==========================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'CLIENT_ADMIN')
  on conflict (id) do nothing; -- Prevent error if exists
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill again just to be sure
insert into public.profiles (id, email, role)
select id, email, 'CLIENT_ADMIN'
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;
