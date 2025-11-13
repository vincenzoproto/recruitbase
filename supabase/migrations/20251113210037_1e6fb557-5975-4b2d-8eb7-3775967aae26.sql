-- Fix profiles RLS to allow public read for feed/posts while maintaining privacy
-- This allows joins with posts/comments to work while keeping UPDATE/INSERT strict

DROP POLICY IF EXISTS "Users can select their own profile" ON public.profiles;

-- Allow reading all profiles (needed for posts/comments joins and recruiter listings)
-- Sensitive fields should be filtered at application level
CREATE POLICY "Users can view profiles"
ON public.profiles FOR SELECT
USING (true);

-- Keep strict policies for modifications
-- INSERT and UPDATE policies remain unchanged (auth.uid() = id)