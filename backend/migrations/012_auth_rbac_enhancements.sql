-- Add Google ID to users for OAuth
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Update roles and permissions according to the new hierarchy
-- Permissions breakdown:
-- super_admin: Full transparency, managed via "*"
-- chief_admin: Operational management (Promote users to admin, edit items/prices, monitor donations/sales, add/remove admins/products/projects)
-- admin: "Watcher" role (read-only monitoring)

-- Ensure chief_admin exists
INSERT INTO roles (name, description, permissions) 
VALUES ('chief_admin', 'Chief Administrator with operational oversight', '["items:*", "donations:*", "users:promote_admin", "campaigns:*", "beneficiaries:view"]'::jsonb)
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions;

-- Update super_admin permissions (Full transparency)
UPDATE roles 
SET permissions = '["*"]'::jsonb, 
    description = 'System owner with full access and transparency'
WHERE name = 'super_admin';

-- Update admin permissions (Watcher/Read-only monitoring)
UPDATE roles 
SET permissions = '["*:view", "reports:read"]'::jsonb, 
    description = 'Administrator with read-only monitoring access'
WHERE name = 'admin';

-- Create initial super_admin if not exists (Optional, depends on seed logic, but good for testing)
-- We typically assume the first user created or a specific one is super_admin.
