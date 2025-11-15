import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppCache } from '@/context/AppCacheContext';

export const useOptimizedApplications = (candidateId?: string) => {
  const { getCache, setCache, invalidateCache } = useAppCache();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cacheKey = `applications_${candidateId}`;

  const loadApplications = useCallback(async (id: string) => {
    const cached = getCache<any[]>(cacheKey);
    if (cached) {
      setApplications(cached);
      setLoading(false);
      return cached;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          applied_at,
          feedback_type,
          feedback_notes,
          job_offers (
            id,
            title,
            city,
            sector,
            experience_level,
            description,
            profiles:recruiter_id (
              full_name,
              company_size
            )
          )
        `)
        .eq('candidate_id', id)
        .order('applied_at', { ascending: false });

      if (fetchError) throw fetchError;

      setCache(cacheKey, data || [], 5 * 60 * 1000); // Cache for 5 minutes
      setApplications(data || []);
      setError(null);
      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cacheKey, getCache, setCache]);

  useEffect(() => {
    if (candidateId) {
      loadApplications(candidateId);
    }
  }, [candidateId]);

  const invalidate = useCallback(() => {
    invalidateCache('applications_');
  }, [invalidateCache]);

  return { applications, loading, error, refetch: () => candidateId && loadApplications(candidateId), invalidate };
};
