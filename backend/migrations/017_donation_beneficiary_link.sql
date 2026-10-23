-- Records which individual a donation sponsors.
--
-- donations could already be earmarked to a campaign, but sponsorships are
-- directed at a named person, which had nowhere to live except free-form
-- metadata. A real column makes "what has this donor funded" and "who funded
-- this beneficiary" answerable without parsing JSON.

ALTER TABLE donations
    ADD COLUMN IF NOT EXISTS beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_donations_beneficiary ON donations(beneficiary_id);
