-- Insert default follow-up templates if they don't exist
INSERT INTO follow_up_templates (name, description, template_text, ai_prompt, category, is_active)
SELECT * FROM (VALUES
  (
    'Follow-up Candidatura',
    'Messaggio di follow-up dopo una candidatura ricevuta',
    'Ciao {nome_candidato},

grazie per aver inviato la tua candidatura per la posizione di {job_title} presso {azienda}.

Abbiamo ricevuto il tuo profilo e il nostro team lo sta valutando con attenzione. Ti contatteremo presto per i prossimi passi.

Nel frattempo, se hai domande, non esitare a scrivermi.

Cordiali saluti,
{nome_recruiter}',
    'Genera un messaggio di follow-up professionale e cordiale per un candidato che ha appena inviato la candidatura. Il tono deve essere positivo e rassicurante. Deve ringraziare per la candidatura, confermare la ricezione e indicare che il profilo è in valutazione. Mantieni il messaggio entro 120 parole.',
    'post_candidatura',
    true
  ),
  (
    'Follow-up Post Screening',
    'Follow-up dopo uno screening telefonico o video',
    'Ciao {nome_candidato},

è stato un piacere parlare con te! Grazie per aver dedicato del tempo allo screening per la posizione di {job_title}.

Stiamo valutando i prossimi step e ti faremo sapere entro pochi giorni se proseguire con un colloquio tecnico.

Resto a disposizione per qualsiasi chiarimento.

Un saluto,
{nome_recruiter}',
    'Crea un messaggio di follow-up dopo uno screening iniziale (telefonico o video). Il tono deve essere caloroso e professionale. Ringrazia per il tempo dedicato e informa sui prossimi passi. Massimo 100 parole.',
    'post_screening',
    true
  ),
  (
    'Follow-up Post Colloquio',
    'Messaggio dopo un colloquio completo',
    'Gentile {nome_candidato},

ti ringrazio per il colloquio di oggi per la posizione di {job_title}. È stato interessante conoscerti e approfondire la tua esperienza.

Stiamo completando le ultime valutazioni interne e ti aggiorneremo entro [X giorni] sul prossimo step.

Se hai ulteriori domande o documenti da condividere, scrivimi pure.

Cordialmente,
{nome_recruiter}',
    'Scrivi un follow-up dopo un colloquio approfondito. Deve essere molto professionale, ringraziare per il tempo, riassumere brevemente l''interesse reciproco e dare una tempistica chiara. Circa 100-120 parole.',
    'post_colloquio',
    true
  ),
  (
    'Reminder Documenti',
    'Richiesta documenti mancanti',
    'Ciao {nome_candidato},

spero tutto bene! Ti scrivo per ricordarti che per procedere con la tua candidatura per {job_title} abbiamo bisogno di alcuni documenti:

- CV aggiornato
- Certificati
- [altro, se necessario]

Quando hai un momento, puoi inviarli a questa email?

Grazie mille!

{nome_recruiter}',
    'Genera un messaggio di reminder per documenti mancanti. Deve essere gentile ma diretto, elencare cosa serve e dare istruzioni chiare. Non superare le 80 parole.',
    'reminder',
    true
  ),
  (
    'Template AI',
    'Genera un messaggio personalizzato con intelligenza artificiale',
    '',
    'Genera un messaggio di follow-up professionale, personalizzato e cordiale per il candidato {nome_candidato} che si è candidato per {job_title}. Considera il suo profilo, le sue competenze e il contesto del colloquio. Il messaggio deve essere genuino, non troppo formale ma professionale, e deve incoraggiare una risposta. Massimo 120 parole. Usa un tono caloroso ma appropriato per un contesto di recruiting.',
    'ai_generated',
    true
  )
) AS t(name, description, template_text, ai_prompt, category, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM follow_up_templates WHERE category = t.category
);

-- Add index for better query performance on scheduled_messages
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_status_date 
ON scheduled_messages(status, scheduled_at);

-- Add index for follow_ups
CREATE INDEX IF NOT EXISTS idx_follow_ups_recruiter_candidate 
ON follow_ups(recruiter_id, candidate_id);

-- Function to mark follow-up as responded when message is received
CREATE OR REPLACE FUNCTION update_followup_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or create follow_up record
  INSERT INTO follow_ups (candidate_id, recruiter_id, last_contact, followup_due)
  VALUES (
    CASE WHEN NEW.sender_id IN (SELECT id FROM profiles WHERE role = 'recruiter')
      THEN NEW.receiver_id ELSE NEW.sender_id END,
    CASE WHEN NEW.sender_id IN (SELECT id FROM profiles WHERE role = 'recruiter')
      THEN NEW.sender_id ELSE NEW.receiver_id END,
    now(),
    now() + INTERVAL '5 days'
  )
  ON CONFLICT (candidate_id, recruiter_id)
  DO UPDATE SET
    last_contact = now(),
    followup_due = now() + INTERVAL '5 days',
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_message_update_followup ON messages;
CREATE TRIGGER on_message_update_followup
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_followup_on_message();