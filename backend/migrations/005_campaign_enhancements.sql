-- Add image_url and category to campaigns
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category) WHERE is_deleted = FALSE;
