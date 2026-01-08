-- 1. Create Profiles Table (Extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text default 'CLIENT_ADMIN' check (role in ('PROVIDER_ADMIN', 'CLIENT_ADMIN')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table profiles enable row level security;

-- Policies for profiles
-- Provider can view/edit all profiles
create policy "Provider can view all profiles"
  on profiles for select
  using ( exists (select 1 from profiles where id = auth.uid() and role = 'PROVIDER_ADMIN') );

create policy "Provider can update all profiles"
  on profiles for update
  using ( exists (select 1 from profiles where id = auth.uid() and role = 'PROVIDER_ADMIN') );

-- Users can view their own profile
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

-- 2. Update Stores Table (Secure Secrets)
-- Add secret columns if they don't exist
alter table stores add column if not exists gemini_api_key text;
alter table stores add column if not exists openai_api_key text;
alter table stores add column if not exists meta_access_token text;
alter table stores add column if not exists meta_ad_account_id text;
alter table stores add column if not exists ga4_property_id text;
alter table stores add column if not exists gbp_location_id text;

-- Enable RLS on stores (if not already enabled)
alter table stores enable row level security;

-- 3. Create Store Assignments Table (Many-to-Many)
create table if not exists store_assignments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  store_id uuid references stores(id) on delete cascade not null,
  role text default 'STORE_ADMIN' check (role in ('STORE_ADMIN', 'STORE_VIEWER')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, store_id)
);

-- Enable RLS on store_assignments
alter table store_assignments enable row level security;

-- Policies for store_assignments
-- Provider can view/manage all assignments
create policy "Provider can view all assignments"
  on store_assignments for select
  using ( exists (select 1 from profiles where id = auth.uid() and role = 'PROVIDER_ADMIN') );

create policy "Provider can insert assignments"
  on store_assignments for insert
  with check ( exists (select 1 from profiles where id = auth.uid() and role = 'PROVIDER_ADMIN') );

create policy "Provider can update assignments"
  on store_assignments for update
  using ( exists (select 1 from profiles where id = auth.uid() and role = 'PROVIDER_ADMIN') );

create policy "Provider can delete assignments"
  on store_assignments for delete
  using ( exists (select 1 from profiles where id = auth.uid() and role = 'PROVIDER_ADMIN') );

-- Users can view their own assignments
create policy "Users can view own assignments"
  on store_assignments for select
  using ( auth.uid() = user_id );

-- 4. Update Stores Policies (Based on Assignments)
-- Provider can view/manage all stores
create policy "Provider can view all stores"
  on stores for select
  using ( exists (select 1 from profiles where id = auth.uid() and role = 'PROVIDER_ADMIN') );

create policy "Provider can insert stores"
  on stores for insert
  with check ( exists (select 1 from profiles where id = auth.uid() and role = 'PROVIDER_ADMIN') );

create policy "Provider can update stores"
  on stores for update
  using ( exists (select 1 from profiles where id = auth.uid() and role = 'PROVIDER_ADMIN') );

create policy "Provider can delete stores"
  on stores for delete
  using ( exists (select 1 from profiles where id = auth.uid() and role = 'PROVIDER_ADMIN') );

-- Users can view assigned stores
create policy "Users can view assigned stores"
  on stores for select
  using (
    exists (
      select 1 from store_assignments
      where store_assignments.store_id = stores.id
      and store_assignments.user_id = auth.uid()
    )
  );

-- Users CANNOT update/delete stores directly (Only Provider)
-- If Store Admin needs to update settings, we might allow update on specific columns via function or strict policy
-- For now, following "Client Admin: Restricted access" rule.

-- 5. Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'CLIENT_ADMIN');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Initial Data (Provider Admin)
-- Note: You must manually update the role for 'creative@winqer.info' after they sign up or if they exist.
-- update profiles set role = 'PROVIDER_ADMIN' where email = 'creative@winqer.info';
