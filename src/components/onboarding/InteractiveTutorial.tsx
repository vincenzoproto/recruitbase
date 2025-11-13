import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, X, CheckCircle } from "lucide-react";
import { hapticFeedback } from "@/lib/haptics";

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
  highlight?: string; // Element selector to highlight
}

interface InteractiveTutorialProps {
  open: boolean;
  onComplete: () => void;
  userRole: "recruiter" | "candidate";
}

export const InteractiveTutorial = ({ open, onComplete, userRole }: InteractiveTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const recruiterSteps: TutorialStep[] = [
    {
      title: "Benvenuto in RecruitBase! 👋",
      description: "Ti mostrerò le funzioni principali in 30 secondi. Pronto?",
      icon: "🚀",
    },
    {
      title: "Home Dashboard",
      description: "Qui trovi la panoramica: candidati, match, TRS score e metriche chiave.",
      icon: "🏠",
    },
    {
      title: "Match Intelligenti",
      description: "Swipe per trovare i candidati perfetti. L'AI suggerisce i migliori profili.",
      icon: "💘",
    },
    {
      title: "TRM Pipeline",
      description: "Gestisci candidature con drag & drop. Organizza il tuo processo di selezione.",
      icon: "📋",
    },
    {
      title: "Messaggi Real-time",
      description: "Chat istantanea con candidati. Programma call e invia follow-up automatici.",
      icon: "💬",
    },
    {
      title: "Ricerca Globale ⌘K",
      description: "Premi ⌘K ovunque per cercare candidati, offerte e messaggi istantaneamente.",
      icon: "🔍",
    },
    {
      title: "Tutto Pronto! ✨",
      description: "Ora sei pronto per iniziare. Buon recruiting!",
      icon: "🎉",
    },
  ];

  const candidateSteps: TutorialStep[] = [
    {
      title: "Benvenuto su RecruitBase! 👋",
      description: "Ti guido attraverso le funzioni principali in 30 secondi.",
      icon: "🚀",
    },
    {
      title: "Dashboard Personale",
      description: "Controlla TRS score, candidature attive e suggerimenti AI personalizzati.",
      icon: "🏠",
    },
    {
      title: "Offerte di Lavoro",
      description: "Esplora opportunità filtrate per te. Candidati con un tap.",
      icon: "💼",
    },
    {
      title: "Feed Sociale",
      description: "Connettiti con recruiter e aziende. Commenta e condividi contenuti.",
      icon: "📱",
    },
    {
      title: "Carriera & CV",
      description: "Traccia progressi, ottimizza CV con AI e monitora il tuo TRS.",
      icon: "📈",
    },
    {
      title: "Ricerca Veloce ⌘K",
      description: "Usa ⌘K per cercare offerte, recruiter e messaggi all'istante.",
      icon: "🔍",
    },
    {
      title: "Inizia Ora! ✨",
      description: "Completa il profilo e trova la tua prossima opportunità.",
      icon: "🎉",
    },
  ];

  const steps = userRole === "recruiter" ? recruiterSteps : candidateSteps;

  const handleNext = () => {
    hapticFeedback.light();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    hapticFeedback.medium();
    onComplete();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onComplete}>
      <DialogContent className="sm:max-w-md">
        <div className="relative">
          <button
            onClick={handleSkip}
            className="absolute top-0 right-0 text-muted-foreground hover:text-foreground smooth-transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="space-y-6 py-4">
            {/* Progress bar */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary smooth-transition"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Step icon */}
            <div className="flex justify-center">
              <div className="text-7xl animate-scale-in">
                {steps[currentStep].icon}
              </div>
            </div>

            {/* Step content */}
            <div className="text-center space-y-2 animate-fade-in">
              <h3 className="text-2xl font-bold text-foreground">
                {steps[currentStep].title}
              </h3>
              <p className="text-muted-foreground">
                {steps[currentStep].description}
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex justify-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full smooth-transition ${
                    index === currentStep
                      ? "w-8 bg-primary"
                      : index < currentStep
                      ? "w-2 bg-primary/50"
                      : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  Indietro
                </Button>
              )}
              <Button onClick={handleNext} className="flex-1 gap-2">
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Inizia
                  </>
                ) : (
                  <>
                    Avanti
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Skip link */}
            {currentStep < steps.length - 1 && (
              <button
                onClick={handleSkip}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground smooth-transition"
              >
                Salta tutorial
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
