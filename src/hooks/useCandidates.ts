import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Profile } from '@/types';

export const useCandidates = () => {
  const [candidates, setCandidates] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'candidate')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setCandidates((data as Profile[]) || []);
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast.error('Errore nel caricamento dei candidati');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const refreshCandidates = useCallback(() => {
    loadCandidates();
  }, [loadCandidates]);

  return { candidates, loading, refreshCandidates };
};