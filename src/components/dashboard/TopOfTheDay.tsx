import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Heart, MapPin, Briefcase, User } from "lucide-react";
import { hapticFeedback } from "@/lib/haptics";

interface TopOfTheDayProps {
  role: "recruiter" | "candidate";
  data?: {
    name?: string;
    company?: string;
    avatar?: string;
    trs?: number;
    cultureFit?: number;
    location?: string;
    position?: string;
  };
  onAction?: () => void;
}

export const TopOfTheDay = ({ role, data, onAction }: TopOfTheDayProps) => {
  if (!data) return null;

  const handleAction = () => {
    hapticFeedback.light();
    onAction?.();
  };

  if (role === "recruiter") {
    // Candidato Top del Giorno
    return (
      <Card className="p-5 shadow-apple-sm border-0 bg-card animate-slide-up hover:shadow-apple-md smooth-transition">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <h3 className="text-sm font-bold text-foreground">
            Candidato Top del Giorno 🌟
          </h3>
        </div>

        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary/20">
            <AvatarImage src={data.avatar} alt={data.name} />
            <AvatarFallback className="bg-primary/10">
              {data.name?.[0] || <User className="h-6 w-6" />}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h4 className="font-bold text-foreground mb-1">{data.name}</h4>
            {data.position && (
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {data.position}
              </p>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  TRS {data.trs}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-success" />
                <span className="text-xs font-semibold text-foreground">
                  Fit {data.cultureFit}%
                </span>
              </div>
            </div>
            {data.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                <MapPin className="h-3 w-3" />
                {data.location}
              </p>
            )}
            <Button
              size="sm"
              className="w-full apple-button"
              onClick={handleAction}
            >
              Contatta
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Offerta Top del Giorno
  return (
    <Card className="p-5 shadow-apple-sm border-0 bg-card animate-slide-up hover:shadow-apple-md smooth-transition">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <h3 className="text-sm font-bold text-foreground">
          Offerta Top del Giorno 🚀
        </h3>
      </div>

      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Briefcase className="h-7 w-7 text-primary" />
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-foreground mb-1">{data.position}</h4>
          <p className="text-sm text-muted-foreground mb-2">{data.company}</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                TRS {data.trs}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-success" />
              <span className="text-xs font-semibold text-foreground">
                Fit {data.cultureFit}%
              </span>
            </div>
          </div>
          {data.location && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
              <MapPin className="h-3 w-3" />
              {data.location}
            </p>
          )}
          <Button
            size="sm"
            className="w-full apple-button"
            onClick={handleAction}
          >
            Candidati
          </Button>
        </div>
      </div>
    </Card>
  );
};
