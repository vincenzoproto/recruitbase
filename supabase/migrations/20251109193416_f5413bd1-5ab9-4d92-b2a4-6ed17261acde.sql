-- Add support for media messages
ALTER TABLE messages 
ADD COLUMN message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio')),
ADD COLUMN media_url TEXT;

-- Add role filter to profiles
CREATE INDEX IF NOT EXISTS idx_profiles_job_title ON profiles(job_title);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);