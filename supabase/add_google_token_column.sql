-- Add google_refresh_token column to stores table
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS google_refresh_token text;

-- Notify pgrst to reload schema cache
NOTIFY pgrst, 'reload config';
