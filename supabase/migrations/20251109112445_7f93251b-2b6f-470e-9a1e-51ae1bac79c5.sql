-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('recruiter', 'candidate');

-- Create enum for experience level
CREATE TYPE public.experience_level AS ENUM ('entry', 'junior', 'mid', 'senior', 'lead');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name TEXT NOT NULL,
  city TEXT,
  job_title TEXT,
  bio TEXT,
  skills TEXT[],
  linkedin_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job offers table
CREATE TABLE public.job_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  city TEXT NOT NULL,
  sector TEXT NOT NULL,
  experience_level experience_level NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_offer_id UUID REFERENCES public.job_offers(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_offer_id, candidate_id)
);

-- Create favorites table (recruiter saves candidate profiles)
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recruiter_id, candidate_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Job offers policies
CREATE POLICY "Anyone can view active job offers"
  ON public.job_offers FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Recruiters can view their own job offers"
  ON public.job_offers FOR SELECT
  TO authenticated
  USING (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can create job offers"
  ON public.job_offers FOR INSERT
  TO authenticated
  WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can update their own job offers"
  ON public.job_offers FOR UPDATE
  TO authenticated
  USING (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can delete their own job offers"
  ON public.job_offers FOR DELETE
  TO authenticated
  USING (recruiter_id = auth.uid());

-- Applications policies
CREATE POLICY "Candidates can view their own applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (candidate_id = auth.uid());

CREATE POLICY "Recruiters can view applications for their offers"
  ON public.applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.job_offers
      WHERE id = job_offer_id AND recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Candidates can create applications"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (candidate_id = auth.uid());

-- Favorites policies
CREATE POLICY "Recruiters can view their own favorites"
  ON public.favorites FOR SELECT
  TO authenticated
  USING (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can add favorites"
  ON public.favorites FOR INSERT
  TO authenticated
  WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can remove favorites"
  ON public.favorites FOR DELETE
  TO authenticated
  USING (recruiter_id = auth.uid());

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_job_offers_updated_at
  BEFORE UPDATE ON public.job_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();