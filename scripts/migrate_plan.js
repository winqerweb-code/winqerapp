const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = `
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS usage_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_usage_date date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS total_usage_count integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_stores_plan_type ON stores(plan_type);
CREATE INDEX IF NOT EXISTS idx_stores_stripe_customer_id ON stores(stripe_customer_id);
`;

async function runMigration() {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    // Note: exec_sql is a common custom function. If not available, we can't run DDL via JS client easily.
    // Alternative: Just Log/Warn user. 
    // IMPORTANT: Supabase JS client cannot run arbitrary SQL unless a stored procedure exists.
    // I will assume I cannot run it automatically and will just rely on the file being present for the user, 
    // OR I can try to use a direct postgres connection if `pg` is installed.
    // Checking package.json...
    console.log("Migration SQL prepared. Please run 'supabase/migrations/20240210_add_plan_columns.sql' in your Supabase SQL Editor.");
}

runMigration();
