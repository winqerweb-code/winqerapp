-- ==========================================
-- FIX STORE VISIBILITY (RLS)
-- ==========================================

-- 1. Enable RLS on stores (ensure it's on)
alter table public.stores enable row level security;

-- 2. Drop existing policies to avoid conflicts
drop policy if exists "Provider Admins can do everything on stores" on public.stores;
drop policy if exists "Assigned users can view their stores" on public.stores;

-- 3. Policy: Provider Admins can do everything
create policy "Provider Admins can do everything on stores"
  on public.stores for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'PROVIDER_ADMIN'
    )
  );

-- 4. Policy: Assigned Users can VIEW their stores
-- This checks if the user ID exists in the store_assignments table for the specific store
create policy "Assigned users can view their stores"
  on public.stores for select
  using (
    exists (
      select 1 from public.store_assignments
      where store_id = public.stores.id
      and user_id = auth.uid()
    )
  );
