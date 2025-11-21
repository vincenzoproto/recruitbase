import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import TRSBadge from "./TRSBadge";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface TRSDashboardCardProps {
  recruiterId: string;
}

const TRSDashboardCard = ({ recruiterId }: TRSDashboardCardProps) => {
  const [avgScore, setAvgScore] = useState<number>(0);
  const [weeklyTrend, setWeeklyTrend] = useState<number>(0);
  const [topCandidates, setTopCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTRSData();
  }, [recruiterId]);

  const loadTRSData = async () => {
    try {
      // Get all candidates with interactions from this recruiter
      const { data: interactions } = await supabase
        .from('interactions')
        .select('candidate_id')
        .eq('recruiter_id', recruiterId);

      if (!interactions || interactions.length === 0) {
        setLoading(false);
        return;
      }

      const candidateIds = [...new Set(interactions.map(i => i.candidate_id))];

      // Get profiles with TRS
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, talent_relationship_score, trs_last_updated')
        .in('id', candidateIds)
        .order('talent_relationship_score', { ascending: false });

      if (profiles && profiles.length > 0) {
        // Calculate average TRS
        const totalScore = profiles.reduce((sum, p) => sum + (p.talent_relationship_score || 0), 0);
        const avg = Math.round(totalScore / profiles.length);
        setAvgScore(avg);

        // Mock weekly trend (in real app, compare with previous week data)
        const trend = Math.floor(Math.random() * 10) - 2; // -2 to +8
        setWeeklyTrend(trend);

        // Top 3 candidates
        setTopCandidates(profiles.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading TRS data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Talent Relationship Score™
              <InfoTooltip 
                content="Misura la qualità delle relazioni: frequenza contatti, tempo risposta, interazioni positive, profilo completo, note e tag"
                side="top"
              />
            </CardTitle>
            <CardDescription>La tua media di qualità relazionale</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground">{avgScore}</div>
            <div className={`flex items-center gap-1 text-sm ${weeklyTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {weeklyTrend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {weeklyTrend >= 0 ? '+' : ''}{weeklyTrend}% questa settimana
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="relative w-full bg-muted rounded-full h-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                avgScore >= 70 ? 'bg-green-500' : avgScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${avgScore}%` }}
            />
          </div>

          {topCandidates.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Top Relazioni</p>
              {topCandidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">{candidate.full_name}</span>
                  <TRSBadge score={candidate.talent_relationship_score || 0} size="sm" />
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground italic mt-4 border-t pt-3">
            🔒 Talent Relationship Score™ – Proprietary Metric. Algoritmo esclusivo Pausilio.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TRSDashboardCard;
