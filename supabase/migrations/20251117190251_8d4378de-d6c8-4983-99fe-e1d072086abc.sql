-- Create candidate_rankings table for AI-powered matching
CREATE TABLE IF NOT EXISTS public.candidate_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_offer_id UUID NOT NULL REFERENCES public.job_offers(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  
  -- Score components (0-100 each)
  smart_match_score INTEGER NOT NULL DEFAULT 0,
  skills_match_score INTEGER DEFAULT 0,
  experience_score INTEGER DEFAULT 0,
  location_score INTEGER DEFAULT 0,
  job_title_score INTEGER DEFAULT 0,
  cv_relevance_score INTEGER DEFAULT 0,
  response_quality_score INTEGER DEFAULT 0,
  profile_completeness_score INTEGER DEFAULT 0,
  
  -- AI-generated insights
  match_reasons JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(job_offer_id, candidate_id)
);

-- Enable RLS
ALTER TABLE public.candidate_rankings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Recruiters can view rankings for their jobs"
  ON public.candidate_rankings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.job_offers
      WHERE job_offers.id = candidate_rankings.job_offer_id
      AND job_offers.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "System can manage rankings"
  ON public.candidate_rankings
  FOR ALL
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_candidate_rankings_job_score ON public.candidate_rankings(job_offer_id, smart_match_score DESC);
CREATE INDEX idx_candidate_rankings_candidate ON public.candidate_rankings(candidate_id);
CREATE INDEX idx_candidate_rankings_application ON public.candidate_rankings(application_id);

-- Enhanced function to calculate smart match score
CREATE OR REPLACE FUNCTION public.calculate_smart_match_score(
  p_job_offer_id UUID,
  p_candidate_id UUID
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_skills_score INTEGER := 0;
  v_experience_score INTEGER := 0;
  v_location_score INTEGER := 0;
  v_job_title_score INTEGER := 0;
  v_profile_score INTEGER := 0;
  v_response_score INTEGER := 0;
  
  v_candidate_skills TEXT[];
  v_candidate_city TEXT;
  v_candidate_title TEXT;
  v_candidate_experience INTEGER;
  
  v_job_sector TEXT;
  v_job_city TEXT;
  v_job_level TEXT;
  v_job_description TEXT;
  
  v_matching_skills INTEGER;
  v_recent_messages INTEGER;
  v_profile_fields INTEGER;
  v_total_score INTEGER;
BEGIN
  -- Get candidate data
  SELECT 
    skills, city, job_title, COALESCE(years_experience, 0),
    (CASE WHEN full_name IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN job_title IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN bio IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN city IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN cv_url IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN skills IS NOT NULL AND array_length(skills, 1) > 0 THEN 1 ELSE 0 END)
  INTO v_candidate_skills, v_candidate_city, v_candidate_title, v_candidate_experience, v_profile_fields
  FROM profiles 
  WHERE id = p_candidate_id;
  
  -- Get job data
  SELECT sector, city, experience_level::TEXT, description
  INTO v_job_sector, v_job_city, v_job_level, v_job_description
  FROM job_offers 
  WHERE id = p_job_offer_id;
  
  -- 1. Skills match (30 points max)
  IF v_candidate_skills IS NOT NULL AND array_length(v_candidate_skills, 1) > 0 THEN
    SELECT COUNT(*)::INTEGER INTO v_matching_skills
    FROM unnest(v_candidate_skills) AS skill
    WHERE skill ILIKE '%' || v_job_sector || '%' 
       OR v_job_description ILIKE '%' || skill || '%';
    
    v_skills_score := LEAST(v_matching_skills * 10, 30);
  END IF;
  
  -- 2. Experience level (25 points max)
  v_experience_score := CASE v_job_level
    WHEN 'entry' THEN CASE WHEN v_candidate_experience <= 2 THEN 25 ELSE 15 END
    WHEN 'junior' THEN CASE WHEN v_candidate_experience BETWEEN 1 AND 4 THEN 25 ELSE 15 END
    WHEN 'mid' THEN CASE WHEN v_candidate_experience BETWEEN 3 AND 7 THEN 25 ELSE 15 END
    WHEN 'senior' THEN CASE WHEN v_candidate_experience >= 5 THEN 25 ELSE 15 END
    WHEN 'lead' THEN CASE WHEN v_candidate_experience >= 8 THEN 25 ELSE 15 END
    ELSE 10
  END;
  
  -- 3. Location match (15 points max)
  IF v_candidate_city = v_job_city THEN
    v_location_score := 15;
  ELSIF v_candidate_city IS NOT NULL AND v_job_city IS NOT NULL THEN
    v_location_score := 5;
  END IF;
  
  -- 4. Job title relevance (15 points max)
  IF v_candidate_title IS NOT NULL THEN
    IF v_candidate_title ILIKE '%' || v_job_sector || '%' OR v_job_sector ILIKE '%' || v_candidate_title || '%' THEN
      v_job_title_score := 15;
    ELSIF v_job_description ILIKE '%' || v_candidate_title || '%' THEN
      v_job_title_score := 10;
    ELSE
      v_job_title_score := 5;
    END IF;
  END IF;
  
  -- 5. Profile completeness (10 points max)
  v_profile_score := ROUND((v_profile_fields::NUMERIC / 6.0) * 10);
  
  -- 6. Response quality (5 points max) - based on recent messaging activity
  SELECT COUNT(*) INTO v_recent_messages
  FROM messages
  WHERE sender_id = p_candidate_id
  AND created_at > now() - INTERVAL '30 days'
  LIMIT 10;
  
  v_response_score := LEAST(v_recent_messages, 5);
  
  -- Calculate total (out of 100)
  v_total_score := v_skills_score + v_experience_score + v_location_score + 
                   v_job_title_score + v_profile_score + v_response_score;
  
  -- Insert or update ranking
  INSERT INTO candidate_rankings (
    job_offer_id,
    candidate_id,
    smart_match_score,
    skills_match_score,
    experience_score,
    location_score,
    job_title_score,
    profile_completeness_score,
    response_quality_score,
    last_calculated
  ) VALUES (
    p_job_offer_id,
    p_candidate_id,
    v_total_score,
    v_skills_score,
    v_experience_score,
    v_location_score,
    v_job_title_score,
    v_profile_score,
    v_response_score,
    now()
  )
  ON CONFLICT (job_offer_id, candidate_id)
  DO UPDATE SET
    smart_match_score = v_total_score,
    skills_match_score = v_skills_score,
    experience_score = v_experience_score,
    location_score = v_location_score,
    job_title_score = v_job_title_score,
    profile_completeness_score = v_profile_score,
    response_quality_score = v_response_score,
    last_calculated = now();
  
  RETURN v_total_score;
END;
$$;

-- Trigger to auto-update rankings when applications are created
CREATE OR REPLACE FUNCTION public.update_ranking_on_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score INTEGER;
BEGIN
  v_score := calculate_smart_match_score(NEW.job_offer_id, NEW.candidate_id);
  
  UPDATE candidate_rankings
  SET application_id = NEW.id
  WHERE job_offer_id = NEW.job_offer_id
  AND candidate_id = NEW.candidate_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_ranking_on_application
AFTER INSERT ON public.applications
FOR EACH ROW
EXECUTE FUNCTION update_ranking_on_application();

-- Trigger to recalculate when profile updates
CREATE OR REPLACE FUNCTION public.recalculate_rankings_on_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Recalculate all rankings for this candidate
  PERFORM calculate_smart_match_score(cr.job_offer_id, NEW.id)
  FROM candidate_rankings cr
  WHERE cr.candidate_id = NEW.id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_recalculate_rankings_profile
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (
  OLD.skills IS DISTINCT FROM NEW.skills OR
  OLD.job_title IS DISTINCT FROM NEW.job_title OR
  OLD.city IS DISTINCT FROM NEW.city OR
  OLD.years_experience IS DISTINCT FROM NEW.years_experience
)
EXECUTE FUNCTION recalculate_rankings_on_profile_update();

-- Trigger to recalculate when job offer updates
CREATE OR REPLACE FUNCTION public.recalculate_rankings_on_job_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Recalculate all rankings for this job
  PERFORM calculate_smart_match_score(NEW.id, cr.candidate_id)
  FROM candidate_rankings cr
  WHERE cr.job_offer_id = NEW.id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_recalculate_rankings_job
AFTER UPDATE ON public.job_offers
FOR EACH ROW
WHEN (
  OLD.sector IS DISTINCT FROM NEW.sector OR
  OLD.city IS DISTINCT FROM NEW.city OR
  OLD.experience_level IS DISTINCT FROM NEW.experience_level OR
  OLD.description IS DISTINCT FROM NEW.description
)
EXECUTE FUNCTION recalculate_rankings_on_job_update();