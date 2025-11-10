import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PriorityCandidate {
  id: string;
  full_name: string;
  avatar_url: string | null;
  job_title: string | null;
  talent_relationship_score: number;
  priority_score: number;
  days_since_contact: number;
}

interface PriorityCardProps {
  recruiterId: string;
  onOpenChat: (candidateId: string, candidateName: string) => void;
}

export const PriorityCard = ({ recruiterId, onOpenChat }: PriorityCardProps) => {
  const [candidates, setCandidates] = useState<PriorityCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPriorityCandidates();
  }, [recruiterId]);

  const loadPriorityCandidates = async () => {
    try {
      // Get all candidates the recruiter has interacted with
      const { data: interactions, error: intError } = await supabase
        .from('interactions')
        .select('candidate_id')
        .eq('recruiter_id', recruiterId);

      if (intError) throw intError;

      const candidateIds = [...new Set(interactions?.map(i => i.candidate_id) || [])];

      if (candidateIds.length === 0) {
        setLoading(false);
        return;
      }

      // Get candidate details
      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, job_title, talent_relationship_score')
        .in('id', candidateIds);

      if (profError) throw profError;

      // Calculate priority scores
      const candidatesWithPriority = await Promise.all(
        (profiles || []).map(async (candidate) => {
          const { data: followUp } = await supabase
            .from('follow_ups')
            .select('last_contact')
            .eq('candidate_id', candidate.id)
            .eq('recruiter_id', recruiterId)
            .single();

          const daysSinceContact = followUp?.last_contact
            ? Math.floor((Date.now() - new Date(followUp.last_contact).getTime()) / (1000 * 60 * 60 * 24))
            : 999;

          const trs = candidate.talent_relationship_score || 0;
          const cultureFit = 80; // Default
          const priorityScore = Math.max(0, 100 - daysSinceContact) + Math.round(trs * 0.6) + Math.round(cultureFit * 0.4);

          return {
            ...candidate,
            priority_score: priorityScore,
            days_since_contact: daysSinceContact,
          };
        })
      );

      // Sort by priority score and take top 5
      const topCandidates = candidatesWithPriority
        .sort((a, b) => b.priority_score - a.priority_score)
        .slice(0, 5);

      setCandidates(topCandidates);
    } catch (error) {
      console.error('Error loading priority candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Top 5 da contattare oggi
          </CardTitle>
          <CardDescription>Candidati con priorità più alta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (candidates.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Top 5 da contattare oggi
          </CardTitle>
          <CardDescription>Nessun candidato trovato</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Top 5 da contattare oggi
        </CardTitle>
        <CardDescription>Candidati con priorità più alta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {candidates.map((candidate, idx) => (
          <div
            key={candidate.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
          >
            <div className="flex-shrink-0">
              <Badge variant="default" className="h-6 w-6 rounded-full flex items-center justify-center p-0">
                {idx + 1}
              </Badge>
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage src={candidate.avatar_url || undefined} />
              <AvatarFallback>
                {candidate.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{candidate.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {candidate.job_title || 'Nessun ruolo'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  Score: {candidate.priority_score}
                </Badge>
                {candidate.days_since_contact < 999 && (
                  <span className="text-xs text-muted-foreground">
                    {candidate.days_since_contact}g fa
                  </span>
                )}
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => onOpenChat(candidate.id, candidate.full_name)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
