import { BarChart3, MessageCircle, Kanban } from "lucide-react";
import { hapticFeedback } from "@/lib/haptics";

interface MiniNavbarProps {
  onNavigate: (section: "home" | "match" | "feed" | "trm" | "profile") => void;
  activeSection?: string;
}

export const MiniNavbar = ({ onNavigate, activeSection = "home" }: MiniNavbarProps) => {
  const items = [
    { id: "home", icon: BarChart3, label: "Dashboard" },
    { id: "match", icon: MessageCircle, label: "Chat" },
    { id: "trm", icon: Kanban, label: "TRM" },
  ];

  const handleClick = (id: string) => {
    hapticFeedback.light();
    onNavigate(id as "home" | "match" | "feed" | "trm" | "profile");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border safe-area-inset-top shadow-apple-sm">
      <div className="flex items-center justify-around h-14 max-w-screen-lg mx-auto px-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full gap-1 smooth-transition active:scale-95 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-6 w-6 smooth-transition ${isActive ? "scale-110" : ""}`} />
              <span className={`text-[10px] font-medium smooth-transition ${isActive ? "font-bold" : ""}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full animate-scale-in" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
