-- Trigger per assegnare punti automatici quando viene inviato un messaggio
CREATE OR REPLACE FUNCTION public.award_points_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_role TEXT;
BEGIN
  -- Get sender role
  SELECT role::TEXT INTO v_sender_role
  FROM profiles
  WHERE id = NEW.sender_id;
  
  -- Award points only if sender is recruiter
  IF v_sender_role = 'recruiter' THEN
    PERFORM award_recruiter_points(
      NEW.sender_id,
      'message_sent',
      5,
      'Messaggio inviato a candidato'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER award_points_on_message_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.award_points_on_message();

-- Trigger per assegnare punti quando viene creato un match
CREATE OR REPLACE FUNCTION public.award_points_on_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recruiter_id UUID;
BEGIN
  -- Get recruiter ID from job offer
  SELECT recruiter_id INTO v_recruiter_id
  FROM job_offers
  WHERE id = NEW.job_offer_id;
  
  IF v_recruiter_id IS NOT NULL THEN
    PERFORM award_recruiter_points(
      v_recruiter_id,
      'match_created',
      10,
      'Match confermato con candidato'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER award_points_on_match_trigger
AFTER INSERT ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.award_points_on_match();

-- Trigger per penalizzare punti quando TRS scende sotto 40
CREATE OR REPLACE FUNCTION public.penalize_low_trs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recruiter_id UUID;
BEGIN
  -- Check if TRS dropped below 40 (was above or equal before)
  IF NEW.talent_relationship_score < 40 AND 
     (OLD.talent_relationship_score IS NULL OR OLD.talent_relationship_score >= 40) THEN
    
    -- Find recruiters who interacted with this candidate
    FOR v_recruiter_id IN 
      SELECT DISTINCT recruiter_id 
      FROM interactions 
      WHERE candidate_id = NEW.id
      LIMIT 1
    LOOP
      PERFORM award_recruiter_points(
        v_recruiter_id,
        'trs_penalty',
        -3,
        'TRS candidato sceso sotto 40'
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER penalize_low_trs_trigger
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (NEW.talent_relationship_score IS DISTINCT FROM OLD.talent_relationship_score)
EXECUTE FUNCTION public.penalize_low_trs();