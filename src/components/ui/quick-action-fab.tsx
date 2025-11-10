import { useState } from "react";
import { Plus, UserPlus, Briefcase, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hapticFeedback } from "@/lib/haptics";

interface QuickActionFABProps {
  onAddCandidate?: () => void;
  onCreatePipeline?: () => void;
  onSendFollowUp?: () => void;
}

export const QuickActionFAB = ({
  onAddCandidate,
  onCreatePipeline,
  onSendFollowUp,
}: QuickActionFABProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    hapticFeedback.light();
    setIsOpen(!isOpen);
  };

  const handleAction = (action: () => void) => {
    hapticFeedback.medium();
    action();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40">
      {/* Action Buttons */}
      <div
        className={`flex flex-col-reverse gap-3 mb-3 transition-all duration-300 ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {onSendFollowUp && (
          <Button
            onClick={() => handleAction(onSendFollowUp)}
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg hover:scale-110 transition-transform bg-gradient-to-br from-purple-500 to-purple-600"
          >
            <Send className="h-5 w-5" />
          </Button>
        )}
        {onCreatePipeline && (
          <Button
            onClick={() => handleAction(onCreatePipeline)}
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg hover:scale-110 transition-transform bg-gradient-to-br from-blue-500 to-blue-600"
          >
            <Briefcase className="h-5 w-5" />
          </Button>
        )}
        {onAddCandidate && (
          <Button
            onClick={() => handleAction(onAddCandidate)}
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg hover:scale-110 transition-transform bg-gradient-to-br from-green-500 to-green-600"
          >
            <UserPlus className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Main FAB */}
      <Button
        onClick={toggleMenu}
        size="lg"
        className={`rounded-full h-16 w-16 shadow-xl hover:scale-110 transition-all bg-gradient-to-br from-primary to-primary/80 ${
          isOpen ? "rotate-45" : ""
        }`}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};
