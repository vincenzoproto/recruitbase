import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Send, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface FollowUpCandidate {
  id: string;
  full_name: string;
  avatar_url: string | null;
  job_title: string | null;
  last_contact: string;
  days_since: number;
  application_status?: string;
}

interface FollowUpManagerProps {
  recruiterId: string;
  onOpenChat: (candidateId: string, candidateName: string) => void;
}

export const FollowUpManager = ({ recruiterId, onOpenChat }: FollowUpManagerProps) => {
  const [candidates, setCandidates] = useState<FollowUpCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingMessage, setGeneratingMessage] = useState<string | null>(null);

  useEffect(() => {
    loadFollowUpCandidates();
  }, [recruiterId]);

  const loadFollowUpCandidates = async () => {
    try {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const { data: followUps, error } = await supabase
        .from('follow_ups')
        .select(`
          candidate_id,
          last_contact,
          profiles!follow_ups_candidate_id_fkey(
            id,
            full_name,
            avatar_url,
            job_title
          )
        `)
        .eq('recruiter_id', recruiterId)
        .lt('last_contact', fiveDaysAgo.toISOString())
        .order('last_contact', { ascending: true })
        .limit(10);

      if (error) throw error;

      const candidatesData = (followUps || []).map((fu: any) => {
        const daysSince = Math.floor(
          (Date.now() - new Date(fu.last_contact).getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: fu.profiles.id,
          full_name: fu.profiles.full_name,
          avatar_url: fu.profiles.avatar_url,
          job_title: fu.profiles.job_title,
          last_contact: fu.last_contact,
          days_since: daysSince,
        };
      });

      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error loading follow-up candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFollowUpMessage = async (candidate: FollowUpCandidate) => {
    setGeneratingMessage(candidate.id);
    try {
      const { data, error } = await supabase.functions.invoke('ai-message-suggest', {
        body: {
          candidateName: candidate.full_name,
          tone: 'professional',
          context: `Follow-up dopo ${candidate.days_since} giorni dall'ultimo contatto. Ruolo: ${candidate.job_title || 'non specificato'}.`
        }
      });

      if (error) throw error;

      // Open chat with the generated message
      onOpenChat(candidate.id, candidate.full_name);
      
      toast.success('Messaggio generato! Puoi modificarlo prima di inviare.');
    } catch (error: any) {
      console.error('Error generating message:', error);
      toast.error('Errore nella generazione del messaggio');
    } finally {
      setGeneratingMessage(null);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Da ricontattare oggi
          </CardTitle>
          <CardDescription>Candidati da seguire</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
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
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Da ricontattare oggi
          </CardTitle>
          <CardDescription>Tutti i candidati sono aggiornati! 🎉</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          Da ricontattare oggi
        </CardTitle>
        <CardDescription>{candidates.length} candidati da seguire</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900"
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
              <Badge variant="outline" className="mt-1 text-xs">
                {candidate.days_since} giorni fa
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => generateFollowUpMessage(candidate)}
                disabled={generatingMessage === candidate.id}
              >
                <Sparkles className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => onOpenChat(candidate.id, candidate.full_name)}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
