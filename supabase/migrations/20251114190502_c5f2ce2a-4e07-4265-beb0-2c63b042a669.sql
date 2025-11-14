-- Add performance indexes for social feed
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON public.posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_created ON public.post_comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_user ON public.post_reactions(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_post_reposts_post_user ON public.post_reposts(post_id, user_id);

-- Add unique constraint to prevent duplicate reactions
ALTER TABLE public.post_reactions DROP CONSTRAINT IF EXISTS unique_post_user_reaction;
ALTER TABLE public.post_reactions ADD CONSTRAINT unique_post_user_reaction UNIQUE (post_id, user_id, reaction_type);

-- Add content length validation function
CREATE OR REPLACE FUNCTION public.validate_post_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Check content length (max 2000 chars)
  IF NEW.content IS NOT NULL AND LENGTH(NEW.content) > 2000 THEN
    RAISE EXCEPTION 'Il contenuto del post non può superare i 2000 caratteri';
  END IF;
  
  -- Check for script tags (basic XSS prevention)
  IF NEW.content IS NOT NULL AND (
    NEW.content ~* '<script' OR 
    NEW.content ~* 'javascript:' OR
    NEW.content ~* 'on\w+='
  ) THEN
    RAISE EXCEPTION 'Contenuto non valido: script o codice non consentito';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add content validation trigger for posts
DROP TRIGGER IF EXISTS validate_post_content_trigger ON public.posts;
CREATE TRIGGER validate_post_content_trigger
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_post_content();

-- Add comment length validation function
CREATE OR REPLACE FUNCTION public.validate_comment_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Check content is not empty
  IF NEW.content IS NULL OR TRIM(NEW.content) = '' THEN
    RAISE EXCEPTION 'Il commento non può essere vuoto';
  END IF;
  
  -- Check content length (max 800 chars)
  IF LENGTH(NEW.content) > 800 THEN
    RAISE EXCEPTION 'Il commento non può superare gli 800 caratteri';
  END IF;
  
  -- Check for script tags
  IF NEW.content ~* '<script' OR 
     NEW.content ~* 'javascript:' OR
     NEW.content ~* 'on\w+=' THEN
    RAISE EXCEPTION 'Contenuto non valido: script o codice non consentito';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add content validation trigger for comments
DROP TRIGGER IF EXISTS validate_comment_content_trigger ON public.post_comments;
CREATE TRIGGER validate_comment_content_trigger
  BEFORE INSERT OR UPDATE ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_comment_content();

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.user_post_rate_limit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'post' or 'comment'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user_rate_limit FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add index for rate limit queries
CREATE INDEX IF NOT EXISTS idx_rate_limit_user_action_time ON public.user_post_rate_limit(user_id, action_type, created_at DESC);

-- Enable RLS on rate limit table
ALTER TABLE public.user_post_rate_limit ENABLE ROW LEVEL SECURITY;

-- Policy: users can view their own rate limit records
CREATE POLICY "Users can view their rate limits"
  ON public.user_post_rate_limit FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: system can insert rate limit records
CREATE POLICY "System can insert rate limits"
  ON public.user_post_rate_limit FOR INSERT
  WITH CHECK (true);

-- Rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_user_id UUID, p_action_type TEXT, p_max_actions INT, p_time_window_minutes INT)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INT;
BEGIN
  -- Count recent actions
  SELECT COUNT(*) INTO v_count
  FROM public.user_post_rate_limit
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND created_at > NOW() - (p_time_window_minutes || ' minutes')::INTERVAL;
  
  -- Return true if under limit
  RETURN v_count < p_max_actions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to enforce rate limiting on posts
CREATE OR REPLACE FUNCTION public.enforce_post_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user has exceeded post rate limit (5 posts per 10 minutes)
  IF NOT public.check_rate_limit(NEW.user_id, 'post', 5, 10) THEN
    RAISE EXCEPTION 'Stai pubblicando troppo velocemente. Attendi qualche minuto.';
  END IF;
  
  -- Log the action
  INSERT INTO public.user_post_rate_limit (user_id, action_type)
  VALUES (NEW.user_id, 'post');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to enforce rate limiting on comments
CREATE OR REPLACE FUNCTION public.enforce_comment_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user has exceeded comment rate limit (10 comments per 5 minutes)
  IF NOT public.check_rate_limit(NEW.user_id, 'comment', 10, 5) THEN
    RAISE EXCEPTION 'Stai commentando troppo velocemente. Attendi qualche minuto.';
  END IF;
  
  -- Log the action
  INSERT INTO public.user_post_rate_limit (user_id, action_type)
  VALUES (NEW.user_id, 'comment');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add rate limit triggers
DROP TRIGGER IF EXISTS enforce_post_rate_limit_trigger ON public.posts;
CREATE TRIGGER enforce_post_rate_limit_trigger
  BEFORE INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_post_rate_limit();

DROP TRIGGER IF EXISTS enforce_comment_rate_limit_trigger ON public.post_comments;
CREATE TRIGGER enforce_comment_rate_limit_trigger
  BEFORE INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_comment_rate_limit();

-- Clean up old rate limit records (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_post_rate_limit
  WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;