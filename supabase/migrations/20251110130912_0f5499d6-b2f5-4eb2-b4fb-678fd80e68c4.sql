-- Add core_values column to profiles table for Culture Fit calculation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS core_values TEXT[] DEFAULT '{}';

-- Add comment to explain the column
COMMENT ON COLUMN profiles.core_values IS 'Up to 5 core company/personal values for Culture Fit calculation';

-- Create index for better performance when querying values
CREATE INDEX IF NOT EXISTS idx_profiles_core_values ON profiles USING GIN(core_values);