import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Mission {
  id: string;
  title: string;
  description: string;
  path: string;
  completed?: boolean;
}

interface QuickMissionsProps {
  role: "recruiter" | "candidate";
}

export function QuickMissions({ role }: QuickMissionsProps) {
  const navigate = useNavigate();

  const recruiterMissions: Mission[] = [
    {
      id: "contact_candidate",
      title: "Contatta 1 candidato da Job Match",
      description: "+20 XP",
      path: "/matches",
    },
    {
      id: "reply_messages",
      title: "Rispondi ai messaggi in attesa",
      description: "+30 XP per risposta rapida",
      path: "/messages",
    },
    {
      id: "feed_post",
      title: "Pubblica un aggiornamento nel feed",
      description: "+25 XP",
      path: "/feed",
    },
  ];

  const candidateMissions: Mission[] = [
    {
      id: "update_profile",
      title: "Aggiorna una sezione del profilo",
      description: "+20 XP",
      path: "/profile",
    },
    {
      id: "apply_job",
      title: "Candidati ad almeno 1 offerta in linea",
      description: "+15 XP",
      path: "/offers",
    },
    {
      id: "feed_comment",
      title: "Commenta un post nel feed",
      description: "+10 XP",
      path: "/feed",
    },
  ];

  const missions = role === "recruiter" ? recruiterMissions : candidateMissions;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span className="text-xl">🎯</span>
          Oggi puoi fare
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {missions.map((mission) => (
          <Button
            key={mission.id}
            variant="ghost"
            className="w-full justify-between h-auto py-3 px-4 hover:bg-accent/50"
            onClick={() => navigate(mission.path)}
          >
            <div className="flex items-start gap-3 flex-1 text-left">
              {mission.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm mb-0.5">{mission.title}</p>
                <p className="text-xs text-muted-foreground">{mission.description}</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
