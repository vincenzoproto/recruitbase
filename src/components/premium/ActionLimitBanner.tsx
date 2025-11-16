import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Crown } from "lucide-react";
import { useActionLimits } from "@/hooks/useActionLimits";
import { useNavigate } from "react-router-dom";

interface ActionLimitBannerProps {
  userId: string;
}

export const ActionLimitBanner = ({ userId }: ActionLimitBannerProps) => {
  const navigate = useNavigate();
  const { getRemainingActions, isPremium, isAdmin, loading } = useActionLimits(userId);

  if (loading || isPremium || isAdmin) return null;

  const remaining = getRemainingActions();
  const percentage = (remaining / 10) * 100;

  if (remaining > 3) return null;

  return (
    <Alert className="border-warning bg-warning/5 mb-4">
      <AlertCircle className="h-4 w-4 text-warning" />
      <AlertDescription>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {remaining === 0 
                ? "Limite azioni gratuite raggiunto" 
                : `${remaining} azioni gratuite rimaste oggi`}
            </p>
            <Button 
              size="sm" 
              variant="default" 
              onClick={() => navigate("/settings")}
              className="gap-2"
            >
              <Crown className="h-3 w-3" />
              Passa a Premium
            </Button>
          </div>
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Gli utenti Premium hanno azioni illimitate
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};
