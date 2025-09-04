ALTER TABLE organizations ADD COLUMN IF NOT EXISTS user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_organizations_user_id ON organizations(user_id);
