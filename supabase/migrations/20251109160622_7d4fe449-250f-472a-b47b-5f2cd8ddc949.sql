-- Create pipeline_stages table for customizable recruitment stages
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  color TEXT DEFAULT '#007AFF',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create candidate_notes table for recruiter notes
CREATE TABLE IF NOT EXISTS candidate_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create candidate_tags table
CREATE TABLE IF NOT EXISTS candidate_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(candidate_id, tag_name)
);

-- Create interactions table for tracking all communications
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'message', 'note', 'status_change', 'email'
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create candidate_tasks table for reminders
CREATE TABLE IF NOT EXISTS candidate_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add new columns to profiles for TRM functionality
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS pipeline_stage_id UUID REFERENCES pipeline_stages(id),
ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS availability TEXT;

-- Enable RLS
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pipeline_stages
CREATE POLICY "Recruiters can manage their pipeline stages"
ON pipeline_stages FOR ALL
USING (recruiter_id = auth.uid());

-- RLS Policies for candidate_notes
CREATE POLICY "Recruiters can manage notes on candidates"
ON candidate_notes FOR ALL
USING (recruiter_id = auth.uid());

CREATE POLICY "Candidates can view their notes"
ON candidate_notes FOR SELECT
USING (candidate_id = auth.uid());

-- RLS Policies for candidate_tags
CREATE POLICY "Recruiters can manage tags"
ON candidate_tags FOR ALL
USING (EXISTS (
  SELECT 1 FROM candidate_notes 
  WHERE candidate_notes.candidate_id = candidate_tags.candidate_id 
  AND candidate_notes.recruiter_id = auth.uid()
));

CREATE POLICY "Candidates can view their tags"
ON candidate_tags FOR SELECT
USING (candidate_id = auth.uid());

-- RLS Policies for interactions
CREATE POLICY "Recruiters can manage their interactions"
ON interactions FOR ALL
USING (recruiter_id = auth.uid());

CREATE POLICY "Candidates can view their interactions"
ON interactions FOR SELECT
USING (candidate_id = auth.uid());

-- RLS Policies for candidate_tasks
CREATE POLICY "Recruiters can manage their tasks"
ON candidate_tasks FOR ALL
USING (recruiter_id = auth.uid());

-- Function to update last_contact_date automatically
CREATE OR REPLACE FUNCTION update_last_contact_date()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET last_contact_date = now(),
      engagement_score = COALESCE(engagement_score, 0) + 1
  WHERE id = NEW.candidate_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for updating last_contact_date on new interaction
CREATE TRIGGER on_new_interaction
AFTER INSERT ON interactions
FOR EACH ROW
EXECUTE FUNCTION update_last_contact_date();

-- Function to create default pipeline stages for new recruiters
CREATE OR REPLACE FUNCTION create_default_pipeline_stages()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'recruiter' THEN
    INSERT INTO pipeline_stages (recruiter_id, name, position, color)
    VALUES 
      (NEW.id, 'Nuovi candidati', 1, '#3B82F6'),
      (NEW.id, 'In contatto', 2, '#8B5CF6'),
      (NEW.id, 'In valutazione', 3, '#F59E0B'),
      (NEW.id, 'Assunti', 4, '#10B981');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for creating default stages
CREATE TRIGGER on_recruiter_created
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_default_pipeline_stages();

-- Function to check for candidates needing follow-up
CREATE OR REPLACE FUNCTION candidates_needing_followup(recruiter_uuid UUID)
RETURNS TABLE (
  candidate_id UUID,
  full_name TEXT,
  days_since_contact INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    EXTRACT(DAY FROM (now() - COALESCE(p.last_contact_date, p.created_at)))::INTEGER
  FROM profiles p
  WHERE p.role = 'candidate'
  AND EXISTS (
    SELECT 1 FROM interactions i 
    WHERE i.candidate_id = p.id 
    AND i.recruiter_id = recruiter_uuid
  )
  AND COALESCE(p.last_contact_date, p.created_at) < now() - INTERVAL '10 days'
  ORDER BY p.last_contact_date ASC NULLS FIRST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;