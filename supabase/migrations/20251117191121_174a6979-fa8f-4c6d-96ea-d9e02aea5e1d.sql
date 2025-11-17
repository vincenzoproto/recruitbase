-- Create follow_up_templates table
CREATE TABLE IF NOT EXISTS public.follow_up_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_text TEXT NOT NULL,
  category TEXT NOT NULL,
  ai_prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scheduled_messages table
CREATE TABLE IF NOT EXISTS public.scheduled_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.follow_up_templates(id) ON DELETE SET NULL,
  message_content TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed, cancelled
  job_offer_id UUID REFERENCES public.job_offers(id) ON DELETE SET NULL,
  pipeline_stage TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create automation_logs table
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- follow_up_sent, template_generated, etc
  status TEXT NOT NULL, -- success, failed
  details JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.follow_up_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follow_up_templates
CREATE POLICY "Everyone can view active templates"
  ON public.follow_up_templates
  FOR SELECT
  USING (is_active = true);

-- RLS Policies for scheduled_messages
CREATE POLICY "Recruiters can manage their scheduled messages"
  ON public.scheduled_messages
  FOR ALL
  USING (recruiter_id = auth.uid());

CREATE POLICY "Candidates can view messages scheduled for them"
  ON public.scheduled_messages
  FOR SELECT
  USING (candidate_id = auth.uid());

-- RLS Policies for automation_logs
CREATE POLICY "Recruiters can view their automation logs"
  ON public.automation_logs
  FOR SELECT
  USING (recruiter_id = auth.uid());

CREATE POLICY "System can insert automation logs"
  ON public.automation_logs
  FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_scheduled_messages_recruiter ON public.scheduled_messages(recruiter_id);
CREATE INDEX idx_scheduled_messages_candidate ON public.scheduled_messages(candidate_id);
CREATE INDEX idx_scheduled_messages_scheduled_at ON public.scheduled_messages(scheduled_at);
CREATE INDEX idx_scheduled_messages_status ON public.scheduled_messages(status);
CREATE INDEX idx_automation_logs_recruiter ON public.automation_logs(recruiter_id);
CREATE INDEX idx_automation_logs_created_at ON public.automation_logs(created_at);

-- Insert default templates
INSERT INTO public.follow_up_templates (name, description, template_text, category, ai_prompt) VALUES
(
  'Ricontatto dopo candidatura',
  'Messaggio di follow-up dopo ricezione candidatura',
  'Ciao {candidate_name}, grazie per la tua candidatura per {job_title}. Siamo interessati al tuo profilo...',
  'post_application',
  'Genera un messaggio professionale e cordiale per ricontattare {candidate_name} dopo la sua candidatura per la posizione di {job_title}. Il candidato è nella fase "{pipeline_stage}". Includi: ringraziamento, interesse per il profilo, prossimi passi. Massimo 150 parole, tono professionale ma amichevole.'
),
(
  'Reminder colloquio domani',
  'Promemoria per colloquio programmato',
  'Ciao {candidate_name}, ti ricordo che domani alle {meeting_time} avremo il colloquio per {job_title}...',
  'interview_reminder',
  'Genera un messaggio di reminder per {candidate_name} riguardo al colloquio di domani alle {meeting_time} per la posizione di {job_title}. Includi: conferma orario, modalità (se online/presenza), cosa preparare. Massimo 120 parole, tono professionale e rassicurante.'
),
(
  'Grazie dopo colloquio',
  'Ringraziamento post-colloquio',
  'Ciao {candidate_name}, grazie per il tempo dedicato al colloquio di oggi per {job_title}...',
  'post_interview',
  'Genera un messaggio di ringraziamento per {candidate_name} dopo il colloquio per {job_title}. Includi: apprezzamento per il tempo dedicato, feedback positivo (se applicabile), tempistiche per decisione finale. Massimo 130 parole, tono professionale e positivo.'
),
(
  'Candidatura non idonea (gentile)',
  'Comunicazione negativa con feedback costruttivo',
  'Caro/a {candidate_name}, grazie per l''interesse mostrato per {job_title}...',
  'rejection',
  'Genera un messaggio gentile e professionale per comunicare a {candidate_name} che la sua candidatura per {job_title} non è stata selezionata. Includi: ringraziamento sincero, apprezzamento competenze, incoraggiamento a candidarsi per future posizioni. Massimo 140 parole, tono empatico e rispettoso.'
),
(
  'Richiesta documenti',
  'Richiesta di documenti o informazioni aggiuntive',
  'Ciao {candidate_name}, per procedere con la tua candidatura per {job_title} avremmo bisogno di...',
  'document_request',
  'Genera un messaggio per richiedere a {candidate_name} dei documenti o informazioni aggiuntive per la posizione di {job_title}. Includi: lista documenti richiesti, deadline per invio, modalità di invio. Massimo 120 parole, tono professionale e chiaro.'
),
(
  'Follow-up candidatura senza risposta',
  'Ricontatto per candidatura senza risposta',
  'Ciao {candidate_name}, volevo ricontattarti riguardo alla tua candidatura per {job_title}...',
  'no_response',
  'Genera un messaggio di follow-up per {candidate_name} che non ha risposto alla candidatura per {job_title}. Il candidato è nella fase "{pipeline_stage}". Includi: interesse continuato, richiesta conferma disponibilità, prossimi passi. Massimo 130 parole, tono professionale ma non pressante.'
);

-- Function to check for duplicate follow-ups in last 24h
CREATE OR REPLACE FUNCTION public.check_duplicate_followup(
  p_recruiter_id UUID,
  p_candidate_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM scheduled_messages
  WHERE recruiter_id = p_recruiter_id
  AND candidate_id = p_candidate_id
  AND status IN ('pending', 'sent')
  AND created_at > now() - INTERVAL '24 hours';
  
  RETURN v_count > 0;
END;
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_scheduled_messages_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_scheduled_messages_updated_at
BEFORE UPDATE ON public.scheduled_messages
FOR EACH ROW
EXECUTE FUNCTION update_scheduled_messages_updated_at();