import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface CandidateWithFeedback {
  id: string;
  full_name: string;
  avatar_url: string | null;
  job_title: string | null;
  feedback_notes: string | null;
  application_status: string;
}

interface PositiveFeedbackCardProps {
  recruiterId: string;
  onOpenChat: (candidateId: string, candidateName: string) => void;
}

export const PositiveFeedbackCard = ({ recruiterId, onOpenChat }: PositiveFeedbackCardProps) => {
  const [candidates, setCandidates] = useState<CandidateWithFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPositiveCandidates();
  }, [recruiterId]);

  const loadPositiveCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          candidate_id,
          status,
          feedback_notes,
          job_offer_id,
          job_offers!inner(recruiter_id),
          profiles!applications_candidate_id_fkey(
            id,
            full_name,
            avatar_url,
            job_title
          )
        `)
        .eq('job_offers.recruiter_id', recruiterId)
        .eq('feedback_type', 'positivo')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const formattedCandidates = (data || []).map((app: any) => ({
        id: app.profiles.id,
        full_name: app.profiles.full_name,
        avatar_url: app.profiles.avatar_url,
        job_title: app.profiles.job_title,
        feedback_notes: app.feedback_notes,
        application_status: app.status,
      }));

      setCandidates(formattedCandidates);
    } catch (error) {
      console.error('Error loading positive candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Candidati con feedback positivo
          </CardTitle>
          <CardDescription>I tuoi migliori candidati</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
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
            <Star className="h-5 w-5 text-yellow-500" />
            Candidati con feedback positivo
          </CardTitle>
          <CardDescription>Nessun feedback positivo ancora</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Candidati con feedback positivo
        </CardTitle>
        <CardDescription>{candidates.length} candidati eccellenti</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900"
          >
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
              {candidate.feedback_notes && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  "{candidate.feedback_notes}"
                </p>
              )}
              <Badge variant="default" className="mt-1 text-xs">
                {candidate.application_status === 'assunto' ? 'Assunto' : 'In processo'}
              </Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
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
