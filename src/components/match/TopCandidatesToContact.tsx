import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, TrendingUp, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getInitials } from "@/lib/utils/profileHelper";

interface TopCandidatesToContactProps {
  recruiterId: string;
}

export const TopCandidatesToContact = ({ recruiterId }: TopCandidatesToContactProps) => {
  const navigate = useNavigate();
  const [topCandidates, setTopCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopCandidates();
  }, [recruiterId]);

  const loadTopCandidates = async () => {
    try {
      // Get all active job offers
      const { data: jobs } = await supabase
        .from("job_offers")
        .select("id")
        .eq("recruiter_id", recruiterId)
        .eq("is_active", true);

      if (!jobs || jobs.length === 0) {
        setLoading(false);
        return;
      }

      // Get top matches across all jobs that haven't been contacted yet
      const allMatches: any[] = [];
      
      for (const job of jobs) {
        const { data: matches } = await supabase
          .rpc("get_matches_for_job", {
            p_job_offer_id: job.id,
            p_min_completion: 60
          })
          .limit(20);

        if (matches) {
          allMatches.push(...matches.map(m => ({ ...m, job_id: job.id })));
        }
      }

      // Get candidates that haven't been contacted recently (no messages in last 7 days)
      const { data: recentMessages } = await supabase
        .from("messages")
        .select("receiver_id")
        .eq("sender_id", recruiterId)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const contactedIds = new Set(recentMessages?.map(m => m.receiver_id) || []);

      // Filter out contacted candidates and sort by score
      const uncontacted = allMatches
        .filter(m => !contactedIds.has(m.candidate_id) && m.match_score >= 70)
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, 5);

      setTopCandidates(uncontacted);
    } catch (error) {
      console.error("Error loading top candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-gray-600 dark:text-gray-400";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (topCandidates.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Top 5 da contattare oggi
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Candidati con match alto che non hai ancora contattato
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {topCandidates.map((candidate, index) => (
          <div
            key={candidate.candidate_id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="text-2xl font-bold text-muted-foreground w-8">
              #{index + 1}
            </div>
            <Avatar className="h-12 w-12">
              <AvatarImage src={candidate.avatar_url || undefined} />
              <AvatarFallback>{getInitials(candidate.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold truncate">{candidate.full_name}</h4>
                <Badge className={getScoreColor(candidate.match_score)}>
                  {candidate.match_score}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {candidate.job_title || "Candidato"} · {candidate.seniority_level || "N/A"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/profile/${candidate.candidate_id}`)}
              >
                <User className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => navigate(`/messages?userId=${candidate.candidate_id}`)}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
