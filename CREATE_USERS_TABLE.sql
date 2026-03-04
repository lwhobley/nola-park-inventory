-- Create app_users table for NOLA Park inventory system
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pin TEXT NOT NULL UNIQUE,
  is_owner BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create index on PIN for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_users_pin ON app_users(pin);

-- Insert default owner user (Liffort Hobley with PIN 2445)
INSERT INTO app_users (name, pin, is_owner)
VALUES ('Liffort Hobley', '2445', true)
ON CONFLICT (pin) DO NOTHING;

-- Enable Row Level Security (optional - everyone can access their own data)
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read users
CREATE POLICY "Allow all users to read app_users"
  ON app_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow only owner to insert/update/delete
CREATE POLICY "Allow only owner operations"
  ON app_users
  FOR ALL
  USING (is_owner = true)
  WITH CHECK (is_owner = true);

-- Alternatively, if you want to allow all users (simpler):
-- DROP POLICY IF EXISTS "Allow all users to read app_users" ON app_users;
-- DROP POLICY IF EXISTS "Allow only owner operations" ON app_users;
-- ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;
