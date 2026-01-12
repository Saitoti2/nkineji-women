-- Migration 007: Impact Stories and Interaction System

-- Public Impact Stories (Option 1: Separate from private beneficiaries)
CREATE TABLE IF NOT EXISTS impact_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_name VARCHAR(255) NOT NULL, -- Public display name
  beneficiary_age INTEGER,
  location VARCHAR(255),
  profile_image_url TEXT,
  short_bio TEXT,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  impact_summary TEXT,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE SET NULL, -- Opt-in link to private record
  status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Media for stories (Images and Videos)
CREATE TABLE IF NOT EXISTS story_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES impact_stories(id) ON DELETE CASCADE,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- social-media style comments (nested)
CREATE TABLE IF NOT EXISTS impact_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES impact_stories(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES impact_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255) NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'deleted')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Comment reactions (Likes/Hearts)
CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES impact_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'heart', 'celebrate', 'support')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_impact_stories_campaign ON impact_stories(campaign_id);
CREATE INDEX IF NOT EXISTS idx_impact_stories_status ON impact_stories(status);
CREATE INDEX IF NOT EXISTS idx_story_media_story ON story_media(story_id);
CREATE INDEX IF NOT EXISTS idx_impact_comments_story ON impact_comments(story_id);
CREATE INDEX IF NOT EXISTS idx_impact_comments_parent ON impact_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_impact_stories_updated_at BEFORE UPDATE ON impact_stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_impact_comments_updated_at BEFORE UPDATE ON impact_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
