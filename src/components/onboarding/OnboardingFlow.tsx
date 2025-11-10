import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, X, CheckCircle } from "lucide-react";
import { CoreValuesStep } from "./CoreValuesStep";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface OnboardingFlowProps {
  open: boolean;
  onComplete: () => void;
  userId?: string;
}

const steps = [
  {
    title: "I tuoi valori",
    description: "Seleziona fino a 5 valori che rappresentano la tua cultura per trovare i match perfetti.",
    icon: Heart,
    type: "values" as const,
  },
];

export const OnboardingFlow = ({ open, onComplete, userId }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [coreValues, setCoreValues] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleComplete = async () => {
    if (coreValues.length === 0) {
      toast.error("Seleziona almeno un valore per continuare");
      return;
    }

    if (!userId) {
      toast.error("Errore: utente non trovato");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          core_values: coreValues,
          onboarding_completed: true 
        })
        .eq('id', userId);

      if (error) throw error;

      setSaved(true);
      toast.success("Profilo pronto! ✨");
      
      // Delay per mostrare l'animazione di successo
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      console.error("Error saving values:", error);
      toast.error("Errore nel salvataggio. Riprova");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (saving) return;
    onComplete();
  };

  const progress = 100;
  const currentStepData = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={handleSkip}>
      <DialogContent className="max-w-md border-none shadow-2xl">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10"
          disabled={saving}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="space-y-6 py-2">
          {saved ? (
            <div className="text-center py-8 space-y-4 animate-scale-in">
              <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-success animate-scale-in" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-success">Profilo pronto! ✨</h3>
                <p className="text-muted-foreground">
                  Reindirizzamento alla dashboard...
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Completa il profilo</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <CoreValuesStep
                selectedValues={coreValues}
                onChange={setCoreValues}
              />

              {coreValues.length === 0 && (
                <p className="text-sm text-destructive text-center">
                  ⚠️ Seleziona almeno un valore per continuare
                </p>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleSkip} 
                  className="flex-1" 
                  disabled={saving}
                >
                  Salta
                </Button>
                <Button 
                  onClick={handleComplete} 
                  className="flex-1"
                  disabled={saving || coreValues.length === 0}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Salvataggio..." : "Completa"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
