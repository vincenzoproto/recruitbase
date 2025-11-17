-- Aggiungi nuovi campi alla tabella profiles per la profilazione completa
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS relocation_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS remote_preference INTEGER DEFAULT 0 CHECK (remote_preference >= 0 AND remote_preference <= 100),
ADD COLUMN IF NOT EXISTS seniority_level TEXT CHECK (seniority_level IN ('junior', 'middle', 'senior', 'lead')),
ADD COLUMN IF NOT EXISTS professional_summary TEXT,
ADD COLUMN IF NOT EXISTS desired_roles TEXT[],
ADD COLUMN IF NOT EXISTS contract_type_preference TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS salary_min INTEGER,
ADD COLUMN IF NOT EXISTS salary_max INTEGER,
ADD COLUMN IF NOT EXISTS availability_days INTEGER,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_matching_vector JSONB DEFAULT '{}';

-- Tabella per esperienze lavorative (ripetibile)
CREATE TABLE IF NOT EXISTS work_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  responsibilities TEXT,
  achievements TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella per formazione
CREATE TABLE IF NOT EXISTS education_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  degree_title TEXT NOT NULL,
  institution TEXT NOT NULL,
  graduation_year INTEGER,
  additional_courses TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella per lingue con livello
CREATE TABLE IF NOT EXISTS candidate_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(candidate_id, language)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_work_experiences_candidate ON work_experiences(candidate_id);
CREATE INDEX IF NOT EXISTS idx_education_records_candidate ON education_records(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_languages_candidate ON candidate_languages(candidate_id);
CREATE INDEX IF NOT EXISTS idx_profiles_completion ON profiles(profile_completion_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_seniority ON profiles(seniority_level);

-- RLS per work_experiences
ALTER TABLE work_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own work experiences"
ON work_experiences FOR SELECT
USING (auth.uid() = candidate_id);

CREATE POLICY "Users can insert their own work experiences"
ON work_experiences FOR INSERT
WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Users can update their own work experiences"
ON work_experiences FOR UPDATE
USING (auth.uid() = candidate_id);

CREATE POLICY "Users can delete their own work experiences"
ON work_experiences FOR DELETE
USING (auth.uid() = candidate_id);

CREATE POLICY "Recruiters can view candidates work experiences"
ON work_experiences FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'recruiter'
));

-- RLS per education_records
ALTER TABLE education_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own education"
ON education_records FOR SELECT
USING (auth.uid() = candidate_id);

CREATE POLICY "Users can insert their own education"
ON education_records FOR INSERT
WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Users can update their own education"
ON education_records FOR UPDATE
USING (auth.uid() = candidate_id);

CREATE POLICY "Users can delete their own education"
ON education_records FOR DELETE
USING (auth.uid() = candidate_id);

CREATE POLICY "Recruiters can view candidates education"
ON education_records FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'recruiter'
));

-- RLS per candidate_languages
ALTER TABLE candidate_languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own languages"
ON candidate_languages FOR SELECT
USING (auth.uid() = candidate_id);

CREATE POLICY "Users can insert their own languages"
ON candidate_languages FOR INSERT
WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Users can update their own languages"
ON candidate_languages FOR UPDATE
USING (auth.uid() = candidate_id);

CREATE POLICY "Users can delete their own languages"
ON candidate_languages FOR DELETE
USING (auth.uid() = candidate_id);

CREATE POLICY "Recruiters can view candidates languages"
ON candidate_languages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'recruiter'
));

-- Funzione per calcolare la percentuale di completamento profilo
CREATE OR REPLACE FUNCTION calculate_profile_completion(p_profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
  v_total INTEGER := 100;
  v_profile RECORD;
  v_has_experiences BOOLEAN;
  v_has_education BOOLEAN;
  v_has_languages BOOLEAN;
BEGIN
  -- Get profile data
  SELECT * INTO v_profile FROM profiles WHERE id = p_profile_id;
  
  -- Check related data
  SELECT EXISTS(SELECT 1 FROM work_experiences WHERE candidate_id = p_profile_id) INTO v_has_experiences;
  SELECT EXISTS(SELECT 1 FROM education_records WHERE candidate_id = p_profile_id) INTO v_has_education;
  SELECT EXISTS(SELECT 1 FROM candidate_languages WHERE candidate_id = p_profile_id) INTO v_has_languages;
  
  -- Base info (30 points)
  IF v_profile.full_name IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_profile.city IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_profile.age IS NOT NULL THEN v_score := v_score + 3; END IF;
  IF v_profile.phone_number IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_profile.avatar_url IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_profile.cv_url IS NOT NULL THEN v_score := v_score + 7; END IF;
  
  -- Professional summary (15 points)
  IF v_profile.job_title IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_profile.seniority_level IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_profile.professional_summary IS NOT NULL THEN v_score := v_score + 5; END IF;
  
  -- Work preferences (20 points)
  IF v_profile.desired_roles IS NOT NULL AND array_length(v_profile.desired_roles, 1) > 0 THEN v_score := v_score + 5; END IF;
  IF v_profile.contract_type_preference IS NOT NULL AND array_length(v_profile.contract_type_preference, 1) > 0 THEN v_score := v_score + 5; END IF;
  IF v_profile.salary_min IS NOT NULL AND v_profile.salary_max IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_profile.availability_days IS NOT NULL THEN v_score := v_score + 5; END IF;
  
  -- Skills (15 points)
  IF v_profile.skills IS NOT NULL AND array_length(v_profile.skills, 1) > 2 THEN v_score := v_score + 10; END IF;
  IF v_has_languages THEN v_score := v_score + 5; END IF;
  
  -- Experience & Education (20 points)
  IF v_has_experiences THEN v_score := v_score + 10; END IF;
  IF v_has_education THEN v_score := v_score + 10; END IF;
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per aggiornare automaticamente la percentuale
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion_percentage := calculate_profile_completion(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_profile_completion
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profile_completion();

-- Funzione per ricalcolare quando cambia work_experiences
CREATE OR REPLACE FUNCTION recalculate_profile_completion_on_related()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET profile_completion_percentage = calculate_profile_completion(
    COALESCE(NEW.candidate_id, OLD.candidate_id)
  )
  WHERE id = COALESCE(NEW.candidate_id, OLD.candidate_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_work_exp_completion
AFTER INSERT OR UPDATE OR DELETE ON work_experiences
FOR EACH ROW
EXECUTE FUNCTION recalculate_profile_completion_on_related();

CREATE TRIGGER trg_education_completion
AFTER INSERT OR UPDATE OR DELETE ON education_records
FOR EACH ROW
EXECUTE FUNCTION recalculate_profile_completion_on_related();

CREATE TRIGGER trg_languages_completion
AFTER INSERT OR UPDATE OR DELETE ON candidate_languages
FOR EACH ROW
EXECUTE FUNCTION recalculate_profile_completion_on_related();