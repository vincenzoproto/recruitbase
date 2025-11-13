import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Application } from '@/types';

export const useApplications = (userId: string | undefined) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          job_offers (
            title,
            city,
            sector
          )
        `)
        .eq("candidate_id", userId)
        .order("applied_at", { ascending: false });

      if (error) throw error;

      setApplications((data || []) as Application[]);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error("Errore nel caricamento delle candidature");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const createApplication = async (jobOfferId: string): Promise<boolean> => {
    if (!userId) {
      toast.error("Devi essere autenticato");
      return false;
    }

    try {
      // Check if already applied
      const { data: existing } = await supabase
        .from("applications")
        .select("id")
        .eq("candidate_id", userId)
        .eq("job_offer_id", jobOfferId)
        .single();

      if (existing) {
        toast.error("Hai già candidato per questa offerta");
        return false;
      }

      const { error } = await supabase.from("applications").insert({
        candidate_id: userId,
        job_offer_id: jobOfferId,
        status: "in_valutazione",
      });

      if (error) throw error;

      toast.success("Candidatura inviata con successo!");
      loadApplications();
      return true;
    } catch (error: any) {
      console.error('Error creating application:', error);
      toast.error(error.message || "Errore nell'invio della candidatura");
      return false;
    }
  };

  return { 
    applications, 
    loading, 
    loadApplications,
    createApplication 
  };
};
