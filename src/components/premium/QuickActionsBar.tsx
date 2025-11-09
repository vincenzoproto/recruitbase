import { Button } from "@/components/ui/button";
import { Plus, MessageCircle, UserPlus } from "lucide-react";
import { hapticFeedback } from "@/lib/haptics";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface QuickActionsBarProps {
  onCreateJob?: () => void;
  onAIChat?: () => void;
  onInviteRecruiter?: () => void;
}

export const QuickActionsBar = ({ 
  onCreateJob, 
  onAIChat, 
  onInviteRecruiter 
}: QuickActionsBarProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleAction = async (action: () => void, message: string) => {
    await hapticFeedback.medium();
    if (action) {
      action();
    } else {
      toast({ title: message, description: "Funzionalità in arrivo!" });
    }
  };

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4">
      <div className="bg-card/95 backdrop-blur-xl border shadow-lg rounded-2xl p-3">
        <div className="flex items-center justify-around gap-2">
          <Button
            onClick={() => handleAction(onCreateJob!, "+ Annuncio")}
            size="sm"
            className="flex-1 gap-2"
            variant="default"
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs">Annuncio</span>
          </Button>

          <Button
            onClick={() => handleAction(onAIChat!, "💬 Messaggio AI")}
            size="sm"
            className="flex-1 gap-2"
            variant="secondary"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">AI Chat</span>
          </Button>

          <Button
            onClick={() => handleAction(onInviteRecruiter!, "🎯 Invita")}
            size="sm"
            className="flex-1 gap-2"
            variant="outline"
          >
            <UserPlus className="h-4 w-4" />
            <span className="text-xs">Invita</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
