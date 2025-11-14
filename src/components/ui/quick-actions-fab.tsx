import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, UserPlus, FileText, X, Upload, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/haptics";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: "recruiter" | "candidate";
}

interface QuickActionsFABProps {
  actions: QuickAction[];
  userRole?: "recruiter" | "candidate";
}

export const QuickActionsFAB = ({ actions, userRole }: QuickActionsFABProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const filteredActions = actions.filter(
    action => !action.variant || action.variant === userRole
  );

  const toggleOpen = () => {
    hapticFeedback.light();
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
      {/* Action Buttons */}
      <div className={cn(
        "flex flex-col-reverse gap-2 mb-3 transition-all duration-300",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {filteredActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
                hapticFeedback.medium();
              }}
              size="lg"
              className="gap-2 shadow-lg animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{action.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Main FAB */}
      <Button
        onClick={toggleOpen}
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl transition-all duration-300",
          isOpen && "rotate-45"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
};

// Predefined action sets
export const recruiterActions: QuickAction[] = [
  {
    icon: Briefcase,
    label: "Nuova Offerta",
    onClick: () => window.dispatchEvent(new CustomEvent('openCreateJob')),
    variant: "recruiter"
  },
  {
    icon: UserPlus,
    label: "Cerca Candidato",
    onClick: () => window.location.href = "/search-profiles",
    variant: "recruiter"
  },
  {
    icon: FileText,
    label: "Nuovo Follow-up",
    onClick: () => window.dispatchEvent(new CustomEvent('openFollowUp')),
    variant: "recruiter"
  }
];

export const candidateActions: QuickAction[] = [
  {
    icon: Upload,
    label: "Carica CV",
    onClick: () => window.dispatchEvent(new CustomEvent('openCVUpload')),
    variant: "candidate"
  },
  {
    icon: FileText,
    label: "Aggiorna Profilo",
    onClick: () => window.location.href = "/profile",
    variant: "candidate"
  },
  {
    icon: Sparkles,
    label: "Suggerimenti AI",
    onClick: () => window.dispatchEvent(new CustomEvent('openAISuggest')),
    variant: "candidate"
  }
];
