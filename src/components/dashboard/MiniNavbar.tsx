import { BarChart3, MessageCircle, Kanban } from "lucide-react";
import { hapticFeedback } from "@/lib/haptics";

interface MiniNavbarProps {
  onNavigate: (section: "dashboard" | "chat" | "trm") => void;
  activeSection?: string;
}

export const MiniNavbar = ({ onNavigate, activeSection = "dashboard" }: MiniNavbarProps) => {
  const items = [
    { id: "dashboard", icon: BarChart3, label: "Dashboard" },
    { id: "chat", icon: MessageCircle, label: "Chat" },
    { id: "trm", icon: Kanban, label: "TRM" },
  ];

  const handleClick = (id: string) => {
    hapticFeedback.light();
    onNavigate(id as "dashboard" | "chat" | "trm");
  };

  return (
    <div className="flex items-center justify-center gap-2 my-6 animate-fade-in">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;

        return (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl smooth-transition apple-button ${
              isActive
                ? "bg-primary text-primary-foreground shadow-apple-sm"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? "scale-110" : ""} smooth-transition`} />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
