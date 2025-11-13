import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFavorites = (recruiterId: string) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (!recruiterId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select('candidate_id')
        .eq('recruiter_id', recruiterId);

      if (error) throw error;

      const favoriteIds = new Set(data?.map((f) => f.candidate_id) || []);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [recruiterId]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = useCallback(async (candidateId: string) => {
    const isFavorite = favorites.has(candidateId);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('recruiter_id', recruiterId)
          .eq('candidate_id', candidateId);

        if (error) throw error;

        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(candidateId);
          return newSet;
        });
        toast.success('Rimosso dai preferiti');
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ recruiter_id: recruiterId, candidate_id: candidateId });

        if (error) throw error;

        setFavorites((prev) => new Set(prev).add(candidateId));
        toast.success('Aggiunto ai preferiti');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Errore nell\'aggiornamento dei preferiti');
    }
  }, [favorites, recruiterId]);

  return { favorites, loading, toggleFavorite, refreshFavorites: loadFavorites };
};