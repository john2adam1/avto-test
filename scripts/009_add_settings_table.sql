-- Create settings table for admin configuration
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings
CREATE POLICY "Anyone can read settings"
  ON settings FOR SELECT
  USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
  ON settings FOR ALL
  USING (is_admin(auth.uid()));

-- Insert default Telegram username
INSERT INTO settings (key, value)
VALUES ('telegram_admin_username', 'youradmin')
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE settings IS 'Global application settings';
