import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import TRSBadge from "@/components/trm/TRSBadge";
import { hapticFeedback } from "@/lib/haptics";
import { useToast } from "@/hooks/use-toast";

interface CandidateMatch {
  id: string;
  full_name: string;
  job_title: string;
  city: string;
  skills: string[];
  talent_relationship_score: number;
  match_reason: string;
}

export const AICandidateMatcher = ({ recruiterId }: { recruiterId: string }) => {
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAIMatches();
  }, [recruiterId]);

  const loadAIMatches = async () => {
    try {
      // Get recruiter's recent interactions to understand preferences
      const { data: interactions } = await supabase
        .from('interactions')
        .select('candidate_id, type')
        .eq('recruiter_id', recruiterId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get candidates with high TRS
      const { data: candidates } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'candidate')
        .gte('talent_relationship_score', 60)
        .limit(3);

      if (candidates) {
        const enrichedMatches = candidates.map(c => ({
          id: c.id,
          full_name: c.full_name,
          job_title: c.job_title || 'Candidato',
          city: c.city || '',
          skills: c.skills || [],
          talent_relationship_score: c.talent_relationship_score || 0,
          match_reason: c.talent_relationship_score > 80 ? 
            'Eccellente relazione' : 
            'Alto potenziale'
        }));
        setMatches(enrichedMatches);
      }
    } catch (error) {
      console.error('Error loading AI matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactCandidate = async (candidateId: string) => {
    await hapticFeedback.medium();
    toast({
      title: "Apertura chat",
      description: "Funzionalità in arrivo!",
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Caricamento suggerimenti...</h3>
        </div>
      </Card>
    );
  }

  if (matches.length === 0) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-primary/10 to-background border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">AI Candidate Matcher™</h3>
          <p className="text-sm text-muted-foreground">Suggeriti per te</p>
        </div>
      </div>

      <div className="space-y-3">
        {matches.map((match) => (
          <div
            key={match.id}
            className="p-4 rounded-lg bg-card border hover:border-primary/50 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium">{match.full_name}</h4>
                <p className="text-sm text-muted-foreground">{match.job_title}</p>
              </div>
              <TRSBadge score={match.talent_relationship_score} size="sm" />
            </div>

            {match.city && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MapPin className="h-3 w-3" />
                <span>{match.city}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {match.match_reason}
              </span>
            </div>

            {match.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {match.skills.slice(0, 3).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <Button
              onClick={() => handleContactCandidate(match.id)}
              size="sm"
              className="w-full"
            >
              Contatta ora
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
