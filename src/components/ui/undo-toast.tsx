import { toast } from "sonner";
import { Button } from "./button";
import { Undo } from "lucide-react";

interface UndoToastOptions {
  message: string;
  onUndo: () => void;
  duration?: number;
}

export const showUndoToast = ({ message, onUndo, duration = 5000 }: UndoToastOptions) => {
  toast(message, {
    duration,
    action: (
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          onUndo();
          toast.dismiss();
        }}
        className="gap-2"
      >
        <Undo className="h-4 w-4" />
        Annulla
      </Button>
    ),
  });
};
