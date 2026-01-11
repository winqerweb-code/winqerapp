-- Add name columns to stores table to persist display labels
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS meta_ad_account_name text,
ADD COLUMN IF NOT EXISTS meta_campaign_name text,
ADD COLUMN IF NOT EXISTS ga4_property_name text,
ADD COLUMN IF NOT EXISTS gbp_location_name text;

-- Notify pgrst to reload schema cache
NOTIFY pgrst, 'reload config';
