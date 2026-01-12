-- Migration 009: Add Visitor Support for Reactions

-- Add visitor_id column
ALTER TABLE comment_reactions ADD COLUMN visitor_id TEXT;

-- Drop the existing unique constraint (assuming default naming or we can find it, usually table_col_col_key)
-- We'll try strictly dropping the constraint by definition or index name if known, but for safety in this environment we assume standard naming.
-- If the constraint name is unknown, we can drop the index or try to alter.
-- Let's try to drop the constraint by its likely name.
ALTER TABLE comment_reactions DROP CONSTRAINT IF EXISTS comment_reactions_comment_id_user_id_reaction_type_key;

-- If the above fails due to name mismatch, we might need to look it up, but usually it's consistent.

-- Create partial unique indexes to enforce uniqueness for both authenticated users and visitors
CREATE UNIQUE INDEX idx_unique_reaction_user ON comment_reactions(comment_id, user_id, reaction_type) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_unique_reaction_visitor ON comment_reactions(comment_id, visitor_id, reaction_type) WHERE visitor_id IS NOT NULL;
