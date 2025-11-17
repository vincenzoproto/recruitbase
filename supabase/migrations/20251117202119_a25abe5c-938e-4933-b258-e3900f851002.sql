-- Update calculate_smart_match_score function to use advanced profile data
CREATE OR REPLACE FUNCTION public.calculate_smart_match_score(p_job_offer_id uuid, p_candidate_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_skills_score INTEGER := 0;
  v_seniority_score INTEGER := 0;
  v_salary_score INTEGER := 0;
  v_location_score INTEGER := 0;
  v_availability_score INTEGER := 0;
  v_languages_score INTEGER := 0;
  
  v_candidate_skills TEXT[];
  v_candidate_city TEXT;
  v_candidate_seniority TEXT;
  v_candidate_salary_min INTEGER;
  v_candidate_salary_max INTEGER;
  v_candidate_availability_days INTEGER;
  v_candidate_remote_pref INTEGER;
  v_candidate_relocation BOOLEAN;
  v_candidate_languages JSONB;
  
  v_job_sector TEXT;
  v_job_city TEXT;
  v_job_level TEXT;
  v_job_description TEXT;
  
  v_matching_skills INTEGER;
  v_total_score INTEGER;
  v_breakdown JSONB;
BEGIN
  -- Get candidate data with new advanced fields
  SELECT 
    skills, city, seniority_level, salary_min, salary_max,
    availability_days, remote_preference, relocation_available,
    (SELECT jsonb_agg(jsonb_build_object('language', language, 'level', proficiency_level))
     FROM candidate_languages WHERE candidate_id = p_candidate_id)
  INTO v_candidate_skills, v_candidate_city, v_candidate_seniority, 
       v_candidate_salary_min, v_candidate_salary_max,
       v_candidate_availability_days, v_candidate_remote_pref, v_candidate_relocation,
       v_candidate_languages
  FROM profiles 
  WHERE id = p_candidate_id;
  
  -- Get job data
  SELECT sector, city, experience_level::TEXT, description
  INTO v_job_sector, v_job_city, v_job_level, v_job_description
  FROM job_offers 
  WHERE id = p_job_offer_id;
  
  -- 1. Skills match (40 points max)
  IF v_candidate_skills IS NOT NULL AND array_length(v_candidate_skills, 1) > 0 THEN
    SELECT COUNT(*)::INTEGER INTO v_matching_skills
    FROM unnest(v_candidate_skills) AS skill
    WHERE skill ILIKE '%' || v_job_sector || '%' 
       OR v_job_description ILIKE '%' || skill || '%';
    
    v_skills_score := LEAST(v_matching_skills * 10, 40);
  END IF;
  
  -- 2. Seniority match (15 points max)
  IF v_candidate_seniority IS NOT NULL AND v_job_level IS NOT NULL THEN
    v_seniority_score := CASE 
      WHEN v_job_level = 'entry' AND v_candidate_seniority IN ('Junior') THEN 15
      WHEN v_job_level = 'junior' AND v_candidate_seniority IN ('Junior', 'Middle') THEN 15
      WHEN v_job_level = 'mid' AND v_candidate_seniority IN ('Middle', 'Senior') THEN 15
      WHEN v_job_level = 'senior' AND v_candidate_seniority IN ('Senior', 'Lead') THEN 15
      WHEN v_job_level = 'lead' AND v_candidate_seniority = 'Lead' THEN 15
      ELSE 5
    END;
  END IF;
  
  -- 3. Salary fit (15 points max)
  -- Assuming job offers have implicit salary ranges based on level
  IF v_candidate_salary_min IS NOT NULL THEN
    -- Simple logic: if candidate's expectations are reasonable, give points
    v_salary_score := CASE v_job_level
      WHEN 'entry' THEN CASE WHEN v_candidate_salary_min <= 30000 THEN 15 ELSE 5 END
      WHEN 'junior' THEN CASE WHEN v_candidate_salary_min <= 35000 THEN 15 ELSE 5 END
      WHEN 'mid' THEN CASE WHEN v_candidate_salary_min <= 45000 THEN 15 ELSE 5 END
      WHEN 'senior' THEN CASE WHEN v_candidate_salary_min <= 60000 THEN 15 ELSE 5 END
      WHEN 'lead' THEN CASE WHEN v_candidate_salary_min <= 80000 THEN 15 ELSE 5 END
      ELSE 10
    END;
  ELSE
    v_salary_score := 10; -- Default if no salary specified
  END IF;
  
  -- 4. Location/Remote match (15 points max)
  IF v_candidate_city = v_job_city THEN
    v_location_score := 15;
  ELSIF v_candidate_relocation = true THEN
    v_location_score := 12;
  ELSIF v_candidate_remote_pref >= 50 THEN
    v_location_score := 10;
  ELSIF v_candidate_city IS NOT NULL THEN
    v_location_score := 5;
  END IF;
  
  -- 5. Availability (10 points max)
  IF v_candidate_availability_days IS NOT NULL THEN
    v_availability_score := CASE 
      WHEN v_candidate_availability_days = 0 THEN 10  -- Immediate
      WHEN v_candidate_availability_days <= 30 THEN 8
      WHEN v_candidate_availability_days <= 60 THEN 6
      ELSE 4
    END;
  ELSE
    v_availability_score := 5; -- Default
  END IF;
  
  -- 6. Languages (5 points max)
  IF v_candidate_languages IS NOT NULL AND jsonb_array_length(v_candidate_languages) > 0 THEN
    v_languages_score := LEAST(jsonb_array_length(v_candidate_languages) * 2, 5);
  END IF;
  
  -- Calculate total (out of 100)
  v_total_score := v_skills_score + v_seniority_score + v_salary_score + 
                   v_location_score + v_availability_score + v_languages_score;
  
  -- Build breakdown JSON
  v_breakdown := jsonb_build_object(
    'skills', v_skills_score,
    'seniority', v_seniority_score,
    'salary', v_salary_score,
    'location', v_location_score,
    'availability', v_availability_score,
    'languages', v_languages_score
  );
  
  -- Insert or update ranking with breakdown
  INSERT INTO candidate_rankings (
    job_offer_id,
    candidate_id,
    smart_match_score,
    skills_match_score,
    experience_score,
    location_score,
    last_calculated
  ) VALUES (
    p_job_offer_id,
    p_candidate_id,
    v_total_score,
    v_skills_score,
    v_seniority_score,
    v_location_score,
    now()
  )
  ON CONFLICT (job_offer_id, candidate_id)
  DO UPDATE SET
    smart_match_score = v_total_score,
    skills_match_score = v_skills_score,
    experience_score = v_seniority_score,
    location_score = v_location_score,
    last_calculated = now();
  
  RETURN v_total_score;
END;
$$;

-- Function to get top matches for a job offer
CREATE OR REPLACE FUNCTION public.get_matches_for_job(p_job_offer_id uuid, p_min_completion integer DEFAULT 40)
RETURNS TABLE (
  candidate_id uuid,
  full_name text,
  job_title text,
  seniority_level text,
  match_score integer,
  pipeline_stage_id uuid,
  avatar_url text,
  city text,
  years_experience integer,
  skills text[],
  availability_days integer,
  salary_min integer,
  salary_max integer,
  talent_relationship_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.job_title,
    p.seniority_level,
    COALESCE(cr.smart_match_score, 0) as match_score,
    p.pipeline_stage_id,
    p.avatar_url,
    p.city,
    p.years_experience,
    p.skills,
    p.availability_days,
    p.salary_min,
    p.salary_max,
    p.talent_relationship_score
  FROM profiles p
  LEFT JOIN candidate_rankings cr ON cr.candidate_id = p.id AND cr.job_offer_id = p_job_offer_id
  WHERE p.role = 'candidate'
    AND COALESCE(p.profile_completion_percentage, 0) >= p_min_completion
  ORDER BY COALESCE(cr.smart_match_score, 0) DESC, p.talent_relationship_score DESC
  LIMIT 50;
END;
$$;