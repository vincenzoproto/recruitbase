import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, MapPin, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Match {
  id: string;
  match_score: number;
  job_offer_id: string;
  candidate_id: string;
  job_offer?: {
    title: string;
    city: string;
    sector: string;
    experience_level: string;
  };
  profile?: {
    full_name: string;
    city: string;
    skills: string[];
  };
}

interface MatchesListProps {
  userId: string;
  userRole: 'recruiter' | 'candidate';
}

export const MatchesList = ({ userId, userRole }: MatchesListProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
    calculateMatches();

    // Real-time subscription
    const channel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
        },
        () => {
          loadMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userRole]);

  const loadMatches = async () => {
    try {
      if (userRole === 'candidate') {
        const { data, error } = await supabase
          .from('matches')
          .select(`
            *,
            job_offer:job_offers(title, city, sector, experience_level)
          `)
          .eq('candidate_id', userId)
          .order('match_score', { ascending: false })
          .limit(5);

        if (error) throw error;
        setMatches(data || []);
      } else {
        // For recruiters, show best candidates for their jobs
        const { data: jobOffers } = await supabase
          .from('job_offers')
          .select('id')
          .eq('recruiter_id', userId)
          .eq('is_active', true);

        if (jobOffers && jobOffers.length > 0) {
          const jobIds = jobOffers.map(j => j.id);
          
          // Get matches with profile data manually
          const { data: matchesData, error: matchesError } = await supabase
            .from('matches')
            .select('*')
            .in('job_offer_id', jobIds)
            .order('match_score', { ascending: false })
            .limit(10);

          if (matchesError) throw matchesError;

          if (matchesData) {
            // Fetch profiles for each match
            const candidateIds = matchesData.map(m => m.candidate_id);
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, full_name, city, skills')
              .in('id', candidateIds);

            // Combine matches with profiles
            const enrichedMatches = matchesData.map(match => ({
              ...match,
              profile: profilesData?.find(p => p.id === match.candidate_id),
            }));

            setMatches(enrichedMatches);
          }
        }
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMatches = async () => {
    try {
      if (userRole === 'candidate') {
        // Get all active job offers
        const { data: jobs } = await supabase
          .from('job_offers')
          .select('id')
          .eq('is_active', true);

        if (jobs) {
          for (const job of jobs) {
            // Check if match already exists
            const { data: existing } = await supabase
              .from('matches')
              .select('id')
              .eq('candidate_id', userId)
              .eq('job_offer_id', job.id)
              .maybeSingle();

            if (!existing) {
              // Calculate and insert match
              const { data: score } = await supabase.rpc('calculate_match_score', {
                p_candidate_id: userId,
                p_job_offer_id: job.id,
              });

              if (score && score >= 50) {
                await supabase.from('matches').insert({
                  candidate_id: userId,
                  job_offer_id: job.id,
                  match_score: score,
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error calculating matches:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nessun match trovato al momento</p>
        <p className="text-sm mt-2">
          {userRole === 'candidate' 
            ? 'Completa il tuo profilo per ricevere suggerimenti'
            : 'Crea offerte per ricevere candidati suggeriti'}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">
          {userRole === 'candidate' ? 'Offerte Consigliate' : 'Candidati Suggeriti'}
        </h3>
      </div>

      <div className="space-y-3">
        {matches.map((match) => (
          <div
            key={match.id}
            className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                {userRole === 'candidate' && match.job_offer ? (
                  <>
                    <h4 className="font-medium">{match.job_offer.title}</h4>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {match.job_offer.city}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {match.job_offer.sector}
                      </div>
                    </div>
                  </>
                ) : match.profile ? (
                  <>
                    <h4 className="font-medium">{match.profile.full_name}</h4>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {match.profile.city || 'Non specificato'}
                      </div>
                    </div>
                    {match.profile.skills && match.profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {match.profile.skills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                ) : null}
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Match</span>
                  <Badge className={`${getScoreColor(match.match_score)} text-white`}>
                    {match.match_score}%
                  </Badge>
                </div>
                <Button size="sm" variant="outline">
                  Visualizza
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
