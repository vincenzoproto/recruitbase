-- Fix security warning: add search_path to function
CREATE OR REPLACE FUNCTION notify_pending_meeting()
RETURNS TRIGGER AS $$
DECLARE
  recipient_name TEXT;
  sender_name TEXT;
  meeting_date_formatted TEXT;
BEGIN
  -- Only trigger for pending meetings
  IF NEW.status = 'pending' THEN
    -- Get the names of both parties
    SELECT full_name INTO recipient_name FROM profiles WHERE id = NEW.candidate_id;
    SELECT full_name INTO sender_name FROM profiles WHERE id = NEW.recruiter_id;
    
    -- Format the date
    meeting_date_formatted := to_char(NEW.scheduled_date, 'DD/MM/YYYY');
    
    -- Create notification for the candidate
    INSERT INTO notifications (user_id, type, title, message, link, read)
    VALUES (
      NEW.candidate_id,
      'meeting',
      '📅 Nuovo colloquio in attesa di conferma',
      sender_name || ' ha richiesto un colloquio per il ' || meeting_date_formatted || ' alle ' || NEW.scheduled_time,
      '/notifications',
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';