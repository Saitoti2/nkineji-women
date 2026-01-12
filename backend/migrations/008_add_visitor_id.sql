-- Migration 008: Add Visitor ID for anonymous comment management

ALTER TABLE impact_comments
ADD COLUMN visitor_id TEXT; -- specific ID generated on client side to allow 'ownership' logic for anonymous users

CREATE INDEX IF NOT EXISTS idx_impact_comments_visitor ON impact_comments(visitor_id);
