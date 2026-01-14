-- Create daily_analytics_cache table
CREATE TABLE IF NOT EXISTS public.daily_analytics_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('ga4', 'meta')),
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (store_id, date, platform)
);

-- Enable RLS
ALTER TABLE public.daily_analytics_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Read access for users assigned to the store
CREATE POLICY "Allow read for store users"
ON public.daily_analytics_cache
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.store_assignments sa
        WHERE sa.store_id = daily_analytics_cache.store_id
        AND sa.user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role = 'PROVIDER_ADMIN'
    )
);

-- 2. Full access for Service Role (automatically handled by Supabase, but explicit for clarity if needed, though usually service role bypasses RLS)
-- We will rely on Service Role bypass for writing if specific users shouldn't write.
-- HOWEVER, if we want to allow Admins to write via frontend actions without Service Role (optional):
CREATE POLICY "Allow write for Store Admins and Provider Admins"
ON public.daily_analytics_cache
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.store_assignments sa
        WHERE sa.store_id = daily_analytics_cache.store_id
        AND sa.user_id = auth.uid()
        AND sa.role = 'STORE_ADMIN'
    )
    OR
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role = 'PROVIDER_ADMIN'
    )
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_daily_analytics_cache_updated_at
    BEFORE UPDATE ON public.daily_analytics_cache
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
