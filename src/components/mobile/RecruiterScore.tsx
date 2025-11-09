import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RecruiterScoreProps {
  userId: string;
}

export const RecruiterScore = ({ userId }: RecruiterScoreProps) => {
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateScore();
  }, [userId]);

  const calculateScore = async () => {
    try {
      // Calculate based on activity, response time, and candidate retention
      const { data: interactions } = await supabase
        .from("interactions")
        .select("*")
        .eq("recruiter_id", userId)
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: candidates } = await supabase
        .from("profiles")
        .select("talent_relationship_score")
        .eq("role", "candidate");

      let calculatedScore = 50; // Base score

      // Activity bonus (max 30 points)
      if (interactions && interactions.length > 0) {
        calculatedScore += Math.min(30, interactions.length * 2);
      }

      // High TRS candidates bonus (max 20 points)
      if (candidates) {
        const highTRSCount = candidates.filter((c) => c.talent_relationship_score > 70).length;
        calculatedScore += Math.min(20, highTRSCount * 2);
      }

      setScore(Math.min(100, calculatedScore));
    } catch (error) {
      console.error("Error calculating recruiter score:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recruiter Score™</p>
              <p className="text-2xl font-bold text-foreground">{score}</p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            Eccellente
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
