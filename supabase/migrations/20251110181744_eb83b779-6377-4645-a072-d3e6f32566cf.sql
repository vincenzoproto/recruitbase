-- Add company_size field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_size TEXT;

COMMENT ON COLUMN public.profiles.company_size IS 'Company size/dimension - optional field';