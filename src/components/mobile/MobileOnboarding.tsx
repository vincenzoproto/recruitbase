import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Briefcase, UserPlus, TrendingUp, X } from "lucide-react";

interface MobileOnboardingProps {
  open: boolean;
  onComplete: () => void;
}

const steps = [
  {
    icon: Briefcase,
    title: "Crea la tua pipeline",
    description: "Organizza i candidati in colonne personalizzate per ogni fase del processo di selezione."
  },
  {
    icon: UserPlus,
    title: "Aggiungi candidati",
    description: "Importa profili da LinkedIn o aggiungi manualmente i talenti che vuoi seguire."
  },
  {
    icon: TrendingUp,
    title: "Scopri il TRS™",
    description: "Monitora il punteggio di relazione per ogni candidato e migliora il tuo engagement."
  }
];

export const MobileOnboarding = ({ open, onComplete }: MobileOnboardingProps) => {
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

  const CurrentIcon = steps[currentStep].icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={handleSkip}>
      <DialogContent className="max-w-md p-0 gap-0">
        <div className="relative p-6 space-y-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="pt-8 space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <CurrentIcon className="h-10 w-10 text-primary animate-scale-in" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                {steps[currentStep].title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {steps[currentStep].description}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
              >
                Salta
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                {currentStep < steps.length - 1 ? "Avanti" : "Inizia"}
              </Button>
            </div>
          </div>

          <div className="flex justify-center gap-2 pt-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep ? "w-8 bg-primary" : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
