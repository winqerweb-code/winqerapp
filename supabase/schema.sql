-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tenants (Clients)
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  industry text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Users (Linked to Tenants)
create table user_profiles (
  id uuid primary key references auth.users(id),
  tenant_id uuid references tenants(id),
  role text default 'admin',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Meta Ad Accounts
create table ad_accounts (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) not null,
  platform_account_id text not null, -- Meta Ad Account ID (act_xxxxxxxx)
  name text not null,
  access_token text not null, -- Encrypted in real app
  currency text default 'JPY',
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Creatives (Analysis & Generation Target)
create table creatives (
  id uuid primary key default uuid_generate_v4(),
  ad_account_id uuid references ad_accounts(id) not null,
  platform_creative_id text, -- Meta Creative ID if exists
  
  -- Content
  image_url text,
  thumbnail_url text,
  title text, -- Headline
  body text, -- Primary Text
  call_to_action text,
  
  -- Performance (Cached for analysis)
  impressions bigint default 0,
  clicks bigint default 0,
  spend numeric default 0,
  ctr numeric default 0, -- Click Through Rate
  cpa numeric default 0, -- Cost Per Action
  roas numeric default 0, -- Return on Ad Spend
  
  -- AI Analysis
  winning_score numeric default 0, -- 0-100 score calculated by AI/Logic
  analysis_summary text, -- AI's comment on why this is good/bad
  
  -- Status
  status text default 'draft', -- draft, active, paused, archived
  origin text default 'imported', -- imported (from Meta), generated (by AI)
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Generation Logs (History of AI generation)
create table generation_logs (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) not null,
  prompt_used text,
  source_creative_id uuid references creatives(id), -- Based on which creative?
  generated_creative_id uuid references creatives(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
