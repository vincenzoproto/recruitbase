-- Add status enum for applications
CREATE TYPE application_status AS ENUM (
  'in_valutazione',
  'colloquio_programmato', 
  'assunto',
  'non_idoneo'
);

-- Update applications table with new fields
ALTER TABLE applications 
  DROP COLUMN IF EXISTS status CASCADE,
  ADD COLUMN status application_status DEFAULT 'in_valutazione',
  ADD COLUMN feedback_type TEXT CHECK (feedback_type IN ('positivo', 'neutro', 'negativo')),
  ADD COLUMN feedback_notes TEXT,
  ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create candidate history table
CREATE TABLE IF NOT EXISTS candidate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create follow_ups table
CREATE TABLE IF NOT EXISTS follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_contact TIMESTAMP WITH TIME ZONE DEFAULT now(),
  followup_due TIMESTAMP WITH TIME ZONE,
  followup_sent BOOLEAN DEFAULT false,
  followup_message TEXT,
  response_received BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE candidate_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

-- RLS policies for candidate_history
CREATE POLICY "Recruiters can view history of their candidates"
  ON candidate_history FOR SELECT
  USING (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can insert history"
  ON candidate_history FOR INSERT
  WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "Candidates can view their history"
  ON candidate_history FOR SELECT
  USING (candidate_id = auth.uid());

-- RLS policies for follow_ups
CREATE POLICY "Recruiters can manage their follow_ups"
  ON follow_ups FOR ALL
  USING (recruiter_id = auth.uid());

CREATE POLICY "Candidates can view their follow_ups"
  ON follow_ups FOR SELECT
  USING (candidate_id = auth.uid());

-- Function to calculate priority score
CREATE OR REPLACE FUNCTION calculate_priority_score(
  p_candidate_id UUID,
  p_recruiter_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_days_since_contact INTEGER;
  v_trs INTEGER;
  v_culture_fit FLOAT;
  v_priority INTEGER;
BEGIN
  -- Get days since last contact
  SELECT COALESCE(EXTRACT(DAY FROM (now() - MAX(last_contact))), 999)
  INTO v_days_since_contact
  FROM follow_ups
  WHERE candidate_id = p_candidate_id AND recruiter_id = p_recruiter_id;

  -- Get TRS
  SELECT COALESCE(talent_relationship_score, 0)
  INTO v_trs
  FROM profiles
  WHERE id = p_candidate_id;

  -- Get culture fit (mock - calculate based on core_values match)
  v_culture_fit := 80; -- Default value

  -- Calculate priority score
  v_priority := GREATEST(0, 100 - v_days_since_contact) + 
                ROUND(v_trs * 0.6) + 
                ROUND(v_culture_fit * 0.4);

  RETURN v_priority;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update TRS on application status change
CREATE OR REPLACE FUNCTION update_trs_on_application_status()
RETURNS TRIGGER AS $$
DECLARE
  v_points INTEGER := 0;
  v_recruiter_id UUID;
BEGIN
  -- Get recruiter from job offer
  SELECT recruiter_id INTO v_recruiter_id
  FROM job_offers
  WHERE id = NEW.job_offer_id;

  -- Calculate points based on status and feedback
  IF NEW.status = 'assunto' THEN
    v_points := 5;
  ELSIF NEW.status = 'non_idoneo' AND NEW.feedback_notes IS NULL THEN
    v_points := -2;
  ELSIF NEW.feedback_type = 'positivo' THEN
    v_points := 3;
  END IF;

  -- Update TRS if points changed
  IF v_points != 0 THEN
    UPDATE profiles
    SET talent_relationship_score = GREATEST(0, LEAST(100, COALESCE(talent_relationship_score, 0) + v_points))
    WHERE id = NEW.candidate_id;
  END IF;

  -- Log in history
  INSERT INTO candidate_history (
    candidate_id,
    recruiter_id,
    application_id,
    action_type,
    old_status,
    new_status,
    notes
  ) VALUES (
    NEW.candidate_id,
    v_recruiter_id,
    NEW.id,
    'status_change',
    OLD.status::TEXT,
    NEW.status::TEXT,
    NEW.feedback_notes
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_application_status_change
  AFTER UPDATE OF status ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_trs_on_application_status();

-- Trigger to update follow_up on contact
CREATE OR REPLACE FUNCTION update_followup_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or create follow_up record
  INSERT INTO follow_ups (candidate_id, recruiter_id, last_contact, followup_due)
  VALUES (
    CASE WHEN NEW.sender_id IN (SELECT id FROM profiles WHERE role = 'recruiter')
      THEN NEW.receiver_id ELSE NEW.sender_id END,
    CASE WHEN NEW.sender_id IN (SELECT id FROM profiles WHERE role = 'recruiter')
      THEN NEW.sender_id ELSE NEW.receiver_id END,
    now(),
    now() + INTERVAL '5 days'
  )
  ON CONFLICT (candidate_id, recruiter_id)
  DO UPDATE SET
    last_contact = now(),
    followup_due = now() + INTERVAL '5 days',
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_message_update_followup
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_followup_on_message();

-- Add unique constraint to follow_ups
ALTER TABLE follow_ups 
  ADD CONSTRAINT follow_ups_candidate_recruiter_key 
  UNIQUE (candidate_id, recruiter_id);

-- Notification trigger for application status change
CREATE OR REPLACE FUNCTION notify_candidate_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_job_title TEXT;
  v_status_text TEXT;
BEGIN
  -- Get job title
  SELECT title INTO v_job_title
  FROM job_offers
  WHERE id = NEW.job_offer_id;

  -- Map status to Italian text
  v_status_text := CASE NEW.status
    WHEN 'in_valutazione' THEN 'In valutazione'
    WHEN 'colloquio_programmato' THEN 'Colloquio programmato'
    WHEN 'assunto' THEN 'Assunto'
    WHEN 'non_idoneo' THEN 'Non idoneo'
  END;

  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (
    NEW.candidate_id,
    'application_status',
    'Stato candidatura aggiornato',
    'Il tuo stato per "' || v_job_title || '" è stato aggiornato a: ' || v_status_text,
    NEW.id::TEXT
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_status_notify_candidate
  AFTER UPDATE OF status ON applications
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_candidate_status_change();