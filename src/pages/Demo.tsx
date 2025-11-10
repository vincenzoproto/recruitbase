import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, User, MessageCircle, Calendar, Brain, ArrowLeft, Sparkles } from "lucide-react";
import TRSBadge from "@/components/trm/TRSBadge";
import { toast } from "sonner";

const Demo = () => {
  const navigate = useNavigate();
  const [showCTA, setShowCTA] = useState(false);

  // Show CTA after 60 seconds
  useState(() => {
    const timer = setTimeout(() => setShowCTA(true), 60000);
    return () => clearTimeout(timer);
  });

  const fakeCandidates = [
    {
      id: "1",
      name: "Marco Rossi",
      title: "Senior Frontend Developer",
      city: "Milano",
      skills: ["React", "TypeScript", "Node.js"],
      trs: 85,
      stage: 0,
    },
    {
      id: "2",
      name: "Laura Bianchi",
      title: "Product Designer",
      city: "Roma",
      skills: ["Figma", "UI/UX", "Design System"],
      trs: 72,
      stage: 1,
    },
    {
      id: "3",
      name: "Giuseppe Verdi",
      title: "Backend Engineer",
      city: "Torino",
      skills: ["Python", "Django", "PostgreSQL"],
      trs: 90,
      stage: 2,
    },
  ];

  const stages = [
    { name: "Nuovi candidati", color: "#3B82F6", count: 1 },
    { name: "In valutazione", color: "#8B5CF6", count: 1 },
    { name: "Colloquio", color: "#F59E0B", count: 1 },
    { name: "Assunti", color: "#10B981", count: 0 },
  ];

  const handleDemoAction = () => {
    toast.info("👋 Questa è solo una demo!", {
      description: "Registrati per salvare i tuoi dati reali",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Banner */}
      <div className="sticky top-0 z-50 bg-primary text-primary-foreground py-3 px-4 text-center shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Indietro
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">Demo Live — Non salvabile</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/auth")}
            className="font-semibold"
          >
            Registrati
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pipeline Demo</h1>
          <p className="text-muted-foreground">
            Trascina i candidati tra le colonne per vedere come funziona
          </p>
        </div>

        {/* Mini KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-4">
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-muted-foreground">Candidature Attive</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold">33%</p>
            <p className="text-xs text-muted-foreground">In Colloquio</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold">4h</p>
            <p className="text-xs text-muted-foreground">Tempo Risposta</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold">82</p>
            <p className="text-xs text-muted-foreground">TRS Medio</p>
          </Card>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage, stageIdx) => (
            <div key={stageIdx} className="flex-shrink-0 w-80">
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
                <h3 className="font-semibold">{stage.name}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {stage.count}
                </Badge>
              </div>

              <div className="space-y-2">
                {fakeCandidates
                  .filter((c) => c.stage === stageIdx)
                  .map((candidate) => (
                    <Card
                      key={candidate.id}
                      className="p-4 cursor-pointer hover:shadow-md transition-all"
                      onClick={handleDemoAction}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            {candidate.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={handleDemoAction}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">
                        {candidate.title}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        📍 {candidate.city}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {candidate.skills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-3 pt-2 border-t space-y-2">
                        <TRSBadge score={candidate.trs} size="sm" />

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleDemoAction}
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleDemoAction}
                          >
                            <Calendar className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleDemoAction}
                          >
                            <Brain className="h-3.5 w-3.5 text-primary" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Popup */}
      {showCTA && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center space-y-6 animate-fade-in shadow-2xl">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Ti piace questa dashboard?</h2>
            <p className="text-muted-foreground">
              Provala gratis per 30 giorni e gestisci candidature reali con AI integrata
            </p>
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="w-full"
              >
                Inizia ora gratis
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowCTA(false)}
                className="w-full"
              >
                Continua demo
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Demo;
