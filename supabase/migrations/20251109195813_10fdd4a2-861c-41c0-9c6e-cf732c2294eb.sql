-- Create chat_groups table
CREATE TABLE IF NOT EXISTS public.chat_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  avatar_url TEXT
);

-- Create chat_group_members table
CREATE TABLE IF NOT EXISTS public.chat_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.chat_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create group_messages table
CREATE TABLE IF NOT EXISTS public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.chat_groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_by UUID[] DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_groups
CREATE POLICY "Users can view groups they are members of"
  ON public.chat_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_group_members
      WHERE group_id = chat_groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups"
  ON public.chat_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups"
  ON public.chat_groups FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their groups"
  ON public.chat_groups FOR DELETE
  USING (auth.uid() = created_by);

-- RLS policies for chat_group_members
CREATE POLICY "Users can view members of their groups"
  ON public.chat_group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_group_members cgm
      WHERE cgm.group_id = chat_group_members.group_id AND cgm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group creators can add members"
  ON public.chat_group_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_groups
      WHERE id = chat_group_members.group_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can leave groups"
  ON public.chat_group_members FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for group_messages
CREATE POLICY "Group members can view messages"
  ON public.group_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_group_members
      WHERE group_id = group_messages.group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can send messages"
  ON public.group_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chat_group_members
      WHERE group_id = group_messages.group_id AND user_id = auth.uid()
    )
  );

-- Update create_application_notification function to include candidate_id in link
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
  
  -- Create notification for recruiter with candidate_id in link
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (
    v_recruiter_id,
    'new_application',
    'Nuova candidatura!',
    v_candidate_name || ' si è candidato per "' || v_job_title || '"',
    NEW.candidate_id::TEXT
  );
  
  RETURN NEW;
END;
$$;