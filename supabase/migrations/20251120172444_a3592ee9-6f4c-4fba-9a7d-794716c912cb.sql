-- Create notification triggers for better notification management

-- Trigger for new matches
CREATE OR REPLACE FUNCTION notify_match_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_candidate_name TEXT;
  v_job_title TEXT;
BEGIN
  -- Get candidate and job details
  SELECT p.full_name, jo.title
  INTO v_candidate_name, v_job_title
  FROM profiles p, job_offers jo
  WHERE p.id = NEW.candidate_id AND jo.id = NEW.job_offer_id;
  
  -- Notify candidate
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (
    NEW.candidate_id,
    'match_found',
    '🎯 Nuovo Match!',
    'Hai un nuovo match con l''offerta: ' || v_job_title,
    NEW.job_offer_id::TEXT
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_match_created ON matches;
CREATE TRIGGER on_match_created
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION notify_match_created();

-- Trigger for profile views (only for recruiters viewing candidates)
CREATE OR REPLACE FUNCTION notify_profile_viewed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_viewer_name TEXT;
  v_viewer_role TEXT;
BEGIN
  -- Get viewer details
  SELECT full_name, role::TEXT INTO v_viewer_name, v_viewer_role
  FROM profiles WHERE id = NEW.viewer_id;
  
  -- Only notify if viewer is a recruiter
  IF v_viewer_role = 'recruiter' THEN
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      NEW.viewed_profile_id,
      'profile_view',
      '👀 Profilo Visualizzato',
      v_viewer_name || ' ha visualizzato il tuo profilo',
      CURRENT_TIMESTAMP
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_view_created ON profile_views;
CREATE TRIGGER on_profile_view_created
  AFTER INSERT ON profile_views
  FOR EACH ROW
  EXECUTE FUNCTION notify_profile_viewed();

-- Ensure gamification events award points correctly
CREATE OR REPLACE FUNCTION trigger_gamification_on_profile_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if profile is now complete (profile_completion_percentage = 100)
  IF NEW.profile_completion_percentage >= 100 AND 
     (OLD.profile_completion_percentage IS NULL OR OLD.profile_completion_percentage < 100) THEN
    
    -- Award profile completion achievement
    INSERT INTO achievements (user_id, badge_type)
    VALUES (NEW.id, 'profile_complete')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
    
    -- Award gamification points
    PERFORM award_gamification_points(
      NEW.id,
      'profile_completed',
      50,  -- xp
      10,  -- engagement
      5,   -- trs
      jsonb_build_object('completion', NEW.profile_completion_percentage)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_complete ON profiles;
CREATE TRIGGER on_profile_complete
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_gamification_on_profile_complete();