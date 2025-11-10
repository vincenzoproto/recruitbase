import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type KanbanStatus = 
  | "nuova" 
  | "in_valutazione" 
  | "colloquio" 
  | "offerta" 
  | "assunto" 
  | "rifiutato";

interface KanbanActionParams {
  candidateId: string;
  candidateName: string;
  newStatus: KanbanStatus;
  jobTitle?: string;
  recruiterId: string;
  onOpenChat?: (userId: string, userName: string) => void;
}

export const useKanbanActions = () => {
  
  const generateAIMessage = async (
    candidateName: string,
    tone: string,
    context: string
  ): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-message-suggest', {
        body: {
          candidateName,
          tone,
          context
        }
      });

      if (error) throw error;
      return data?.message || "";
    } catch (error) {
      console.error('AI message generation error:', error);
      throw error;
    }
  };

  const updateTRS = async (candidateId: string, delta: number) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('talent_relationship_score')
      .eq('id', candidateId)
      .single();

    if (profile) {
      const newScore = Math.max(0, Math.min(100, (profile.talent_relationship_score || 0) + delta));
      await supabase
        .from('profiles')
        .update({ talent_relationship_score: newScore })
        .eq('id', candidateId);
    }
  };

  const createFollowUp = async (candidateId: string, recruiterId: string, hoursDelay: number) => {
    const followupDue = new Date();
    followupDue.setHours(followupDue.getHours() + hoursDelay);

    await supabase
      .from('follow_ups')
      .upsert({
        candidate_id: candidateId,
        recruiter_id: recruiterId,
        last_contact: new Date().toISOString(),
        followup_due: followupDue.toISOString(),
        followup_sent: false,
        response_received: false
      }, {
        onConflict: 'candidate_id,recruiter_id'
      });
  };

  const handleInterviewAction = async (params: KanbanActionParams) => {
    try {
      const message = await generateAIMessage(
        params.candidateName,
        "professional",
        `Scrivi un messaggio per confermare un colloquio per il ruolo ${params.jobTitle || 'proposto'}. Proponi tre slot: domani alle 10:00, dopodomani alle 14:00, e tra 3 giorni alle 16:00. Chiedi conferma. Tono professionale, breve, con ringraziamento finale.`
      );

      // Store suggested message for recruiter to review
      await supabase.from('interactions').insert({
        candidate_id: params.candidateId,
        recruiter_id: params.recruiterId,
        type: 'ai_suggestion',
        content: message,
        metadata: { action: 'interview_request' }
      });

      // Create follow-up
      await createFollowUp(params.candidateId, params.recruiterId, 48);

      toast.success("Messaggio AI generato! Controlla le interazioni per inviarlo.", {
        description: message.substring(0, 100) + "...",
        action: {
          label: "Apri Chat",
          onClick: () => params.onOpenChat?.(params.candidateId, params.candidateName)
        }
      });
    } catch (error) {
      console.error('Interview action error:', error);
      toast.error("Errore nella generazione del messaggio");
    }
  };

  const handleOfferAction = async (params: KanbanActionParams) => {
    try {
      const message = await generateAIMessage(
        params.candidateName,
        "professional",
        `Genera una proposta di offerta per ${params.jobTitle || 'il ruolo'} con range RAL competitivo, benefit aziendali, data inizio stimata. Tono professionale, massimo 120 parole.`
      );

      await supabase.from('interactions').insert({
        candidate_id: params.candidateId,
        recruiter_id: params.recruiterId,
        type: 'ai_suggestion',
        content: message,
        metadata: { action: 'offer_proposal' }
      });

      // Update offer sent flag
      await supabase
        .from('profiles')
        .update({ last_contact_date: new Date().toISOString() })
        .eq('id', params.candidateId);

      toast.success("Proposta generata! Revisionala prima di inviarla.", {
        action: {
          label: "Apri Chat",
          onClick: () => params.onOpenChat?.(params.candidateId, params.candidateName)
        }
      });
    } catch (error) {
      console.error('Offer action error:', error);
      toast.error("Errore nella generazione della proposta");
    }
  };

  const handleHiredAction = async (params: KanbanActionParams) => {
    try {
      const message = await generateAIMessage(
        params.candidateName,
        "empathetic",
        `Scrivi un messaggio di congratulazioni per l'assunzione. Caloroso ma professionale, indica i prossimi passi (onboarding, documentazione). Massimo 80 parole.`
      );

      await supabase.from('interactions').insert({
        candidate_id: params.candidateId,
        recruiter_id: params.recruiterId,
        type: 'ai_suggestion',
        content: message,
        metadata: { action: 'hired_congratulations' }
      });

      // Update TRS +10
      await updateTRS(params.candidateId, 10);

      // Mark as hired
      await supabase
        .from('profiles')
        .update({ 
          last_contact_date: new Date().toISOString()
        })
        .eq('id', params.candidateId);

      toast.success("🎉 Assunzione registrata! TRS +10", {
        action: {
          label: "Apri Chat",
          onClick: () => params.onOpenChat?.(params.candidateId, params.candidateName)
        }
      });
    } catch (error) {
      console.error('Hired action error:', error);
      toast.error("Errore nell'aggiornamento");
    }
  };

  const handleRejectedAction = async (params: KanbanActionParams) => {
    try {
      const message = await generateAIMessage(
        params.candidateName,
        "empathetic",
        `Scrivi un messaggio di rifiuto gentile e rispettoso. Ringrazia per il tempo dedicato, suggerisci di rimanere in contatto per future posizioni. Massimo 60 parole, tono empatico.`
      );

      await supabase.from('interactions').insert({
        candidate_id: params.candidateId,
        recruiter_id: params.recruiterId,
        type: 'ai_suggestion',
        content: message,
        metadata: { action: 'rejection_message' }
      });

      // Update TRS -5
      await updateTRS(params.candidateId, -5);

      // Close follow-ups
      await supabase
        .from('follow_ups')
        .update({ followup_sent: true, response_received: true })
        .eq('candidate_id', params.candidateId)
        .eq('recruiter_id', params.recruiterId);

      toast.info("Esito inviato. TRS -5", {
        action: {
          label: "Vedi Messaggio",
          onClick: () => params.onOpenChat?.(params.candidateId, params.candidateName)
        }
      });
    } catch (error) {
      console.error('Rejection action error:', error);
      toast.error("Errore nell'aggiornamento");
    }
  };

  const handleEvaluationAction = async (params: KanbanActionParams) => {
    try {
      await createFollowUp(params.candidateId, params.recruiterId, 72);

      toast.info("Follow-up programmato per 72h", {
        description: "Suggerimento: richiedi portfolio o case study",
      });
    } catch (error) {
      console.error('Evaluation action error:', error);
    }
  };

  const executeKanbanAction = async (params: KanbanActionParams) => {
    const statusMap: Record<KanbanStatus, () => Promise<void>> = {
      nuova: async () => {}, // No action for new
      in_valutazione: () => handleEvaluationAction(params),
      colloquio: () => handleInterviewAction(params),
      offerta: () => handleOfferAction(params),
      assunto: () => handleHiredAction(params),
      rifiutato: () => handleRejectedAction(params),
    };

    const action = statusMap[params.newStatus];
    if (action) {
      await action();
    }
  };

  return { executeKanbanAction };
};
