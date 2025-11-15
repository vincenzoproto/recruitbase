import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppCache } from '@/context/AppCacheContext';

export const useOptimizedProfile = (userId?: string) => {
  const { getCache, setCache } = useAppCache();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProfile = useCallback(async (id: string) => {
    const cacheKey = `profile_${id}`;
    const cached = getCache<any>(cacheKey);

    if (cached) {
      setProfile(cached);
      setLoading(false);
      return cached;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      setCache(cacheKey, data, 10 * 60 * 1000); // Cache for 10 minutes
      setProfile(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getCache, setCache]);

  useEffect(() => {
    if (userId) {
      loadProfile(userId);
    }
  }, [userId]);

  const updateProfile = useCallback(async (updates: any) => {
    if (!userId) return;

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      const cacheKey = `profile_${userId}`;
      setCache(cacheKey, data, 10 * 60 * 1000);
      setProfile(data);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [userId, setCache]);

  return { profile, loading, error, refetch: () => userId && loadProfile(userId), updateProfile };
};
