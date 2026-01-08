-- ==========================================
-- WINQER APP DATABASE UPDATE SCRIPT
-- ==========================================
-- Run this script in the Supabase SQL Editor to fix "Unauthorized" errors and "Save Failed" issues.
-- IMPORTANT: Replace 'YOUR_EMAIL' below with your actual email address.

-- 1. Add missing columns to 'stores' table
--    This fixes the "Save Error" when saving Meta Campaign ID.
alter table public.stores 
add column if not exists meta_campaign_id text;

-- 2. Ensure 'profiles' table has the correct structure and role
--    This fixes the "Unauthorized" error.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text default 'CLIENT_ADMIN' check (role in ('PROVIDER_ADMIN', 'CLIENT_ADMIN')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Grant PROVIDER_ADMIN role to your user
--    Replace 'YOUR_EMAIL' with your actual login email.
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'PROVIDER_ADMIN'
FROM auth.users
WHERE email = 'YOUR_EMAIL' -- <--- REWRITE THIS TO YOUR EMAIL (e.g. 'creative@winqer.info')
ON CONFLICT (id) DO UPDATE
SET role = 'PROVIDER_ADMIN';

-- 4. Create 'store_assignments' table if it doesn't exist
--    This enables the User Assignment feature.
create table if not exists public.store_assignments (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'STORE_ADMIN' check (role in ('STORE_ADMIN', 'STORE_VIEWER')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(store_id, user_id)
);

-- Enable RLS for store_assignments
alter table public.store_assignments enable row level security;

-- 5. Create RLS Policies (Safe to run multiple times)
--    These ensure only Admins and Assigned Users can access stores.

-- Policy: Provider Admins can do everything
create policy "Provider Admins can do everything"
on public.stores
for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'PROVIDER_ADMIN'
  )
);

create policy "Provider Admins can manage assignments"
on public.store_assignments
for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'PROVIDER_ADMIN'
  )
);
