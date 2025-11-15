import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Zap, Target } from "lucide-react";
import { getLevelColor, getLevelEmoji } from "@/lib/gamification";

interface GamificationCardProps {
  fullName: string;
  avatarUrl?: string | null;
  role: "recruiter" | "candidate";
  level: number;
  xp: number;
  xpProgress: {
    current: number;
    needed: number;
    total: number;
  };
  trs: number;
  engagement: number;
}

export function GamificationCard({
  fullName,
  avatarUrl,
  role,
  level,
  xp,
  xpProgress,
  trs,
  engagement,
}: GamificationCardProps) {
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  const progressPercent = (xpProgress.current / xpProgress.needed) * 100;

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardContent className="p-4 md:p-6">
        {/* Row 1: Avatar + Name + Level Badge */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{fullName}</h3>
            <p className="text-xs text-muted-foreground">
              {role === "recruiter" ? "👔 Recruiter" : "👤 Candidato"}
            </p>
          </div>

          <Badge 
            className={`bg-gradient-to-r ${getLevelColor(level)} text-white border-none px-3 py-1 text-sm font-bold shrink-0`}
          >
            {getLevelEmoji(level)} Liv. {level}
          </Badge>
        </div>

        {/* Row 2: Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {xpProgress.current} / {xpProgress.needed} XP
            </span>
            <span className="font-semibold text-primary">
              {xpProgress.needed - xpProgress.current} XP al livello successivo
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Row 3: Stats Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Trophy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">TRS</span>
            <span className="font-bold">{trs}/100</span>
          </div>
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/50 text-accent-foreground text-xs font-medium">
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Engagement</span>
            <span className="font-bold">{engagement}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
            <Target className="h-3.5 w-3.5" />
            <span className="font-bold">{xp} XP</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
