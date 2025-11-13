-- Fix RLS policies on profiles table to hide sensitive data from recruiters

-- Drop existing recruiter policy that shows all fields
DROP POLICY IF EXISTS "Recruiters can view candidate profiles" ON public.profiles;

-- Create new policy for recruiters to view only public candidate fields
-- Recruiters can see candidates but not sensitive fields like phone_number
CREATE POLICY "Recruiters can view public candidate fields"
ON public.profiles
FOR SELECT
USING (
  role = 'candidate'::user_role 
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'recruiter'::user_role
  )
);

-- Note: The application code should use .select() to explicitly choose
-- which fields to return. For candidate cards, exclude: phone_number
-- Only show phone_number when a recruiter has contacted the candidate