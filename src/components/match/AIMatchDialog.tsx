import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AIMatchView } from "./AIMatchView";

interface AIMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobOfferId: string;
  jobTitle: string;
}

export const AIMatchDialog = ({ open, onOpenChange, jobOfferId, jobTitle }: AIMatchDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <AIMatchView jobOfferId={jobOfferId} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};
