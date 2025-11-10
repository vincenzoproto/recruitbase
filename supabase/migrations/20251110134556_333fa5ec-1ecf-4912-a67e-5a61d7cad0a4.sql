-- Create recruiter_points table for gamification
CREATE TABLE IF NOT EXISTS public.recruiter_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'Bronze',
  level_progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create recruiter_actions table to track point history
CREATE TABLE IF NOT EXISTS public.recruiter_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recruiter_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recruiter_points
CREATE POLICY "Users can view their own points"
ON public.recruiter_points FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own points"
ON public.recruiter_points FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points"
ON public.recruiter_points FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for recruiter_actions
CREATE POLICY "Users can view their own actions"
ON public.recruiter_actions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own actions"
ON public.recruiter_actions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to award points and track actions
CREATE OR REPLACE FUNCTION public.award_recruiter_points(
  p_user_id UUID,
  p_action_type TEXT,
  p_points INTEGER,
  p_description TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_points INTEGER;
  v_new_points INTEGER;
  v_new_level TEXT;
  v_new_progress INTEGER;
BEGIN
  -- Get or create recruiter points record
  INSERT INTO recruiter_points (user_id, points)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current points
  SELECT points INTO v_current_points
  FROM recruiter_points
  WHERE user_id = p_user_id;

  -- Calculate new points
  v_new_points := v_current_points + p_points;
  v_new_points := GREATEST(0, v_new_points); -- Can't go below 0

  -- Determine level based on points
  IF v_new_points >= 1000 THEN
    v_new_level := 'Platinum';
    v_new_progress := ((v_new_points - 1000) * 100) / 1000;
  ELSIF v_new_points >= 500 THEN
    v_new_level := 'Gold';
    v_new_progress := ((v_new_points - 500) * 100) / 500;
  ELSIF v_new_points >= 200 THEN
    v_new_level := 'Silver';
    v_new_progress := ((v_new_points - 200) * 100) / 300;
  ELSE
    v_new_level := 'Bronze';
    v_new_progress := (v_new_points * 100) / 200;
  END IF;

  -- Update points and level
  UPDATE recruiter_points
  SET 
    points = v_new_points,
    level = v_new_level,
    level_progress = LEAST(100, v_new_progress),
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Record the action
  INSERT INTO recruiter_actions (user_id, action_type, points, description)
  VALUES (p_user_id, p_action_type, p_points, p_description);
END;
$$;

-- Create index for better performance
CREATE INDEX idx_recruiter_points_user_id ON public.recruiter_points(user_id);
CREATE INDEX idx_recruiter_actions_user_id ON public.recruiter_actions(user_id);
CREATE INDEX idx_recruiter_actions_created_at ON public.recruiter_actions(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_recruiter_points_updated_at
BEFORE UPDATE ON public.recruiter_points
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();