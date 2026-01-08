-- Run this script in the Supabase SQL Editor to fix the "Unauthorized" error.
-- Replace 'YOUR_EMAIL' with your actual email address (e.g., 'creative@winqer.info')

-- 1. Ensure the profiles table exists (in case migration wasn't run)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text default 'CLIENT_ADMIN' check (role in ('PROVIDER_ADMIN', 'CLIENT_ADMIN')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS on profiles if not already enabled
alter table profiles enable row level security;

-- 3. Insert or Update your user profile to be PROVIDER_ADMIN
-- This handles cases where the profile might be missing (for existing users)
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'PROVIDER_ADMIN'
FROM auth.users
WHERE email = 'YOUR_EMAIL' -- <--- IMPORTANT: REPLACE THIS WITH YOUR EMAIL
ON CONFLICT (id) DO UPDATE
SET role = 'PROVIDER_ADMIN';

-- 4. Verify the update
SELECT * FROM profiles WHERE email = 'YOUR_EMAIL';
