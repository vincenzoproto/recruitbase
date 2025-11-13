import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface JobOffer {
  id: string;
  title: string;
  city: string;
  sector: string;
  experience_level: string;
  description: string;
  created_at: string;
  recruiter_id: string;
}

export interface JobFilterValues {
  city?: string;
  sector?: string;
  experience_level?: string;
  searchQuery?: string;
}

export const useJobOffersFilter = () => {
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJobOffers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("job_offers")
        .select("id, title, city, sector, experience_level, description, created_at, recruiter_id")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setJobOffers(data || []);
      setFilteredJobs(data || []);
    } catch (error) {
      console.error('Error loading job offers:', error);
      toast.error("Errore nel caricamento delle offerte");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobOffers();
  }, [loadJobOffers]);

  const applyFilters = useCallback((filters: JobFilterValues) => {
    let filtered = [...jobOffers];

    if (filters.city) {
      filtered = filtered.filter(job => 
        job.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    if (filters.sector) {
      filtered = filtered.filter(job => 
        job.sector.toLowerCase().includes(filters.sector!.toLowerCase())
      );
    }

    if (filters.experience_level) {
      filtered = filtered.filter(job => 
        job.experience_level === filters.experience_level
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.sector.toLowerCase().includes(query)
      );
    }

    setFilteredJobs(filtered);
  }, [jobOffers]);

  return { 
    jobOffers, 
    filteredJobs, 
    loading, 
    loadJobOffers,
    applyFilters 
  };
};
