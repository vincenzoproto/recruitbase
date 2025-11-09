-- Tabella notifiche per sistema real-time
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'new_application', 'profile_view', 'new_message', 'match_found'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabella messaggi per chat integrata
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabella match intelligenti
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_offer_id UUID NOT NULL REFERENCES job_offers(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL, -- 0-100
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(candidate_id, job_offer_id)
);

-- Tabella storico visualizzazioni profilo
CREATE TABLE public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indici per performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_matches_candidate ON public.matches(candidate_id);
CREATE INDEX idx_matches_job_offer ON public.matches(job_offer_id);
CREATE INDEX idx_matches_score ON public.matches(match_score DESC);
CREATE INDEX idx_profile_views_viewer ON public.profile_views(viewer_id);
CREATE INDEX idx_profile_views_viewed ON public.profile_views(viewed_profile_id);

-- RLS policies per notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS policies per messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages"
ON public.messages FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
ON public.messages FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id);

-- RLS policies per matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can view their matches"
ON public.matches FOR SELECT
TO authenticated
USING (auth.uid() = candidate_id);

CREATE POLICY "Recruiters can view matches for their offers"
ON public.matches FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM job_offers
    WHERE job_offers.id = matches.job_offer_id
    AND job_offers.recruiter_id = auth.uid()
  )
);

CREATE POLICY "System can create matches"
ON public.matches FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS policies per profile_views
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view who viewed their profile"
ON public.profile_views FOR SELECT
TO authenticated
USING (auth.uid() = viewed_profile_id);

CREATE POLICY "Recruiters can view their viewing history"
ON public.profile_views FOR SELECT
TO authenticated
USING (auth.uid() = viewer_id);

CREATE POLICY "Users can create profile views"
ON public.profile_views FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = viewer_id);

-- Abilita realtime per tutte le tabelle
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

ALTER TABLE public.applications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;

ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;

-- Funzione per calcolare match score
CREATE OR REPLACE FUNCTION public.calculate_match_score(
  p_candidate_id UUID,
  p_job_offer_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score INTEGER := 0;
  v_candidate_skills TEXT[];
  v_candidate_city TEXT;
  v_job_sector TEXT;
  v_job_city TEXT;
  v_job_level TEXT;
  v_matching_skills INTEGER;
BEGIN
  -- Get candidate info
  SELECT skills, city INTO v_candidate_skills, v_candidate_city
  FROM profiles WHERE id = p_candidate_id;
  
  -- Get job info
  SELECT sector, city, experience_level::TEXT INTO v_job_sector, v_job_city, v_job_level
  FROM job_offers WHERE id = p_job_offer_id;
  
  -- City match (30 points)
  IF v_candidate_city = v_job_city THEN
    v_score := v_score + 30;
  END IF;
  
  -- Skills match (50 points max)
  IF v_candidate_skills IS NOT NULL AND array_length(v_candidate_skills, 1) > 0 THEN
    SELECT COUNT(*)::INTEGER INTO v_matching_skills
    FROM unnest(v_candidate_skills) AS skill
    WHERE skill ILIKE '%' || v_job_sector || '%';
    
    v_score := v_score + LEAST(v_matching_skills * 10, 50);
  END IF;
  
  -- Base score (20 points for having a profile)
  v_score := v_score + 20;
  
  RETURN LEAST(v_score, 100);
END;
$$;

-- Funzione trigger per creare notifiche automatiche
CREATE OR REPLACE FUNCTION public.create_application_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recruiter_id UUID;
  v_candidate_name TEXT;
  v_job_title TEXT;
BEGIN
  -- Get recruiter and job details
  SELECT jo.recruiter_id, jo.title, p.full_name
  INTO v_recruiter_id, v_job_title, v_candidate_name
  FROM job_offers jo
  JOIN profiles p ON p.id = NEW.candidate_id
  WHERE jo.id = NEW.job_offer_id;
  
  -- Create notification for recruiter
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (
    v_recruiter_id,
    'new_application',
    'Nuova candidatura!',
    v_candidate_name || ' si è candidato per "' || v_job_title || '"',
    '/dashboard'
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_application_created
  AFTER INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.create_application_notification();

-- Funzione trigger per creare notifiche visualizzazione profilo
CREATE OR REPLACE FUNCTION public.create_profile_view_notification()
RETURNS TRIGGER
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
  
  -- Create notification only if viewer is recruiter
  IF v_viewer_role = 'recruiter' THEN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      NEW.viewed_profile_id,
      'profile_view',
      'Profilo visualizzato!',
      'Un recruiter (' || v_viewer_name || ') ha visualizzato il tuo profilo',
      '/dashboard'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_view_created
  AFTER INSERT ON public.profile_views
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_view_notification();