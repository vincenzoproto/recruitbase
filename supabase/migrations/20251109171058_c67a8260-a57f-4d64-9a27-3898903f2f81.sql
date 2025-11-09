-- Tabella per leaderboard globale TRM
CREATE TABLE IF NOT EXISTS public.recruiter_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country TEXT,
  avg_trs INTEGER DEFAULT 0,
  total_referral_earnings NUMERIC DEFAULT 0,
  monthly_contacts INTEGER DEFAULT 0,
  weekly_conversion_rate NUMERIC DEFAULT 0,
  avg_response_time_hours NUMERIC DEFAULT 0,
  ranking_position INTEGER,
  badge_type TEXT CHECK (badge_type IN ('gold', 'silver', 'bronze', 'none')) DEFAULT 'none',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per Academy content
CREATE TABLE IF NOT EXISTS public.academy_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('best_practice', 'trs_improvement', 'candidate_management')),
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'article', 'guide')),
  description TEXT,
  video_url TEXT,
  article_text TEXT,
  duration_minutes INTEGER,
  order_position INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per metriche giornaliere recruiter
CREATE TABLE IF NOT EXISTS public.daily_recruiter_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  new_contacts_count INTEGER DEFAULT 0,
  weekly_conversion_rate NUMERIC DEFAULT 0,
  avg_response_time_hours NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Tabella per biometric auth tokens
CREATE TABLE IF NOT EXISTS public.biometric_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT DEFAULT 0,
  device_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.recruiter_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_recruiter_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_credentials ENABLE ROW LEVEL SECURITY;

-- Recruiter stats policies
CREATE POLICY "Everyone can view recruiter stats for leaderboard"
  ON public.recruiter_stats FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own stats"
  ON public.recruiter_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert stats"
  ON public.recruiter_stats FOR INSERT
  WITH CHECK (true);

-- Academy content policies
CREATE POLICY "Everyone can view academy content"
  ON public.academy_content FOR SELECT
  USING (true);

-- Daily metrics policies
CREATE POLICY "Users can view their own metrics"
  ON public.daily_recruiter_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert metrics"
  ON public.daily_recruiter_metrics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update metrics"
  ON public.daily_recruiter_metrics FOR UPDATE
  USING (true);

-- Biometric credentials policies
CREATE POLICY "Users can manage their own biometric credentials"
  ON public.biometric_credentials FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update recruiter ranking
CREATE OR REPLACE FUNCTION update_recruiter_rankings()
RETURNS void AS $$
BEGIN
  WITH ranked_recruiters AS (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY avg_trs DESC, total_referral_earnings DESC) as rank
    FROM recruiter_stats
  )
  UPDATE recruiter_stats rs
  SET 
    ranking_position = rr.rank,
    badge_type = CASE 
      WHEN rr.rank = 1 THEN 'gold'
      WHEN rr.rank = 2 THEN 'silver'
      WHEN rr.rank = 3 THEN 'bronze'
      ELSE 'none'
    END,
    last_updated = NOW()
  FROM ranked_recruiters rr
  WHERE rs.user_id = rr.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample academy content
INSERT INTO public.academy_content (title, category, content_type, description, article_text, duration_minutes, order_position) VALUES
('Best Practice Recruiting: I Fondamentali', 'best_practice', 'article', 'Impara le tecniche essenziali per un recruiting efficace', 
'# Best Practice Recruiting

## 1. Comunicazione Proattiva
Rispondi ai candidati entro 24 ore per mantenere alto l''engagement.

## 2. Personalizzazione
Ogni messaggio deve essere personalizzato in base al profilo del candidato.

## 3. Follow-up Strategico
Mantieni il contatto con follow-up regolari e di valore.

## 4. Trasparenza
Comunica chiaramente tempistiche e aspettative del processo.', 15, 1),

('Come Aumentare il TRS™', 'trs_improvement', 'article', 'Strategie comprovate per migliorare il tuo Talent Relationship Score', 
'# Come Aumentare il TRS™

## Cos''è il TRS?
Il Talent Relationship Score misura la qualità delle tue relazioni con i candidati.

## 5 Modi per Aumentarlo:

### 1. Interazioni Frequenti
Mantieni contatti regolari con note personalizzate.

### 2. Risposta Rapida
Riduci i tempi di risposta sotto le 12 ore.

### 3. Contenuti di Valore
Condividi insights e opportunità rilevanti.

### 4. Feedback Costruttivo
Fornisci sempre feedback dopo i colloqui.

### 5. Long-term Relationships
Pensa oltre la singola posizione aperta.', 20, 2),

('Gestione Candidati Efficace', 'candidate_management', 'article', 'Organizza e gestisci il tuo pipeline di candidati come un pro', 
'# Gestione Candidati Efficace

## Pipeline Organization

### Stage 1: Sourcing
Identifica candidati potenziali con filtri avanzati.

### Stage 2: First Contact
Messaggio iniziale personalizzato e professionale.

### Stage 3: Qualification
Valuta fit tecnico e culturale.

### Stage 4: Interview
Coordina colloqui e raccogli feedback.

### Stage 5: Offer & Close
Negozia e finalizza l''assunzione.

## Tool Essenziali:
- Tags per categorizzare
- Note per tracking
- Task per follow-up
- TRS per prioritizzare', 25, 3);
