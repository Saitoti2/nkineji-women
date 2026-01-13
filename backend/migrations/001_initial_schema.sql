-- Enable PostGIS extension for geographic data
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissions table
CREATE TABLE permissions (
  code VARCHAR(100) PRIMARY KEY,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table
CREATE TABLE organisations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  geo_boundary GEOGRAPHY(POLYGON, 4326),
  contact JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  role_id UUID REFERENCES roles(id),
  organisation_id UUID REFERENCES organisations(id),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Donors table
CREATE TABLE donors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  contact JSONB,
  tax_id VARCHAR(100),
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  goal_amount DECIMAL(15, 2) NOT NULL,
  raised_amount DECIMAL(15, 2) DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  earmark VARCHAR(100),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Donations table
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID REFERENCES donors(id),
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  campaign_id UUID REFERENCES campaigns(id),
  receipt_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  payment_provider_id VARCHAR(255), -- Stripe payment intent ID or M-PESA transaction ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Wallets table (for escrow/project wallets)
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_type VARCHAR(50) NOT NULL, -- 'campaign' or 'beneficiary'
  owner_id UUID NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Beneficiaries table
CREATE TABLE beneficiaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pseudo_id VARCHAR(50) UNIQUE NOT NULL, -- Public identifier
  full_name_encrypted TEXT NOT NULL, -- Encrypted PII
  gender VARCHAR(20) CHECK (gender IN ('female', 'male', 'other')),
  date_of_birth DATE,
  location_geo GEOGRAPHY(POINT, 4326),
  contact_info_encrypted TEXT, -- Encrypted contact info
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Consent records table
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  method VARCHAR(20) CHECK (method IN ('verbal', 'written', 'digital')),
  scope TEXT,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE
);

-- Rescue cases table
CREATE TABLE rescue_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiary_id UUID REFERENCES beneficiaries(id),
  intake_by UUID REFERENCES users(id),
  intake_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'intake', 'placed', 'closed')),
  safeguarding_flags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Case notes table (with strict ACLs)
CREATE TABLE case_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rescue_case_id UUID REFERENCES rescue_cases(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_sensitive BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Microloans table
CREATE TABLE microloans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID REFERENCES beneficiaries(id),
  amount DECIMAL(15, 2) NOT NULL,
  term_months INTEGER NOT NULL,
  schedule JSONB, -- Repayment schedule
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disbursed', 'active', 'completed', 'defaulted')),
  interest_rate DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Loan repayments table
CREATE TABLE loan_repayments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  microloan_id UUID REFERENCES microloans(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'waived')),
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Savings groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'savings', 'cooperative', etc.
  members JSONB DEFAULT '[]'::jsonb,
  contributions JSONB DEFAULT '[]'::jsonb,
  cycle_start DATE,
  cycle_end DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Group contributions table
CREATE TABLE group_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  member_id UUID REFERENCES beneficiaries(id),
  amount DECIMAL(15, 2) NOT NULL,
  contribution_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Incidents table
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  geom GEOGRAPHY(POINT, 4326) NOT NULL,
  reported_by UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'reported' CHECK (status IN ('reported', 'verified', 'action', 'closed')),
  description TEXT,
  affected_beneficiaries UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Incident photos table
CREATE TABLE incident_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  storage_key VARCHAR(500) NOT NULL,
  url TEXT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Corridors table (GIS)
CREATE TABLE corridors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  geometry GEOGRAPHY(LINESTRING, 4326) NOT NULL,
  species TEXT[],
  seasonality VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Boreholes table
CREATE TABLE boreholes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  geom GEOGRAPHY(POINT, 4326) NOT NULL,
  capacity DECIMAL(10, 2), -- Liters per hour
  status VARCHAR(50) DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'broken', 'planned')),
  telemetry_enabled BOOLEAN DEFAULT FALSE,
  installed_on DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- IoT Telemetry table
CREATE TABLE iot_telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id VARCHAR(100) NOT NULL,
  borehole_id UUID REFERENCES boreholes(id),
  metric VARCHAR(50) NOT NULL, -- 'water_level', 'flow_rate', 'temperature', etc.
  value DECIMAL(10, 2) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Disbursements table
CREATE TABLE disbursements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES wallets(id),
  beneficiary_id UUID REFERENCES beneficiaries(id),
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES',
  purpose TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'executed', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE,
  payment_provider_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Audit logs table (append-only)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'read'
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  diff_json JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refresh tokens table (for revocation)
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email) WHERE is_deleted = FALSE;
CREATE INDEX idx_users_phone ON users(phone) WHERE is_deleted = FALSE;
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_donations_donor ON donations(donor_id) WHERE is_deleted = FALSE;
-- CREATE INDEX idx_donations_campaign ON donations(campaign_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_beneficiaries_pseudo_id ON beneficiaries(pseudo_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_beneficiaries_location ON beneficiaries USING GIST(location_geo) WHERE is_deleted = FALSE;
CREATE INDEX idx_incidents_location ON incidents USING GIST(geom) WHERE is_deleted = FALSE;
CREATE INDEX idx_incidents_type ON incidents(type);
CREATE INDEX idx_corridors_geometry ON corridors USING GIST(geometry) WHERE is_deleted = FALSE;
CREATE INDEX idx_boreholes_location ON boreholes USING GIST(geom) WHERE is_deleted = FALSE;
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('super_admin', 'System owner with full access', '["*"]'::jsonb),
('admin', 'Organization administrator', '["campaigns:*", "donations:*", "beneficiaries:view", "reports:*"]'::jsonb),
('finance_officer', 'Financial operations and reconciliation', '["donations:view", "donations:export", "disbursements:approve", "reports:financial"]'::jsonb),
('conservation_officer', 'Conservation and GIS management', '["corridors:*", "incidents:*", "boreholes:*"]'::jsonb),
('health_officer', 'Maternal and women''s health', '["beneficiaries:view_sensitive", "patients:*", "vouchers:*"]'::jsonb),
('education_officer', 'Rescue and education programs', '["rescue_cases:*", "beneficiaries:view_sensitive", "sponsorships:*"]'::jsonb),
('field_officer', 'Field operations and data collection', '["incidents:create", "rescue_cases:create", "beneficiaries:create"]'::jsonb),
('community_rep', 'Community representative (read-only)', '["campaigns:read", "reports:public"]'::jsonb),
('donor', 'Registered donor', '["donations:own", "campaigns:read", "impact:view"]'::jsonb),
('auditor', 'External auditor (read-only)', '["audit:read", "reports:export"]'::jsonb);

