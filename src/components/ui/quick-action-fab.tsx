import { useState } from "react";
import { Plus, UserPlus, Kanban, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hapticFeedback } from "@/lib/haptics";

interface QuickActionFABProps {
  onAddCandidate?: () => void;
  onAddPipeline?: () => void;
  onAIFollowup?: () => void;
}

export const QuickActionFAB = ({
  onAddCandidate,
  onAddPipeline,
  onAIFollowup,
}: QuickActionFABProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: UserPlus,
      label: "+ Candidato",
      onClick: onAddCandidate,
      color: "bg-primary hover:bg-primary/90",
    },
    {
      icon: Kanban,
      label: "+ Pipeline",
      onClick: onAddPipeline,
      color: "bg-success hover:bg-success/90",
    },
    {
      icon: Zap,
      label: "Follow-up AI",
      onClick: onAIFollowup,
      color: "bg-warning hover:bg-warning/90",
    },
  ];

  const handleToggle = () => {
    hapticFeedback.medium();
    setIsOpen(!isOpen);
  };

  const handleAction = (action: () => void | undefined) => {
    if (action) {
      hapticFeedback.light();
      action();
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {/* Overlay quando aperto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Azioni */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 animate-slide-up">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => handleAction(action.onClick)}
                className={`${action.color} text-white px-4 py-3 rounded-xl shadow-apple-lg flex items-center gap-3 apple-button whitespace-nowrap`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-semibold">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Pulsante principale */}
      <Button
        size="lg"
        className={`h-14 w-14 rounded-full shadow-apple-lg apple-button ${
          isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
        }`}
        onClick={handleToggle}
      >
        {isOpen ? (
          <X className="h-6 w-6 animate-spin" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};
