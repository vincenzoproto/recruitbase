-- Extend gamification system (integrate with existing)

-- Add XP field to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='profiles' AND column_name='xp') THEN
    ALTER TABLE profiles ADD COLUMN xp INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='profiles' AND column_name='level') THEN
    ALTER TABLE profiles ADD COLUMN level INTEGER DEFAULT 1;
  END IF;
END $$;

-- Create unified gamification_events table (extends recruiter_actions concept to all users)
CREATE TABLE IF NOT EXISTS gamification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  xp_awarded INTEGER DEFAULT 0,
  engagement_points INTEGER DEFAULT 0,
  trs_points INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_gamification_events_user_id ON gamification_events(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_events_created_at ON gamification_events(created_at DESC);

-- RLS policies
ALTER TABLE gamification_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own events"
  ON gamification_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
  ON gamification_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to award gamification points (centralized)
CREATE OR REPLACE FUNCTION award_gamification_points(
  p_user_id UUID,
  p_event_type TEXT,
  p_xp INTEGER DEFAULT 0,
  p_engagement INTEGER DEFAULT 0,
  p_trs INTEGER DEFAULT 0,
  p_metadata JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_current_xp INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Insert event
  INSERT INTO gamification_events (user_id, event_type, xp_awarded, engagement_points, trs_points, metadata)
  VALUES (p_user_id, p_event_type, p_xp, p_engagement, p_trs, p_metadata);
  
  -- Get current XP
  SELECT COALESCE(xp, 0) INTO v_current_xp FROM profiles WHERE id = p_user_id;
  
  -- Calculate new XP and level
  v_new_xp := v_current_xp + p_xp;
  v_new_level := GREATEST(1, FLOOR(v_new_xp / 500.0) + 1); -- Level up every 500 XP
  
  -- Update profile
  UPDATE profiles
  SET 
    xp = v_new_xp,
    level = v_new_level,
    engagement_score = COALESCE(engagement_score, 0) + p_engagement,
    talent_relationship_score = GREATEST(0, LEAST(100, COALESCE(talent_relationship_score, 0) + p_trs))
  WHERE id = p_user_id;
END;
$$;