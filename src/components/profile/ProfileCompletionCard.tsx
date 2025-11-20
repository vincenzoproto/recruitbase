import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { useState } from "react";
import { CompleteProfileWizard } from "./CompleteProfileWizard";

interface ProfileCompletionCardProps {
  userId: string;
}

export const ProfileCompletionCard = ({ userId }: ProfileCompletionCardProps) => {
  const { percentage, items, loading, refresh } = useProfileCompletion(userId);
  const [wizardOpen, setWizardOpen] = useState(false);

  if (loading) return null;

  const incompleteItems = items.filter(item => !item.completed);
  const isComplete = percentage === 100;

  return (
    <>
      <Card className={isComplete ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : "border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Completamento Profilo</CardTitle>
            <div className="text-2xl font-bold">{percentage}%</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={percentage} className="h-2" />
          
          {isComplete ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Profilo completo!</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">
                  Completa le sezioni mancanti per migliorare il matching
                </span>
              </div>
              
              <div className="space-y-2">
                {incompleteItems.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Circle className="h-4 w-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => setWizardOpen(true)}
                className="w-full"
                size="sm"
              >
                Completa il profilo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CompleteProfileWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        userId={userId}
        onComplete={refresh}
      />
    </>
  );
};
