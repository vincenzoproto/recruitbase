import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Lock } from "lucide-react";
import { useAdvancedXPSystem } from "@/hooks/useAdvancedXPSystem";

interface BadgeGalleryProps {
  userId: string;
}

export const BadgeGallery = ({ userId }: BadgeGalleryProps) => {
  const { badges } = useAdvancedXPSystem(userId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">I tuoi Badge</h2>
        <p className="text-muted-foreground">
          Completa le sfide per sbloccare nuovi badge
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {badges.map((badge) => (
          <Card
            key={badge.id}
            className={`relative overflow-hidden transition-all hover:shadow-lg ${
              badge.earned ? "border-primary" : "opacity-60"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="text-4xl">{badge.icon}</div>
                {badge.earned ? (
                  <Badge className="bg-success text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ottenuto
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Lock className="h-3 w-3 mr-1" />
                    Bloccato
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <CardTitle className="text-lg mb-1">{badge.name}</CardTitle>
                <CardDescription className="text-sm">
                  {badge.description}
                </CardDescription>
              </div>

              {!badge.earned && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-semibold">
                      {badge.progress}/{badge.maxProgress}
                    </span>
                  </div>
                  <Progress
                    value={(badge.progress / badge.maxProgress) * 100}
                    className="h-2"
                  />
                </div>
              )}

              {badge.earned && badge.earnedAt && (
                <p className="text-xs text-muted-foreground">
                  Ottenuto il {new Date(badge.earnedAt).toLocaleDateString("it-IT")}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
