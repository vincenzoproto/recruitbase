import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, UserPlus, TrendingUp, X } from "lucide-react";

interface OnboardingFlowProps {
  open: boolean;
  onComplete: () => void;
}

const steps = [
  {
    title: "Crea la tua prima pipeline",
    description: "Organizza i candidati in colonne personalizzabili per tracciare ogni fase del processo di selezione.",
    icon: Users,
  },
  {
    title: "Aggiungi un candidato",
    description: "Importa profili, aggiungi note e inizia a costruire relazioni autentiche con i talenti.",
    icon: UserPlus,
  },
  {
    title: "Scopri il tuo primo TRS™",
    description: "Il nostro algoritmo proprietario misura la qualità delle tue relazioni professionali in tempo reale.",
    icon: TrendingUp,
  },
];

export const OnboardingFlow = ({ open, onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentIcon = steps[currentStep].icon;

  return (
    <Dialog open={open} onOpenChange={handleSkip}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Benvenuto in Recruit Base</span>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Progress value={progress} className="h-2" />

          <div className="text-center space-y-4 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <CurrentIcon className="h-10 w-10 text-primary" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                Step {currentStep + 1}: {steps[currentStep].title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {steps[currentStep].description}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSkip} className="flex-1">
              Salta onboarding
            </Button>
            <Button onClick={handleNext} className="flex-1">
              {currentStep < steps.length - 1 ? "Avanti" : "Inizia"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
