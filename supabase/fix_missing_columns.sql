-- ==========================================
-- FIX MISSING COLUMNS SCRIPT
-- ==========================================
-- Run this in Supabase SQL Editor to add all missing columns.

alter table public.stores 
add column if not exists meta_access_token text,
add column if not exists meta_ad_account_id text,
add column if not exists meta_campaign_id text,
add column if not exists gemini_api_key text,
add column if not exists openai_api_key text,
add column if not exists ga4_property_id text,
add column if not exists gbp_location_id text;

-- Force schema cache reload (usually happens automatically, but good to ensure)
NOTIFY pgrst, 'reload config';
