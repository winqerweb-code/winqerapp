-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id UUID REFERENCES auth.users(id),
    target_user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow Provider Admins to view all logs
CREATE POLICY "Provider Admins can view all audit logs"
    ON public.audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'PROVIDER_ADMIN'
        )
    );

-- Allow authenticated users to insert logs (required for server actions)
CREATE POLICY "Authenticated users can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (auth.uid() = actor_id);

-- Optional: If you want to log system actions where actor might be null or specific system user, adjust accordingly.
-- For now, we assume logged-in users initiate actions.
