-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only Provider Admin can insert/update
CREATE POLICY "Provider Admin can manage system settings" ON system_settings
    FOR ALL
    USING (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role = 'PROVIDER_ADMIN'
        )
    );

-- Policy: Authenticated users can read (to use the key)
-- Actually, for security, maybe we DON'T want users to read the raw key on client?
-- The key is used by the SERVER (Edge Function / Server Action).
-- So "Server Role" has access.
-- But if we want to show "Configured" status to Admin, Admin needs read.
-- Regular users don't need to read it directly if the Generation is done via Server Action/Route.
-- The route.ts runs on server, so it uses Service Role or user's auth.

-- Let's allow read for everyone for now (if the app architecture requires client-side check), 
-- but ideally only Server Actions read it.
-- Since route.ts calls Supabase, if it uses the User's client, the User needs RLS access.
-- If I use a Server Action that uses Service Role, then RLS doesn't matter.
-- BUT route.ts uses `openai` library directly. It needs the key string.
-- Strategy 1: Fetch key in route.ts using Service Role (Bypass RLS).
-- Strategy 2: Fetch key in route.ts using User Client (Need RLS).

-- I'll stick to: Only Admin can manage.
-- Reading will be done via Service Role in the backend to prevent leaking key to client.
