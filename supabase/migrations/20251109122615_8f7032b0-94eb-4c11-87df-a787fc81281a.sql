-- Create subscriptions table for Premium plans
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'trial', -- trial, active, canceled, expired
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create ambassador referrals table
CREATE TABLE public.ambassador_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  signup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_payment_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, paid
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referred_user_id)
);

-- Create ambassador earnings table
CREATE TABLE public.ambassador_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES ambassador_referrals(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid
  payment_requested_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add referral_code to profiles
ALTER TABLE public.profiles ADD COLUMN referral_code TEXT UNIQUE;

-- Generate unique referral codes for existing users
UPDATE public.profiles 
SET referral_code = SUBSTRING(MD5(RANDOM()::TEXT || id::TEXT) FROM 1 FOR 8)
WHERE referral_code IS NULL;

-- Add is_premium flag to profiles
ALTER TABLE public.profiles ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_earnings ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Ambassador referrals policies
CREATE POLICY "Ambassadors can view their referrals"
  ON public.ambassador_referrals FOR SELECT
  USING (auth.uid() = ambassador_id);

CREATE POLICY "Anyone can create referrals"
  ON public.ambassador_referrals FOR INSERT
  WITH CHECK (true);

-- Ambassador earnings policies
CREATE POLICY "Ambassadors can view their earnings"
  ON public.ambassador_earnings FOR SELECT
  USING (auth.uid() = ambassador_id);

CREATE POLICY "Ambassadors can update their earnings"
  ON public.ambassador_earnings FOR UPDATE
  USING (auth.uid() = ambassador_id);

-- Create function to generate referral code on profile creation
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := SUBSTRING(MD5(RANDOM()::TEXT || NEW.id::TEXT) FROM 1 FOR 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code
CREATE TRIGGER set_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();

-- Create indexes for performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_ambassador_referrals_ambassador_id ON public.ambassador_referrals(ambassador_id);
CREATE INDEX idx_ambassador_referrals_code ON public.ambassador_referrals(referral_code);
CREATE INDEX idx_ambassador_earnings_ambassador_id ON public.ambassador_earnings(ambassador_id);