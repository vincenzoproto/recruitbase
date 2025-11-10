import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import TRSBadge from "@/components/trm/TRSBadge";

interface HomeCardProps {
  userRole: "recruiter" | "candidate";
  level?: string;
  levelProgress?: number;
  trs?: number;
  cultureFit?: number;
  activeApplications?: number;
  topCandidate?: {
    name: string;
    avatar?: string;
    trs: number;
    cultureFit: number;
  };
  topOffer?: {
    title: string;
    company: string;
    trs: number;
    cultureFit: number;
  };
  onAction?: () => void;
}

export const HomeCard = ({
  userRole,
  level = "Bronze",
  levelProgress = 65,
  trs = 75,
  cultureFit = 82,
  activeApplications = 3,
  topCandidate,
  topOffer,
  onAction
}: HomeCardProps) => {
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "diamond": return "text-blue-400";
      case "gold": return "text-yellow-500";
      case "silver": return "text-gray-400";
      default: return "text-orange-600";
    }
  };

  const getMotivationalMessage = (progress: number) => {
    if (progress < 30) return "Ottimo inizio! Continua così 🚀";
    if (progress < 70) return "Stai facendo progressi! 💪";
    return "Quasi al livello successivo! 🔥";
  };

  return (
    <div className="space-y-4">
      {/* Main Level Card - Recruiter */}
      {userRole === "recruiter" && (
        <Card className="bg-gradient-to-br from-primary/10 via-background to-primary/5 border-primary/20 shadow-apple-md">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <span className={getLevelColor(level)}>Livello {level}</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getMotivationalMessage(levelProgress)}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {levelProgress}%
                </Badge>
              </div>
            </div>
            <Progress value={levelProgress} className="h-3" />
          </CardContent>
        </Card>
      )}

      {/* Main Career Panel - Candidate */}
      {userRole === "candidate" && (
        <Card className="bg-gradient-to-br from-primary/10 via-background to-primary/5 border-primary/20 shadow-apple-md">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Pannello Carriera
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">TRS</p>
                <div className="flex items-center gap-2">
                  <TRSBadge score={trs} size="sm" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Culture Fit</p>
                <p className="text-2xl font-bold">{cultureFit}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Candidature</p>
                <p className="text-2xl font-bold">{activeApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top of the Day - Dynamic Section */}
      <Card className="hover:shadow-apple-md smooth-transition">
        <CardContent className="p-6 space-y-4">
          {userRole === "recruiter" && topCandidate ? (
            <>
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Candidato Top del Giorno
                </h4>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary/20">
                  <AvatarImage src={topCandidate.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    {topCandidate.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{topCandidate.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <TRSBadge score={topCandidate.trs} size="sm" />
                    <Badge variant="outline" className="text-xs">
                      Fit {topCandidate.cultureFit}%
                    </Badge>
                  </div>
                </div>
              </div>
              <Button onClick={onAction} className="w-full" size="sm">
                Contatta
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          ) : userRole === "candidate" && topOffer ? (
            <>
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Offerta Top del Giorno
                </h4>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-lg">{topOffer.title}</p>
                  <p className="text-sm text-muted-foreground">{topOffer.company}</p>
                </div>
                <div className="flex items-center gap-2">
                  <TRSBadge score={topOffer.trs} size="sm" />
                  <Badge variant="outline" className="text-xs">
                    Fit {topOffer.cultureFit}%
                  </Badge>
                </div>
              </div>
              <Button onClick={onAction} className="w-full" size="sm">
                Candidati Subito
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
