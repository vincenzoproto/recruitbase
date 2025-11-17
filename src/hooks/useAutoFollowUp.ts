import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FollowUpTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface CandidateForFollowUp {
  id: string;
  full_name: string;
  job_title: string;
  avatar_url: string;
  pipeline_stage_id: string;
  last_contact_date: string;
  email: string;
  pipelineStageName?: string;
  lastMessageDate?: string;
  jobOfferTitle?: string;
}

export const useAutoFollowUp = (recruiterId: string) => {
  const [templates, setTemplates] = useState<FollowUpTemplate[]>([]);
  const [candidates, setCandidates] = useState<CandidateForFollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduledCount, setScheduledCount] = useState(0);

  const loadTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('follow_up_templates')
        .select('id, name, description, category')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Errore nel caricamento dei template');
    }
  }, []);

  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);

      // Get candidates in this recruiter's pipeline
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          job_title,
          avatar_url,
          pipeline_stage_id,
          last_contact_date,
          phone_number
        `)
        .eq('role', 'candidate')
        .not('pipeline_stage_id', 'is', null)
        .order('last_contact_date', { ascending: true, nullsFirst: true });

      if (candidatesError) throw candidatesError;

      // Filter candidates that belong to this recruiter's stages
      const { data: stages } = await supabase
        .from('pipeline_stages')
        .select('id')
        .eq('recruiter_id', recruiterId);

      const stageIds = stages?.map(s => s.id) || [];
      const filteredCandidates = candidatesData?.filter(c => 
        c.pipeline_stage_id && stageIds.includes(c.pipeline_stage_id)
      ) || [];

      // Enrich with stage names and last message
      const enrichedCandidates = await Promise.all(
        filteredCandidates.map(async (candidate) => {
          // Get stage name
          const { data: stage } = await supabase
            .from('pipeline_stages')
            .select('name')
            .eq('id', candidate.pipeline_stage_id)
            .single();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('created_at')
            .or(`sender_id.eq.${candidate.id},receiver_id.eq.${candidate.id}`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get job offer from latest application
          const { data: application } = await supabase
            .from('applications')
            .select('job_offers(title)')
            .eq('candidate_id', candidate.id)
            .order('applied_at', { ascending: false })
            .limit(1)
            .single();

          // Get user email from auth
          const { data: authUser } = await supabase.auth.admin.getUserById(candidate.id);

          return {
            ...candidate,
            pipelineStageName: stage?.name || 'Non assegnato',
            lastMessageDate: lastMessage?.created_at,
            jobOfferTitle: application?.job_offers?.title,
            email: authUser?.user?.email || candidate.phone_number || ''
          };
        })
      );

      setCandidates(enrichedCandidates);
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast.error('Errore nel caricamento dei candidati');
    } finally {
      setLoading(false);
    }
  }, [recruiterId]);

  const loadScheduledCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('scheduled_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recruiter_id', recruiterId)
        .eq('status', 'pending');

      if (error) throw error;
      setScheduledCount(count || 0);
    } catch (error) {
      console.error('Error loading scheduled count:', error);
    }
  }, [recruiterId]);

  useEffect(() => {
    loadTemplates();
    loadCandidates();
    loadScheduledCount();
  }, [loadTemplates, loadCandidates, loadScheduledCount]);

  const generateMessage = useCallback(async (templateId: string, candidateId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-followup-message', {
        body: { templateId, candidateId, recruiterId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating message:', error);
      toast.error('Errore nella generazione del messaggio');
      return null;
    }
  }, [recruiterId]);

  const scheduleMessage = useCallback(async (
    candidateId: string,
    message: string,
    scheduledAt: Date,
    templateId?: string
  ) => {
    try {
      // Check for duplicates
      const { data: hasDuplicate, error: checkError } = await supabase
        .rpc('check_duplicate_followup', {
          p_recruiter_id: recruiterId,
          p_candidate_id: candidateId
        });

      if (checkError) throw checkError;

      if (hasDuplicate) {
        toast.error('Hai già programmato un follow-up per questo candidato nelle ultime 24 ore');
        return false;
      }

      // Schedule the message
      const { error } = await supabase
        .from('scheduled_messages')
        .insert({
          recruiter_id: recruiterId,
          candidate_id: candidateId,
          template_id: templateId,
          message_content: message,
          scheduled_at: scheduledAt.toISOString(),
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Follow-up programmato con successo!');
      await loadScheduledCount();
      return true;
    } catch (error) {
      console.error('Error scheduling message:', error);
      toast.error('Errore nella programmazione del follow-up');
      return false;
    }
  }, [recruiterId, loadScheduledCount]);

  return {
    templates,
    candidates,
    loading,
    scheduledCount,
    generateMessage,
    scheduleMessage,
    refresh: () => {
      loadCandidates();
      loadScheduledCount();
    }
  };
};