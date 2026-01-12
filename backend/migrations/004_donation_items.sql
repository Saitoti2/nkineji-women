-- Campaign Items (Essentials that can be donated)
CREATE TABLE campaign_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id), -- Optional link to specific campaign, or null for general
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  unit_price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Donation Items (Line items for a donation)
CREATE TABLE donation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
  item_id UUID REFERENCES campaign_items(id),
  quantity INTEGER NOT NULL,
  unit_price_at_time DECIMAL(10, 2) NOT NULL, -- Snapshot price
  subtotal DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_campaign_items_campaign ON campaign_items(campaign_id);
CREATE INDEX idx_donation_items_donation ON donation_items(donation_id);
