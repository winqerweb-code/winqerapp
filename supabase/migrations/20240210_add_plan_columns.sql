-- Add plan and usage tracking columns to stores table
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS usage_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_usage_date date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS total_usage_count integer DEFAULT 0;

-- Create index for faster lookup on plan related queries if needed (optional but good practice)
CREATE INDEX IF NOT EXISTS idx_stores_plan_type ON stores(plan_type);
CREATE INDEX IF NOT EXISTS idx_stores_stripe_customer_id ON stores(stripe_customer_id);
