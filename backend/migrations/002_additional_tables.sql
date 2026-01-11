-- Additional tables for health, maternal care, and other modules

-- Patients table (for maternal health tracking)
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiary_id UUID REFERENCES beneficiaries(id),
  patient_number VARCHAR(50) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Antenatal visits table
CREATE TABLE antenatal_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  gestational_age_weeks INTEGER,
  blood_pressure VARCHAR(20),
  weight_kg DECIMAL(5, 2),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  referral_type VARCHAR(50) NOT NULL, -- 'maternal', 'cancer_screening', 'fistula', etc.
  referred_to VARCHAR(255) NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  referral_date DATE NOT NULL,
  completed_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Screening campaigns table
CREATE TABLE screening_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_type VARCHAR(50) NOT NULL, -- 'cancer', 'fistula', etc.
  start_date DATE NOT NULL,
  end_date DATE,
  location_geo GEOGRAPHY(POINT, 4326),
  participants_count INTEGER DEFAULT 0,
  outcomes JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Health vouchers table
CREATE TABLE health_vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  beneficiary_id UUID REFERENCES beneficiaries(id),
  campaign_id UUID REFERENCES campaigns(id),
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES',
  purpose VARCHAR(255), -- 'maternal_care', 'cancer_treatment', etc.
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  redeemed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grazing plans table
CREATE TABLE grazing_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corridor_id UUID REFERENCES corridors(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  assigned_to VARCHAR(255), -- Community or group name
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Media attachments table (for documents, photos, etc.)
CREATE TABLE media_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_type VARCHAR(50) NOT NULL, -- 'rescue_case', 'incident', 'beneficiary', etc.
  resource_id UUID NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  url TEXT,
  file_name VARCHAR(255),
  file_type VARCHAR(100),
  file_size BIGINT,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push'
  channel VARCHAR(50) NOT NULL,
  recipient VARCHAR(255) NOT NULL, -- email, phone, etc.
  subject VARCHAR(255),
  body TEXT NOT NULL,
  template_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification templates table
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push'
  subject VARCHAR(255),
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- Available template variables
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Sync batch table (for offline sync)
CREATE TABLE sync_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id VARCHAR(255) NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  items_count INTEGER DEFAULT 0,
  processed_count INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Sync items table
CREATE TABLE sync_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES sync_batches(id) ON DELETE CASCADE,
  local_id VARCHAR(255) NOT NULL,
  server_id UUID,
  resource_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'conflict', 'error')),
  conflict_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_patients_beneficiary ON patients(beneficiary_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_antenatal_visits_patient ON antenatal_visits(patient_id);
CREATE INDEX idx_referrals_patient ON referrals(patient_id);
CREATE INDEX idx_health_vouchers_code ON health_vouchers(code) WHERE status = 'active';
CREATE INDEX idx_health_vouchers_beneficiary ON health_vouchers(beneficiary_id);
CREATE INDEX idx_media_attachments_resource ON media_attachments(resource_type, resource_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_sync_batches_device ON sync_batches(device_id);
CREATE INDEX idx_sync_items_batch ON sync_items(batch_id);
CREATE INDEX idx_sync_items_local_id ON sync_items(local_id);



