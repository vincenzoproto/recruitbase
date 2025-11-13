-- Fix RLS policies safely by dropping and recreating them
-- This ensures we don't have conflicts with existing policies

-- Drop existing profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Recruiters can view candidate profiles" ON public.profiles;

-- Create new secure profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Recruiters can view candidate profiles"
  ON public.profiles
  FOR SELECT
  USING (
    role = 'candidate' 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'recruiter'
    )
  );

-- Secure CVs storage bucket with proper RLS (drop existing first)
DROP POLICY IF EXISTS "Users can view their own CVs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own CVs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own CVs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own CVs" ON storage.objects;

CREATE POLICY "Users can view their own CVs"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'cvs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own CVs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'cvs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own CVs"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'cvs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own CVs"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'cvs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_job_offers_is_active ON public.job_offers(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_offer_id ON public.applications(job_offer_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_profile_id ON public.profile_views(viewed_profile_id, created_at DESC);