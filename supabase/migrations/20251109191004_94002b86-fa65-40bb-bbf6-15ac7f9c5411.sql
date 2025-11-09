-- Add confirmation status to meetings table
ALTER TABLE meetings 
ALTER COLUMN status SET DEFAULT 'pending';

-- Add comment for clarity
COMMENT ON COLUMN meetings.status IS 'Status can be: pending, confirmed, cancelled, rejected';

-- Create notification when meeting is created
CREATE OR REPLACE FUNCTION notify_meeting_request()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for meeting requests
DROP TRIGGER IF EXISTS on_meeting_created ON meetings;
CREATE TRIGGER on_meeting_created
  AFTER INSERT ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION notify_meeting_request();