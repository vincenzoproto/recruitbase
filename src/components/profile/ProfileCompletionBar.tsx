import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompletionItem {
  label: string;
  completed: boolean;
}

interface ProfileCompletionBarProps {
  percentage: number;
  items: CompletionItem[];
  onOpenWizard: () => void;
}

export const ProfileCompletionBar = ({ percentage, items, onOpenWizard }: ProfileCompletionBarProps) => {
  const isComplete = percentage === 100;

  return (
    <Card className={isComplete ? "border-primary bg-primary/5" : ""}>
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">Completamento Profilo</h3>
            <p className="text-sm text-muted-foreground">
              {isComplete 
                ? "✅ Profilo completato — il tuo Ranking AI è ottimizzato!" 
                : "Completa il tuo profilo per aumentare la visibilità"}
            </p>
          </div>
          <div className="text-2xl font-bold text-primary">{percentage}%</div>
        </div>

        <Progress value={percentage} className="h-3" />

        {!isComplete && (
          <>
            <div className="space-y-2">
              {items.filter(item => !item.completed).slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Circle className="h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg space-y-1 text-sm">
              <p className="flex items-center gap-2">
                ⭐ <span>Aggiungere competenze aumenta la precisione del matching</span>
              </p>
              <p className="flex items-center gap-2">
                ⭐ <span>Un profilo completo ottiene il 40% in più di visibilità</span>
              </p>
            </div>

            <Button onClick={onOpenWizard} className="w-full">
              Completa il tuo profilo
            </Button>
          </>
        )}

        {isComplete && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Ottimo lavoro! Il tuo profilo è completo.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
