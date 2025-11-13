import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { JobOffer } from '@/types';

export const useJobOffers = (recruiterId?: string) => {
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJobOffers = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('job_offers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (recruiterId) {
        query = query.eq('recruiter_id', recruiterId);
      } else {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobOffers((data as JobOffer[]) || []);
    } catch (error) {
      console.error('Error loading job offers:', error);
      toast.error('Errore nel caricamento delle offerte');
    } finally {
      setLoading(false);
    }
  }, [recruiterId]);

  useEffect(() => {
    loadJobOffers();
  }, [loadJobOffers]);

  const refreshJobOffers = useCallback(() => {
    loadJobOffers();
  }, [loadJobOffers]);

  return { jobOffers, loading, refreshJobOffers };
};