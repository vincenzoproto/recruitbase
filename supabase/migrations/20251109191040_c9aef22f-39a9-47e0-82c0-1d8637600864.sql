-- Fix security warning for notify_meeting_request function
CREATE OR REPLACE FUNCTION notify_meeting_request()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notify the other person about the meeting request
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    link,
    read
  )
  VALUES (
    NEW.candidate_id,
    'meeting',
    'Nuova richiesta di call',
    'Hai ricevuto una richiesta di call. Clicca per confermare.',
    '/dashboard',
    false
  );
  
  RETURN NEW;
END;
$$;