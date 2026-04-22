-- Migration 013: Add avatar to users and priority to content tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Add priority to campaigns if missing
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Add priority to impact_stories if missing
ALTER TABLE impact_stories ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Add priority to campaign_items if missing
ALTER TABLE campaign_items ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
