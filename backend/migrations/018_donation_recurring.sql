-- Records whether a donation set up a recurring subscription.
--
-- The frontend has always sent isRecurring, but nothing read it: the gift was
-- charged once and the donor was told it was monthly. Now that PesaPal
-- subscriptions are actually requested, the flag needs to be queryable so
-- recurring income can be told apart from one-off gifts.

ALTER TABLE donations
    ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_donations_recurring ON donations(is_recurring) WHERE is_recurring = TRUE;
