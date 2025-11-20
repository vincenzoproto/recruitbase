import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useUnifiedGamification } from "@/hooks/useUnifiedGamification";
import { Trophy, Star, TrendingUp, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface GamificationDashboardProps {
  userId: string;
  role?: string;
}

export const GamificationDashboard = ({ userId }: GamificationDashboardProps) => {
  const { stats, loading } = useUnifiedGamification(userId);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!stats) return null;

  const earnedBadges = stats.badges.filter(b => b.earned);
  const progressPercentage = (stats.xpProgress.current / stats.xpProgress.total) * 100;

  return (
    <div className="space-y-6">
      {/* Level & XP Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Livello {stats.level}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.xp} XP totali
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {stats.xpProgress.current} / {stats.xpProgress.total} XP
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progresso al livello successivo</span>
              <span className="font-semibold">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              Mancano {stats.xpProgress.needed} XP al livello {stats.level + 1}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.engagement}</div>
            <p className="text-xs text-muted-foreground">
              Punti di coinvolgimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TRS Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trs}</div>
            <p className="text-xs text-muted-foreground">
              Talent Relationship Score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                I tuoi Badge
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {earnedBadges.length} di {stats.badges.length} sbloccati
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.badges.map((badge) => (
              <div
                key={badge.id}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                  badge.earned
                    ? 'bg-primary/10 border-primary/20 hover:bg-primary/15'
                    : 'bg-muted/30 border-border opacity-50'
                }`}
              >
                <div className="text-3xl">{badge.icon}</div>
                <div className="text-center">
                  <p className="font-medium text-xs">{badge.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {badge.description}
                  </p>
                  {badge.earned && badge.earnedAt && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      Ottenuto
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
