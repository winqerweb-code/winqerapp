create table strategies (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  input_data jsonb not null,
  output_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(store_id)
);

-- Add RLS policies
alter table strategies enable row level security;

create policy "Users can view strategies for their stores"
  on strategies for select
  using (
    exists (
      select 1 from stores
      where stores.id = strategies.store_id
      and stores.user_id = auth.uid()
    )
  );

create policy "Users can insert strategies for their stores"
  on strategies for insert
  with check (
    exists (
      select 1 from stores
      where stores.id = strategies.store_id
      and stores.user_id = auth.uid()
    )
  );

create policy "Users can update strategies for their stores"
  on strategies for update
  using (
    exists (
      select 1 from stores
      where stores.id = strategies.store_id
      and stores.user_id = auth.uid()
    )
  );

create policy "Users can delete strategies for their stores"
  on strategies for delete
  using (
    exists (
      select 1 from stores
      where stores.id = strategies.store_id
      and stores.user_id = auth.uid()
    )
  );
