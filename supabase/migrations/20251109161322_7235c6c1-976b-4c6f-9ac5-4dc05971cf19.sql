-- Add Talent Relationship Score field
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS talent_relationship_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS trs_last_updated TIMESTAMPTZ DEFAULT now();

-- Recruit Base TRS proprietary algorithm – do not disclose or export
-- This function calculates the Talent Relationship Score based on multiple weighted factors
CREATE OR REPLACE FUNCTION calculate_trs(candidate_uuid UUID, recruiter_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  communication_freq FLOAT := 0;
  response_time_score FLOAT := 0;
  positive_interactions FLOAT := 0;
  profile_completeness FLOAT := 0;
  notes_tags_score FLOAT := 0;
  final_score INTEGER;
  interaction_count INTEGER;
  days_active INTEGER;
  avg_response_hours FLOAT;
  total_interactions INTEGER;
  profile_fields_filled INTEGER;
BEGIN
  -- Communication frequency (weight 0.4)
  SELECT COUNT(*), EXTRACT(DAY FROM (now() - MIN(created_at)))
  INTO interaction_count, days_active
  FROM interactions
  WHERE candidate_id = candidate_uuid AND recruiter_id = recruiter_uuid;
  
  IF days_active > 0 AND interaction_count > 0 THEN
    communication_freq := LEAST((interaction_count::FLOAT / days_active) * 30, 1.0) * 0.4;
  END IF;

  -- Response time score (weight 0.25) - mock calculation based on engagement
  SELECT COALESCE(engagement_score, 0) INTO avg_response_hours
  FROM profiles WHERE id = candidate_uuid;
  
  response_time_score := LEAST(avg_response_hours / 100.0, 1.0) * 0.25;

  -- Positive interactions rate (weight 0.2)
  SELECT COUNT(*) INTO total_interactions
  FROM interactions
  WHERE candidate_id = candidate_uuid AND recruiter_id = recruiter_uuid
  AND type IN ('message', 'note', 'status_change');
  
  IF total_interactions > 0 THEN
    positive_interactions := LEAST(total_interactions / 10.0, 1.0) * 0.2;
  END IF;

  -- Profile completeness (weight 0.1)
  SELECT 
    (CASE WHEN full_name IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN job_title IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN city IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN bio IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN skills IS NOT NULL AND array_length(skills, 1) > 0 THEN 1 ELSE 0 END)
  INTO profile_fields_filled
  FROM profiles WHERE id = candidate_uuid;
  
  profile_completeness := (profile_fields_filled / 5.0) * 0.1;

  -- Tags and notes (weight 0.05)
  SELECT COUNT(*) INTO interaction_count
  FROM candidate_notes
  WHERE candidate_id = candidate_uuid AND recruiter_id = recruiter_uuid;
  
  notes_tags_score := LEAST(interaction_count / 5.0, 1.0) * 0.05;

  -- Calculate final score (0-100)
  final_score := ROUND((communication_freq + response_time_score + positive_interactions + profile_completeness + notes_tags_score) * 100);
  
  RETURN GREATEST(0, LEAST(100, final_score));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update TRS for a candidate
CREATE OR REPLACE FUNCTION update_candidate_trs()
RETURNS TRIGGER AS $$
DECLARE
  recruiter_uuid UUID;
  new_score INTEGER;
BEGIN
  -- Find the recruiter who interacts with this candidate
  SELECT DISTINCT recruiter_id INTO recruiter_uuid
  FROM interactions
  WHERE candidate_id = NEW.candidate_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF recruiter_uuid IS NOT NULL THEN
    new_score := calculate_trs(NEW.candidate_id, recruiter_uuid);
    
    UPDATE profiles
    SET talent_relationship_score = new_score,
        trs_last_updated = now()
    WHERE id = NEW.candidate_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update TRS on new interactions
DROP TRIGGER IF EXISTS update_trs_on_interaction ON interactions;
CREATE TRIGGER update_trs_on_interaction
AFTER INSERT ON interactions
FOR EACH ROW
EXECUTE FUNCTION update_candidate_trs();