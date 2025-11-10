-- Fix notification triggers to include post_id in link for deep-linking
CREATE OR REPLACE FUNCTION public.notify_post_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  post_author_id UUID;
  commenter_name TEXT;
BEGIN
  -- Get post author and commenter name
  SELECT user_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
  SELECT full_name INTO commenter_name FROM profiles WHERE id = NEW.user_id;
  
  -- Don't notify if user comments on their own post
  IF post_author_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      post_author_id,
      'post_comment',
      'Nuovo commento!',
      commenter_name || ' ha commentato il tuo post',
      NEW.post_id::TEXT
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix notification trigger for post reactions to include post_id
CREATE OR REPLACE FUNCTION public.notify_post_reaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  post_author_id UUID;
  reactor_name TEXT;
BEGIN
  -- Get post author and reactor name
  SELECT user_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
  SELECT full_name INTO reactor_name FROM profiles WHERE id = NEW.user_id;
  
  -- Don't notify if user likes their own post
  IF post_author_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      post_author_id,
      'post_reaction',
      'Nuovo like al tuo post!',
      reactor_name || ' ha messo like al tuo post',
      NEW.post_id::TEXT
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add trigger for meeting notification on insert
CREATE OR REPLACE FUNCTION public.notify_meeting_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Already handled in application code
  RETURN NEW;
END;
$function$;