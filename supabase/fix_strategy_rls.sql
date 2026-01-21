-- ==========================================
-- FIX STRATEGY RLS (Allow Assigned Users to View)
-- ==========================================

-- 1. Enable RLS on strategies (ensure it's on)
alter table public.strategies enable row level security;

-- 2. Drop existing policies to avoid conflicts
drop policy if exists "Users can view strategies for their stores" on public.strategies;
drop policy if exists "Users can insert strategies for their stores" on public.strategies;
drop policy if exists "Users can update strategies for their stores" on public.strategies;
drop policy if exists "Users can delete strategies for their stores" on public.strategies;
drop policy if exists "Provider Admins can do everything on strategies" on public.strategies;
drop policy if exists "Assigned users can view strategies" on public.strategies;

-- 3. Policy: Provider Admins can do everything
create policy "Provider Admins can do everything on strategies"
  on public.strategies for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'PROVIDER_ADMIN'
    )
  );

-- 4. Policy: Assigned Users can VIEW strategies
-- This allows generation actions to read the strategy context
create policy "Assigned users can view strategies"
  on public.strategies for select
  using (
    exists (
      select 1 from public.store_assignments
      where store_id = public.strategies.store_id
      and user_id = auth.uid()
    )
  );

-- Note: We generally don't want Store Admins to update Strategy unless explicitly allowed.
-- The UI currently hides Strategy tab for them.
-- If we want to allow Store Admins to update (but not Viewers), we can add another policy.
-- For now, restricting update to Provider Admin matches the UI logic.
