import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Lock, Trophy, Star, Crown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BADGE_CONFIG } from "@/lib/constants/badges";
import type { Achievement, BadgeType } from "@/types";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const LEVEL_CONFIG = {
  bronze: { name: "Bronze", min: 0, max: 99, color: "text-orange-600", icon: Award },
  silver: { name: "Silver", min: 100, max: 499, color: "text-gray-400", icon: Trophy },
  gold: { name: "Gold", min: 500, max: 999, color: "text-yellow-500", icon: Star },
  platinum: { name: "Platinum", min: 1000, max: Infinity, color: "text-purple-500", icon: Crown },
};

const Badges = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState<keyof typeof LEVEL_CONFIG>("bronze");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load achievements
      const { data: achievementsData } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });

      setAchievements((achievementsData || []) as Achievement[]);

      // Load recruiter points
      const { data: pointsData, error: pointsError } = await supabase
        .from("recruiter_points")
        .select("points, level")
        .eq("user_id", user.id)
        .maybeSingle();

      if (pointsData) {
        setPoints(pointsData.points);
        const userLevel = (pointsData.level?.toLowerCase() || "bronze") as keyof typeof LEVEL_CONFIG;
        setLevel(userLevel);

        // Calculate progress to next level
        const currentLevelConfig = LEVEL_CONFIG[userLevel];
        const nextLevelKey = Object.keys(LEVEL_CONFIG)[Object.keys(LEVEL_CONFIG).indexOf(userLevel) + 1] as keyof typeof LEVEL_CONFIG;
        
        if (nextLevelKey) {
          const nextLevelMin = LEVEL_CONFIG[nextLevelKey].min;
          const progressPercent = ((pointsData.points - currentLevelConfig.min) / (nextLevelMin - currentLevelConfig.min)) * 100;
          setProgress(Math.min(100, progressPercent));
        } else {
          setProgress(100);
        }
      } else {
        // Initialize points for new users
        setPoints(0);
        setLevel("bronze");
        setProgress(0);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const LevelIcon = LEVEL_CONFIG[level].icon;

  const allBadges: BadgeType[] = [
    'profile_complete',
    'first_application',
    'email_verified',
    'linkedin_verified',
    'premium_user',
    'ambassador'
  ];

  const earnedBadgeTypes = new Set(achievements.map(a => a.badge_type));

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>

        {/* Level Card */}
        <Card className="mb-6 bg-gradient-to-br from-primary/10 to-background border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <LevelIcon className={`h-8 w-8 ${LEVEL_CONFIG[level].color}`} />
                Livello {LEVEL_CONFIG[level].name}
              </span>
              <span className="text-2xl font-bold">{points} punti</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              I Tuoi Badge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {allBadges.map((badgeType) => {
                const config = BADGE_CONFIG[badgeType];
                const earned = earnedBadgeTypes.has(badgeType);
                const Icon = config.icon;
                const achievement = achievements.find(a => a.badge_type === badgeType);

                return (
                  <div
                    key={badgeType}
                    className={`
                      relative flex flex-col items-center p-4 rounded-lg border
                      transition-all duration-300
                      ${earned 
                        ? 'bg-background/50 border-primary/50 hover:border-primary shadow-sm' 
                        : 'bg-muted/30 border-border/30 opacity-60'
                      }
                    `}
                  >
                    {!earned && (
                      <div className="absolute top-2 right-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className={`
                      p-3 rounded-full mb-2 
                      ${earned ? `bg-background/80 ${config.color}` : 'bg-muted'}
                    `}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <p className="text-sm font-medium text-center mb-1">
                      {config.label}
                    </p>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      {config.description}
                    </p>

                    {earned && achievement && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {new Date(achievement.earned_at).toLocaleDateString('it-IT')}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Level Requirements */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Requisiti Livelli</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(LEVEL_CONFIG).map(([key, config]) => {
                const LevelIcon = config.icon;
                const isCurrentLevel = key === level;
                
                return (
                  <div 
                    key={key}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border
                      ${isCurrentLevel ? 'border-primary/50 bg-primary/5' : 'border-border/30'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <LevelIcon className={`h-5 w-5 ${config.color}`} />
                      <span className="font-medium">{config.name}</span>
                      {isCurrentLevel && (
                        <Badge variant="default" className="text-xs">Attuale</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {config.max === Infinity 
                        ? `${config.min}+ punti`
                        : `${config.min}-${config.max} punti`
                      }
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Badges;
