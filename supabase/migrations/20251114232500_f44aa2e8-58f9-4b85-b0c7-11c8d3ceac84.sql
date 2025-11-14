-- Create connections/followers table
CREATE TABLE public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Policies for connections
CREATE POLICY "Users can view their connections"
ON public.connections
FOR SELECT
USING (
  auth.uid() = follower_id OR auth.uid() = following_id
);

CREATE POLICY "Users can send connection requests"
ON public.connections
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can update connection requests they received"
ON public.connections
FOR UPDATE
USING (auth.uid() = following_id);

CREATE POLICY "Users can delete their connection requests"
ON public.connections
FOR DELETE
USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Create index for better performance
CREATE INDEX idx_connections_follower ON public.connections(follower_id);
CREATE INDEX idx_connections_following ON public.connections(following_id);
CREATE INDEX idx_connections_status ON public.connections(status);

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_connections_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_connections_updated_at
BEFORE UPDATE ON public.connections
FOR EACH ROW
EXECUTE FUNCTION public.update_connections_updated_at();