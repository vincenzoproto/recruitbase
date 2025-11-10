-- Add triggers for social notifications

-- Trigger for post reactions (likes)
CREATE OR REPLACE FUNCTION notify_post_reaction()
RETURNS TRIGGER AS $$
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
      '/social'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_post_reaction_created
  AFTER INSERT ON post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_reaction();

-- Trigger for post comments
CREATE OR REPLACE FUNCTION notify_post_comment()
RETURNS TRIGGER AS $$
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
      '/social'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_post_comment_created
  AFTER INSERT ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_comment();