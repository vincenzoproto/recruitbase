import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, UserPlus, TrendingUp, X } from "lucide-react";
import { CoreValuesStep } from "./CoreValuesStep";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OnboardingFlowProps {
  open: boolean;
  onComplete: () => void;
  userId?: string;
}

const steps = [
  {
    title: "Crea la tua prima pipeline",
    description: "Organizza i candidati in colonne personalizzabili per tracciare ogni fase del processo di selezione.",
    icon: Users,
    type: "info" as const,
  },
  {
    title: "I tuoi valori aziendali",
    description: "Seleziona i valori che rappresentano la tua cultura per trovare i candidati perfetti.",
    icon: TrendingUp,
    type: "values" as const,
  },
  {
    title: "Aggiungi un candidato",
    description: "Importa profili, aggiungi note e inizia a costruire relazioni autentiche con i talenti.",
    icon: UserPlus,
    type: "info" as const,
  },
];

export const OnboardingFlow = ({ open, onComplete, userId }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [coreValues, setCoreValues] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    // Save core values if on values step
    if (steps[currentStep].type === 'values' && coreValues.length > 0 && userId) {
      setSaving(true);
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ core_values: coreValues })
          .eq('id', userId);

        if (error) throw error;
        toast.success("Valori salvati con successo!");
      } catch (error) {
        console.error("Error saving values:", error);
        toast.error("Errore nel salvataggio dei valori");
      } finally {
        setSaving(false);
      }
    }

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
  const currentStepData = steps[currentStep];

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

          {currentStepData.type === 'values' ? (
            <CoreValuesStep
              selectedValues={coreValues}
              onChange={setCoreValues}
            />
          ) : (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <CurrentIcon className="h-10 w-10 text-primary" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  Step {currentStep + 1}: {currentStepData.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {currentStepData.description}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSkip} className="flex-1" disabled={saving}>
              Salta onboarding
            </Button>
            <Button 
              onClick={handleNext} 
              className="flex-1"
              disabled={saving || (currentStepData.type === 'values' && coreValues.length === 0)}
            >
              {saving ? "Salvataggio..." : currentStep < steps.length - 1 ? "Avanti" : "Inizia"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
