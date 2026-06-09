-- Migration 014: Fix comment_reactions foreign key to reference impact_comments instead of comments
-- The original migration 006 created comment_reactions with FK → comments table.
-- Migration 007 tried to recreate it (IF NOT EXISTS), so the old FK remained pointing to wrong table.
-- This migration drops and recreates comment_reactions correctly.

BEGIN;

-- Step 1: Drop the old comment_reactions table entirely (it has wrong FK to 'comments')
DROP TABLE IF EXISTS comment_reactions CASCADE;

-- Step 2: Recreate with correct FK → impact_comments, including visitor_id support (from migration 009)
CREATE TABLE comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES impact_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  visitor_id TEXT,
  reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'heart', 'celebrate', 'support')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Partial unique indexes (one reaction per user/visitor per comment per type)
CREATE UNIQUE INDEX idx_unique_reaction_user
  ON comment_reactions(comment_id, user_id, reaction_type)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX idx_unique_reaction_visitor
  ON comment_reactions(comment_id, visitor_id, reaction_type)
  WHERE visitor_id IS NOT NULL;

-- Step 4: Performance index
CREATE INDEX idx_comment_reactions_comment ON comment_reactions(comment_id);

COMMIT;
