import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, Target, Zap, Star, Trophy, Crown } from "lucide-react";
import { ProfileBadge } from "@/components/profile/ProfileBadge";

interface GamificationStats {
  level: string;
  points: number;
  levelProgress: number;
  nextLevelPoints: number;
  achievements: any[];
  recentActions: any[];
}

const LEVEL_THRESHOLDS = {
  Bronze: 0,
  Silver: 100,
  Gold: 500,
  Platinum: 1000,
};

const LEVEL_COLORS = {
  Bronze: "text-orange-600",
  Silver: "text-gray-400",
  Gold: "text-yellow-500",
  Platinum: "text-purple-500",
};

const LEVEL_ICONS = {
  Bronze: Award,
  Silver: Trophy,
  Gold: Star,
  Platinum: Crown,
};

export const GamificationDashboard = ({ userId, role }: { userId: string; role: string }) => {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    
    // Real-time subscription for points updates
    const channel = supabase
      .channel('gamification-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recruiter_points',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadStats = async () => {
    try {
      // Load points
      const { data: pointsData } = await supabase
        .from("recruiter_points")
        .select("*")
        .eq("user_id", userId)
        .single();

      // Load achievements
      const { data: achievementsData } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", userId)
        .order("earned_at", { ascending: false });

      // Load recent actions
      const { data: actionsData } = await supabase
        .from("recruiter_actions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (pointsData) {
        const currentPoints = pointsData.points;
        const currentLevel = pointsData.level;
        
        // Calculate next level threshold
        const levels = Object.keys(LEVEL_THRESHOLDS);
        const currentLevelIndex = levels.indexOf(currentLevel);
        const nextLevel = levels[currentLevelIndex + 1];
        const nextLevelPoints = nextLevel ? LEVEL_THRESHOLDS[nextLevel as keyof typeof LEVEL_THRESHOLDS] : currentPoints;
        const currentLevelThreshold = LEVEL_THRESHOLDS[currentLevel as keyof typeof LEVEL_THRESHOLDS];
        
        const progress = nextLevel 
          ? ((currentPoints - currentLevelThreshold) / (nextLevelPoints - currentLevelThreshold)) * 100
          : 100;

        setStats({
          level: currentLevel,
          points: currentPoints,
          levelProgress: Math.min(progress, 100),
          nextLevelPoints,
          achievements: achievementsData || [],
          recentActions: actionsData || [],
        });
      }
    } catch (error) {
      console.error("Error loading gamification stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return null;
  }

  const LevelIcon = LEVEL_ICONS[stats.level as keyof typeof LEVEL_ICONS];
  const levelColor = LEVEL_COLORS[stats.level as keyof typeof LEVEL_COLORS];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Level Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LevelIcon className={`h-5 w-5 ${levelColor}`} />
            Livello {stats.level}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-foreground">{stats.points}</span>
            <Badge variant="outline" className={levelColor}>
              {stats.level}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-semibold text-foreground">
                {Math.round(stats.levelProgress)}%
              </span>
            </div>
            <Progress value={stats.levelProgress} className="h-2" />
            {stats.nextLevelPoints > stats.points && (
              <p className="text-xs text-muted-foreground text-center">
                {stats.nextLevelPoints - stats.points} punti al prossimo livello
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievements Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Badge Guadagnati
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.achievements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nessun badge ancora. Continua a essere attivo!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stats.achievements.slice(0, 6).map((achievement) => (
                <Badge 
                  key={achievement.id}
                  variant="secondary"
                  className="text-xs"
                >
                  {achievement.badge_type}
                </Badge>
              ))}
              {stats.achievements.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{stats.achievements.length - 6} altri
                </Badge>
              )}
            </div>
          )}
          <div className="mt-4 text-center">
            <span className="text-2xl font-bold text-foreground">
              {stats.achievements.length}
            </span>
            <p className="text-xs text-muted-foreground">Badge totali</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-primary" />
            Attività Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nessuna attività recente
            </p>
          ) : (
            <div className="space-y-2">
              {stats.recentActions.map((action) => (
                <div 
                  key={action.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-accent/50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {action.action_type.replace(/_/g, ' ')}
                    </p>
                    {action.description && (
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    )}
                  </div>
                  <Badge 
                    variant={action.points > 0 ? "default" : "secondary"}
                    className="ml-2"
                  >
                    {action.points > 0 ? '+' : ''}{action.points}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
