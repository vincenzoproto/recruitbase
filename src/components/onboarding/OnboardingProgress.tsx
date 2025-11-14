import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action: () => void;
}

interface OnboardingProgressProps {
  profile: any;
  onRefresh?: () => void;
}

export const OnboardingProgress = ({ profile, onRefresh }: OnboardingProgressProps) => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    calculateSteps();
  }, [profile]);

  const calculateSteps = () => {
    const recruiterSteps: OnboardingStep[] = [
      {
        id: "avatar",
        title: "Carica foto profilo",
        description: "Aggiungi la tua foto",
        completed: !!profile.avatar_url,
        action: () => navigate("/profile"),
      },
      {
        id: "bio",
        title: "Aggiungi bio",
        description: "Scrivi una breve descrizione",
        completed: !!profile.bio && profile.bio.length > 10,
        action: () => navigate("/profile"),
      },
      {
        id: "company",
        title: "Info azienda",
        description: "Dimensione e settore",
        completed: !!profile.company_size && !!profile.industry,
        action: () => navigate("/profile"),
      },
      {
        id: "first_job",
        title: "Prima offerta",
        description: "Pubblica la tua prima offerta",
        completed: false, // Check from job_offers table
        action: () => navigate("/offers"),
      },
      {
        id: "values",
        title: "Valori aziendali",
        description: "Scegli i valori principali",
        completed: !!profile.core_values && profile.core_values.length >= 3,
        action: () => navigate("/profile"),
      },
    ];

    const candidateSteps: OnboardingStep[] = [
      {
        id: "avatar",
        title: "Carica foto profilo",
        description: "Aggiungi la tua foto",
        completed: !!profile.avatar_url,
        action: () => navigate("/profile"),
      },
      {
        id: "skills",
        title: "Aggiungi competenze",
        description: "Minimo 3 skills",
        completed: !!profile.skills && profile.skills.length >= 3,
        action: () => navigate("/profile"),
      },
      {
        id: "bio",
        title: "Aggiungi bio",
        description: "Scrivi una breve descrizione",
        completed: !!profile.bio && profile.bio.length > 10,
        action: () => navigate("/profile"),
      },
      {
        id: "cv",
        title: "Carica CV",
        description: "Aggiungi il tuo curriculum",
        completed: !!profile.cv_url,
        action: () => navigate("/profile"),
      },
      {
        id: "values",
        title: "Scegli valori",
        description: "Seleziona i tuoi valori",
        completed: !!profile.core_values && profile.core_values.length >= 3,
        action: () => navigate("/profile"),
      },
    ];

    const currentSteps = profile.role === "recruiter" ? recruiterSteps : candidateSteps;
    
    // Check job offers for recruiters
    if (profile.role === "recruiter") {
      checkFirstJob().then((hasJob) => {
        currentSteps[3].completed = hasJob;
        setSteps([...currentSteps]);
        calculateCompletion(currentSteps);
      });
    } else {
      setSteps(currentSteps);
      calculateCompletion(currentSteps);
    }
  };

  const checkFirstJob = async () => {
    try {
      const { data, error } = await supabase
        .from("job_offers")
        .select("id")
        .eq("recruiter_id", profile.id)
        .limit(1);

      return !error && data && data.length > 0;
    } catch (error) {
      return false;
    }
  };

  const calculateCompletion = (currentSteps: OnboardingStep[]) => {
    const completed = currentSteps.filter((s) => s.completed).length;
    const percentage = Math.round((completed / currentSteps.length) * 100);
    setCompletionPercentage(percentage);

    // Update onboarding_completed in profile if 100%
    if (percentage === 100 && !profile.onboarding_completed) {
      updateOnboardingStatus();
    }
  };

  const updateOnboardingStatus = async () => {
    try {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", profile.id);
      
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error updating onboarding status:", error);
    }
  };

  if (completionPercentage === 100) {
    return null; // Don't show if completed
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Completa il tuo profilo</CardTitle>
            <CardDescription>
              {completionPercentage}% completato
            </CardDescription>
          </div>
          <Badge variant={completionPercentage >= 80 ? "default" : "secondary"}>
            {steps.filter((s) => s.completed).length}/{steps.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={completionPercentage} className="h-2" />

        <div className="space-y-2">
          {steps.slice(0, 3).map((step) => (
            <button
              key={step.id}
              onClick={step.action}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              {step.completed ? (
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${step.completed ? "line-through text-muted-foreground" : ""}`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>

        {steps.length > 3 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => navigate("/profile")}
          >
            Mostra tutti i passaggi
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
