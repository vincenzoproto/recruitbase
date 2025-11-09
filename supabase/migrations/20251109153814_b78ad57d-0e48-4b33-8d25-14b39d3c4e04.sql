-- Add verified status and onboarding fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_verified BOOLEAN DEFAULT false;

-- Create achievements/badges table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('profile_complete', 'first_application', 'first_response', 'email_verified', 'linkedin_verified', 'premium_user', 'ambassador')),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
  ON achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements"
  ON achievements FOR INSERT
  WITH CHECK (true);

-- Create insights/analytics table
CREATE TABLE IF NOT EXISTS user_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, metric_type, date)
);

ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own insights"
  ON user_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert insights"
  ON user_insights FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update insights"
  ON user_insights FOR UPDATE
  USING (true);

-- Function to award achievement
CREATE OR REPLACE FUNCTION award_achievement(p_user_id UUID, p_badge_type TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO achievements (user_id, badge_type)
  VALUES (p_user_id, p_badge_type)
  ON CONFLICT (user_id, badge_type) DO NOTHING;
END;
$$;

-- Trigger for profile completion badge
CREATE OR REPLACE FUNCTION check_profile_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.full_name IS NOT NULL 
     AND NEW.city IS NOT NULL 
     AND NEW.bio IS NOT NULL 
     AND NEW.job_title IS NOT NULL THEN
    PERFORM award_achievement(NEW.id, 'profile_complete');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profile_complete_badge
AFTER INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION check_profile_complete();

-- Trigger for first application badge
CREATE OR REPLACE FUNCTION check_first_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM award_achievement(NEW.candidate_id, 'first_application');
  RETURN NEW;
END;
$$;

CREATE TRIGGER first_application_badge
AFTER INSERT ON applications
FOR EACH ROW
EXECUTE FUNCTION check_first_application();

-- Update insights on profile view
CREATE OR REPLACE FUNCTION update_profile_view_insights()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_insights (user_id, metric_type, metric_value, date)
  VALUES (NEW.viewed_profile_id, 'profile_views', 1, CURRENT_DATE)
  ON CONFLICT (user_id, metric_type, date)
  DO UPDATE SET metric_value = user_insights.metric_value + 1;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_insights_on_view
AFTER INSERT ON profile_views
FOR EACH ROW
EXECUTE FUNCTION update_profile_view_insights();

-- Update insights on application
CREATE OR REPLACE FUNCTION update_application_insights()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_insights (user_id, metric_type, metric_value, date)
  VALUES (NEW.candidate_id, 'applications_sent', 1, CURRENT_DATE)
  ON CONFLICT (user_id, metric_type, date)
  DO UPDATE SET metric_value = user_insights.metric_value + 1;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_insights_on_application
AFTER INSERT ON applications
FOR EACH ROW
EXECUTE FUNCTION update_application_insights();