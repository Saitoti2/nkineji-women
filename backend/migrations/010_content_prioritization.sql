-- Migration 010: Content Prioritization
-- Purpose: Add priority field to allow manual ordering of content

-- Add priority to campaigns
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_campaigns_priority ON campaigns(priority DESC, created_at DESC) WHERE is_deleted = FALSE;

-- Add priority and is_deleted to impact_stories
ALTER TABLE impact_stories ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
ALTER TABLE impact_stories ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_impact_stories_priority ON impact_stories(priority DESC, created_at DESC) WHERE status = 'published' AND is_deleted = FALSE;

-- Add priority to campaign_items (Essentials)
ALTER TABLE campaign_items ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_campaign_items_priority ON campaign_items(priority DESC, created_at DESC) WHERE is_deleted = FALSE;
