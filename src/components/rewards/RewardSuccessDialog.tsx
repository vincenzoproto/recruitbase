import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles } from "lucide-react";

interface RewardSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rewardName: string;
  rewardIcon: string;
  rewardDescription: string;
  xpSpent: number;
}

export function RewardSuccessDialog({
  open,
  onOpenChange,
  rewardName,
  rewardIcon,
  rewardDescription,
  xpSpent,
}: RewardSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="text-6xl animate-bounce">{rewardIcon}</div>
              <CheckCircle2 className="absolute -bottom-1 -right-1 h-8 w-8 text-green-500 bg-background rounded-full" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Premio riscattato! 🎉
          </DialogTitle>
          <DialogDescription className="text-center space-y-2">
            <p className="font-semibold text-base text-foreground">
              {rewardName}
            </p>
            <p className="text-sm">{rewardDescription}</p>
            <div className="flex items-center justify-center gap-1.5 pt-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Hai speso <strong className="text-foreground">{xpSpent} XP</strong>
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Perfetto!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
