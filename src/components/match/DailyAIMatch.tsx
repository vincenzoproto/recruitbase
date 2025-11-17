import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, ArrowRight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getInitials } from "@/lib/utils/profileHelper";

interface DailyAIMatchProps {
  recruiterId: string;
}

export const DailyAIMatch = ({ recruiterId }: DailyAIMatchProps) => {
  const navigate = useNavigate();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailyMatch();
  }, [recruiterId]);

  const loadDailyMatch = async () => {
    try {
      // Get one active job offer from this recruiter
      const { data: jobs } = await supabase
        .from("job_offers")
        .select("id, title")
        .eq("recruiter_id", recruiterId)
        .eq("is_active", true)
        .limit(1);

      if (!jobs || jobs.length === 0) {
        setLoading(false);
        return;
      }

      const job = jobs[0];

      // Get top match for this job
      const { data: matches } = await supabase
        .rpc("get_matches_for_job", {
          p_job_offer_id: job.id,
          p_min_completion: 60
        })
        .limit(1);

      if (matches && matches.length > 0) {
        setMatch({
          ...matches[0],
          job_title_offer: job.title,
          job_id: job.id
        });
      }
    } catch (error) {
      console.error("Error loading daily match:", error);
    } finally {
      setLoading(false);
    }
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

  if (!match) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-gray-400";
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Match del Giorno
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={match.avatar_url || undefined} />
            <AvatarFallback>{getInitials(match.full_name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{match.full_name}</h3>
              <div className={`px-2 py-1 rounded-full ${getScoreColor(match.match_score)} text-white text-sm font-bold`}>
                {match.match_score}%
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {match.job_title || "Candidato"} · {match.seniority_level || "N/A"}
            </p>
            {match.city && (
              <p className="text-xs text-muted-foreground mt-1">
                📍 {match.city}
              </p>
            )}
          </div>
        </div>

        <div className="bg-background/50 rounded-lg p-3 space-y-2">
          <p className="text-sm">
            <span className="font-medium">Oggi potresti voler conoscere</span> {match.full_name}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>
              Match <strong>{match.match_score}%</strong> per l'offerta{" "}
              <strong>{match.job_title_offer}</strong>
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/profile/${match.candidate_id}`)}
            className="flex-1"
          >
            Vedi profilo
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(`/ai-match/${match.job_id}`)}
            className="flex-1"
          >
            Vedi tutti i match
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
