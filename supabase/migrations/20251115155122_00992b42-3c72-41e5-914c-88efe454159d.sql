-- Create reward marketplace tables (integrate with existing gamification)

-- Table for reward items in the shop
CREATE TABLE IF NOT EXISTS reward_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  cost_xp INTEGER NOT NULL CHECK (cost_xp > 0),
  icon TEXT NOT NULL, -- emoji or URL
  category TEXT NOT NULL CHECK (category IN ('bonus', 'visibility', 'ai_tools', 'social', 'recruiter', 'other')),
  stock INTEGER, -- NULL = unlimited
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for claimed rewards
CREATE TABLE IF NOT EXISTS reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id UUID NOT NULL REFERENCES reward_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'active', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE, -- for time-limited rewards
  metadata JSONB -- for additional data like duration, credits, etc.
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reward_items_category ON reward_items(category);
CREATE INDEX IF NOT EXISTS idx_reward_items_active ON reward_items(is_active);
CREATE INDEX IF NOT EXISTS idx_reward_claims_user_id ON reward_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_status ON reward_claims(status);

-- RLS policies
ALTER TABLE reward_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;

-- Everyone can view active rewards
CREATE POLICY "Anyone can view active rewards"
  ON reward_items FOR SELECT
  USING (is_active = true);

-- Users can view their own claims
CREATE POLICY "Users can view their own claims"
  ON reward_claims FOR SELECT
  USING (auth.uid() = user_id);

-- Users can claim rewards (insert)
CREATE POLICY "Users can claim rewards"
  ON reward_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to claim a reward
CREATE OR REPLACE FUNCTION claim_reward(
  p_user_id UUID,
  p_reward_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_xp INTEGER;
  v_reward_cost INTEGER;
  v_reward_stock INTEGER;
  v_reward_name TEXT;
  v_claim_id UUID;
BEGIN
  -- Get user's current XP
  SELECT xp INTO v_user_xp FROM profiles WHERE id = p_user_id;
  
  -- Get reward details
  SELECT cost_xp, stock, name 
  INTO v_reward_cost, v_reward_stock, v_reward_name
  FROM reward_items 
  WHERE id = p_reward_id AND is_active = true;
  
  -- Check if reward exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward not found or inactive');
  END IF;
  
  -- Check if user has enough XP
  IF v_user_xp < v_reward_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient XP');
  END IF;
  
  -- Check stock
  IF v_reward_stock IS NOT NULL AND v_reward_stock <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Out of stock');
  END IF;
  
  -- Deduct XP from user
  UPDATE profiles 
  SET xp = xp - v_reward_cost
  WHERE id = p_user_id;
  
  -- Decrease stock if applicable
  IF v_reward_stock IS NOT NULL THEN
    UPDATE reward_items 
    SET stock = stock - 1
    WHERE id = p_reward_id;
  END IF;
  
  -- Create claim record
  INSERT INTO reward_claims (reward_id, user_id, status)
  VALUES (p_reward_id, p_user_id, 'delivered')
  RETURNING id INTO v_claim_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'claim_id', v_claim_id,
    'reward_name', v_reward_name,
    'xp_spent', v_reward_cost
  );
END;
$$;

-- Insert initial 12 rewards
INSERT INTO reward_items (name, description, cost_xp, icon, category, stock) VALUES
-- Bonus usuabili
('Boost Visibilità Profilo 24h', 'Il tuo profilo appare in cima ai risultati per 24 ore', 150, '🎯', 'visibility', NULL),
('Boost Candidatura 24h', 'La tua candidatura viene evidenziata ai recruiter', 200, '📈', 'visibility', NULL),
('Messaggio Premium In Evidenza', 'Il tuo prossimo messaggio appare in evidenza', 120, '📨', 'social', NULL),

-- AI Tools
('Analisi automatica del CV', 'L''AI analizza il tuo CV e suggerisce miglioramenti (1 credito)', 80, '🤖', 'ai_tools', NULL),
('Match AI avanzato', 'Trova i migliori match con l''intelligenza artificiale (1 credito)', 100, '🤝', 'ai_tools', NULL),
('Cover Letter AI', 'Genera una cover letter personalizzata con AI (1 generazione)', 60, '✍️', 'ai_tools', NULL),

-- Social & Community
('Post in evidenza nel feed 12h', 'Il tuo post resta in cima al feed per 12 ore', 180, '🔥', 'social', NULL),
('Commento evidenziato', 'Il tuo commento appare in evidenza', 50, '💬', 'social', NULL),
('Badge "Top Contributor"', 'Badge speciale visibile sul profilo per 7 giorni', 250, '💎', 'social', NULL),

-- Extra per recruiter
('Follow-up automatico AI', 'L''AI genera e invia follow-up personalizzati (3 credits)', 200, '📅', 'recruiter', NULL),
('Report PDF avanzato', 'Scarica un report dettagliato delle tue metriche', 160, '📊', 'recruiter', NULL),
('Ricerca Candidati Avanzata', 'Sblocca filtri avanzati per 24h (1 credito)', 140, '🔍', 'recruiter', NULL);