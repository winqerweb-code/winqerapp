-- ==========================================
-- FIX STORE ASSIGNMENTS VISIBILITY (RLS)
-- ==========================================

-- 1. Enable RLS on store_assignments (ensure it's on)
alter table public.store_assignments enable row level security;

-- 2. Drop existing policies to avoid conflicts
drop policy if exists "Provider Admins can do everything on assignments" on public.store_assignments;
drop policy if exists "Assigned users can view their own assignments" on public.store_assignments;

-- 3. Policy: Provider Admins can do everything
create policy "Provider Admins can do everything on assignments"
  on public.store_assignments for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'PROVIDER_ADMIN'
    )
  );

-- 4. Policy: Users can VIEW their own assignments
-- CRITICAL: This is needed for the 'stores' policy to work!
create policy "Assigned users can view their own assignments"
  on public.store_assignments for select
  using ( user_id = auth.uid() );
