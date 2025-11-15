import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppCache } from '@/context/AppCacheContext';

interface UseOffersOptions {
  recruiterId?: string;
  active?: boolean;
  limit?: number;
}

export const useOptimizedOffers = (options: UseOffersOptions = {}) => {
  const { getCache, setCache, invalidateCache } = useAppCache();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cacheKey = `offers_${options.recruiterId || 'all'}_${options.active}_${options.limit}`;

  const loadOffers = useCallback(async () => {
    const cached = getCache<any[]>(cacheKey);
    if (cached) {
      setOffers(cached);
      setLoading(false);
      return cached;
    }

    try {
      setLoading(true);
      let query = supabase
        .from('job_offers')
        .select(`
          *,
          profiles!job_offers_recruiter_id_fkey(full_name, avatar_url, company_size),
          applications(id, status)
        `)
        .order('created_at', { ascending: false });

      if (options.recruiterId) {
        query = query.eq('recruiter_id', options.recruiterId);
      }

      if (options.active !== undefined) {
        query = query.eq('is_active', options.active);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setCache(cacheKey, data || [], 3 * 60 * 1000); // Cache for 3 minutes
      setOffers(data || []);
      setError(null);
      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [options.recruiterId, options.active, options.limit, cacheKey, getCache, setCache]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const invalidate = useCallback(() => {
    invalidateCache('offers_');
  }, [invalidateCache]);

  return { offers, loading, error, refetch: loadOffers, invalidate };
};
