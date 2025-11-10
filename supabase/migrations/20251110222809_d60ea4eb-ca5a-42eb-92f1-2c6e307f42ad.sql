-- Add missing profile fields if they don't exist
DO $$ 
BEGIN
  -- Add education field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'education') THEN
    ALTER TABLE profiles ADD COLUMN education TEXT DEFAULT '';
  END IF;

  -- Add company_size field (if not exists)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'company_size') THEN
    ALTER TABLE profiles ADD COLUMN company_size TEXT DEFAULT '';
  END IF;

  -- Add industry field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'industry') THEN
    ALTER TABLE profiles ADD COLUMN industry TEXT DEFAULT '';
  END IF;

  -- Add years_experience field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'years_experience') THEN
    ALTER TABLE profiles ADD COLUMN years_experience INTEGER DEFAULT 0;
  END IF;

  -- Add languages field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'languages') THEN
    ALTER TABLE profiles ADD COLUMN languages TEXT DEFAULT '';
  END IF;

  -- Add degree_title field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'degree_title') THEN
    ALTER TABLE profiles ADD COLUMN degree_title TEXT DEFAULT '';
  END IF;
END $$;