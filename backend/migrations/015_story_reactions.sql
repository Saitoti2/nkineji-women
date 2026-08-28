-- Migration 015: Story-level reactions (likes on impact story cards)
CREATE TABLE IF NOT EXISTS story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES impact_stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  visitor_id TEXT,
  reaction_type VARCHAR(20) NOT NULL DEFAULT 'like'
    CHECK (reaction_type IN ('like', 'heart')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- One reaction per user per story
CREATE UNIQUE INDEX IF NOT EXISTS idx_story_reactions_user
  ON story_reactions(story_id, user_id, reaction_type)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_story_reactions_visitor
  ON story_reactions(story_id, visitor_id, reaction_type)
  WHERE visitor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_story_reactions_story ON story_reactions(story_id);
