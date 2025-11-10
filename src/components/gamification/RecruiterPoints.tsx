import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Zap, TrendingUp, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface RecruiterPointsProps {
  userId: string;
}

interface PointsData {
  points: number;
  level: string;
  level_progress: number;
}

interface RecentAction {
  id: string;
  action_type: string;
  points: number;
  description: string;
  created_at: string;
}

const LEVEL_COLORS = {
  Bronze: "bg-gradient-to-br from-amber-700 to-amber-900",
  Silver: "bg-gradient-to-br from-gray-400 to-gray-600",
  Gold: "bg-gradient-to-br from-yellow-400 to-yellow-600",
  Platinum: "bg-gradient-to-br from-blue-400 to-purple-600",
};

const LEVEL_ICONS = {
  Bronze: Award,
  Silver: Trophy,
  Gold: Trophy,
  Platinum: Zap,
};

const LEVEL_THRESHOLDS = {
  Bronze: { min: 0, max: 200 },
  Silver: { min: 200, max: 500 },
  Gold: { min: 500, max: 1000 },
  Platinum: { min: 1000, max: Infinity },
};

export const RecruiterPoints = ({ userId }: RecruiterPointsProps) => {
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPointsData();
    loadRecentActions();

    // Subscribe to points updates
    const channel = supabase
      .channel('recruiter-points-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recruiter_points',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadPointsData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadPointsData = async () => {
    try {
      const { data, error } = await supabase
        .from('recruiter_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setPointsData(data || { points: 0, level: 'Bronze', level_progress: 0 });
    } catch (error) {
      console.error('Error loading points:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActions = async () => {
    try {
      const { data, error } = await supabase
        .from('recruiter_actions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentActions(data || []);
    } catch (error) {
      console.error('Error loading actions:', error);
    }
  };

  if (loading || !pointsData) {
    return null;
  }

  const LevelIcon = LEVEL_ICONS[pointsData.level as keyof typeof LEVEL_ICONS];
  const levelColor = LEVEL_COLORS[pointsData.level as keyof typeof LEVEL_COLORS];
  const thresholds = LEVEL_THRESHOLDS[pointsData.level as keyof typeof LEVEL_THRESHOLDS];
  const nextLevel = pointsData.level === 'Platinum' ? 'MAX' : 
    pointsData.level === 'Gold' ? 'Platinum' :
    pointsData.level === 'Silver' ? 'Gold' : 'Silver';

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`${levelColor} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <LevelIcon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                Livello {pointsData.level}
                <InfoTooltip 
                  content="I tuoi punti riflettono il tuo impegno nel costruire relazioni di valore con i candidati."
                  side="top"
                />
              </CardTitle>
              <p className="text-sm text-white/80">{pointsData.points} punti</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-none">
            <TrendingUp className="h-3 w-3 mr-1" />
            {pointsData.level_progress}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso verso {nextLevel}</span>
            <span className="font-medium">
              {thresholds.max === Infinity ? 'MAX' : `${pointsData.points}/${thresholds.max}`}
            </span>
          </div>
          <Progress value={pointsData.level_progress} className="h-2" />
        </div>

        {recentActions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Attività recenti
            </h4>
            <div className="space-y-2">
              {recentActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between text-sm p-2 rounded-lg bg-accent/50"
                >
                  <span className="text-muted-foreground">{action.description || action.action_type}</span>
                  <span className={`font-medium ${action.points > 0 ? 'text-success' : 'text-destructive'}`}>
                    {action.points > 0 ? '+' : ''}{action.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 space-y-1 text-xs text-muted-foreground border-t">
          <p>• +5 punti per ogni candidato contattato</p>
          <p>• +10 punti per ogni match confermato</p>
          <p>• +20 punti per ogni candidato assunto</p>
          <p>• -3 punti se TRS scende sotto 40%</p>
        </div>
      </CardContent>
    </Card>
  );
};
