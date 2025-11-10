import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface UnifiedLevelCardProps {
  role: "recruiter" | "candidate";
  level?: string;
  points?: number;
  nextLevelPoints?: number;
  trs?: number;
  cultureFit?: number;
  applications?: number;
  feedback?: number;
}

export const UnifiedLevelCard = ({
  role,
  level = "Bronze",
  points = 0,
  nextLevelPoints = 100,
  trs = 0,
  cultureFit = 0,
  applications = 0,
  feedback = 0,
}: UnifiedLevelCardProps) => {
  const progress = (points / nextLevelPoints) * 100;

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "platinum":
      case "diamond":
        return "from-blue-500 to-purple-500";
      case "gold":
        return "from-yellow-400 to-orange-500";
      case "silver":
        return "from-gray-300 to-gray-400";
      default:
        return "from-amber-600 to-amber-700";
    }
  };

  const getMotivationalMessage = () => {
    if (role === "recruiter") {
      if (points < 50) return "Inizia a contattare candidati per salire di livello!";
      if (points < 150) return "Ottimo lavoro! Continua a fare match di qualità.";
      return "Sei un recruiter stellare! 🌟";
    } else {
      if (trs < 40) return "Aggiorna il tuo profilo per migliorare il TRS.";
      if (trs < 70) return "Rispondi velocemente ai recruiter per aumentare il TRS!";
      return "Profilo eccellente! I recruiter ti adorano 🚀";
    }
  };

  if (role === "recruiter") {
    return (
      <Card className="p-6 shadow-apple-md border-0 bg-gradient-to-br from-card to-secondary/30 animate-scale-in">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className={`bg-gradient-to-r ${getLevelColor(level)} text-white border-0 px-3 py-1 text-sm font-bold`}
              >
                <Trophy className="h-3 w-3 mr-1" />
                {level}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-foreground">{points} punti</p>
          </div>
          <InfoTooltip content="Guadagna punti con follow-up, match e assunzioni. Più punti = livello più alto!" />
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Prossimo livello</span>
            <span className="font-semibold text-foreground">
              {points}/{nextLevelPoints}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <p className="text-sm text-muted-foreground italic">
          {getMotivationalMessage()}
        </p>
      </Card>
    );
  }

  // Candidato: Pannello Carriera
  return (
    <Card className="p-6 shadow-apple-md border-0 bg-gradient-to-br from-card to-secondary/30 animate-scale-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">Pannello Carriera</h3>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`bg-gradient-to-r ${getLevelColor(level)} text-white border-0 px-2 py-0.5 text-xs font-bold`}
            >
              {level}
            </Badge>
            <span className="text-sm text-muted-foreground">{points} pt</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">TRS</span>
            <InfoTooltip content="Talent Relationship Score: misura la tua affidabilità professionale (0-100)" />
          </div>
          <p className="text-2xl font-bold text-foreground">{trs}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Culture Fit</span>
            <InfoTooltip content="Compatibilità media con i valori delle aziende" />
          </div>
          <p className="text-2xl font-bold text-foreground">{cultureFit}%</p>
          <div
            className={`h-1 w-full rounded-full ${
              cultureFit >= 75
                ? "bg-success"
                : cultureFit >= 50
                ? "bg-warning"
                : "bg-destructive"
            }`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm mb-3">
        <span className="text-muted-foreground">Candidature attive</span>
        <span className="font-semibold text-foreground">{applications}</span>
      </div>

      <div className="flex items-center justify-between text-sm mb-4">
        <span className="text-muted-foreground">Feedback ★</span>
        <span className="font-semibold text-foreground">{feedback.toFixed(1)}/5</span>
      </div>

      <Progress value={progress} className="h-2 mb-3" />

      <p className="text-sm text-muted-foreground italic">
        {getMotivationalMessage()}
      </p>
    </Card>
  );
};
