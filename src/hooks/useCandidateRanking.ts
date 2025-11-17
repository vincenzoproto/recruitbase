import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CandidateRanking {
  id: string;
  candidate_id: string;
  smart_match_score: number;
  skills_match_score: number;
  experience_score: number;
  location_score: number;
  job_title_score: number;
  profile_completeness_score: number;
  match_reasons: string[];
  candidate: {
    id: string;
    full_name: string;
    job_title: string;
    avatar_url: string;
    city: string;
    skills: string[];
    years_experience: number;
  };
  application?: {
    id: string;
    status: string;
  };
}

interface Filters {
  minScore?: number;
  essentialSkills?: string[];
  minExperience?: number;
  availability?: string;
}

export const useCandidateRanking = (jobOfferId: string) => {
  const [rankings, setRankings] = useState<CandidateRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});

  const loadRankings = useCallback(async () => {
    if (!jobOfferId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      let query = supabase
        .from('candidate_rankings')
        .select(`
          id,
          candidate_id,
          smart_match_score,
          skills_match_score,
          experience_score,
          location_score,
          job_title_score,
          profile_completeness_score,
          match_reasons,
          candidate:profiles!candidate_id (
            id,
            full_name,
            job_title,
            avatar_url,
            city,
            skills,
            years_experience
          ),
          application:applications!application_id (
            id,
            status
          )
        `)
        .eq('job_offer_id', jobOfferId)
        .order('smart_match_score', { ascending: false });

      // Apply filters
      if (filters.minScore) {
        query = query.gte('smart_match_score', filters.minScore);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Client-side filtering for complex conditions
      let filteredData = data || [];

      if (filters.essentialSkills && filters.essentialSkills.length > 0) {
        filteredData = filteredData.filter(ranking => {
          const candidateSkills = ranking.candidate?.skills || [];
          return filters.essentialSkills!.every(skill =>
            candidateSkills.some(cs => 
              cs.toLowerCase().includes(skill.toLowerCase())
            )
          );
        });
      }

      if (filters.minExperience) {
        filteredData = filteredData.filter(ranking => 
          (ranking.candidate?.years_experience || 0) >= filters.minExperience!
        );
      }

      setRankings(filteredData as CandidateRanking[]);
    } catch (error) {
      console.error('Error loading rankings:', error);
      toast.error('Errore nel caricamento dei ranking');
    } finally {
      setLoading(false);
    }
  }, [jobOfferId, filters]);

  useEffect(() => {
    loadRankings();
  }, [loadRankings]);

  const generateMatchReasons = useCallback(async (candidateId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-match-reasons', {
        body: { jobOfferId, candidateId }
      });

      if (error) throw error;

      // Refresh rankings to get updated reasons
      await loadRankings();
      
      return data.reasons;
    } catch (error) {
      console.error('Error generating match reasons:', error);
      toast.error('Errore nella generazione delle motivazioni');
      return null;
    }
  }, [jobOfferId, loadRankings]);

  const applyFilters = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  return {
    rankings,
    loading,
    filters,
    applyFilters,
    generateMatchReasons,
    refresh: loadRankings
  };
};