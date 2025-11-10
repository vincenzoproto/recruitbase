import { Heart, MessageCircle, LayoutDashboard, User, Briefcase, Kanban, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { hapticFeedback } from "@/lib/haptics";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole?: "recruiter" | "candidate";
  unreadCount?: number;
}

export const MobileBottomNav = ({ 
  activeTab, 
  onTabChange, 
  userRole = "recruiter",
  unreadCount = 0 
}: MobileBottomNavProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  // Navbar specifica per ruolo
  const recruiterItems = [
    { id: "home", icon: LayoutDashboard, label: "Home" },
    { id: "match", icon: Heart, label: "Match" },
    { id: "feed", icon: Users, label: "Feed" },
    { id: "trm", icon: Kanban, label: "TRM" },
    { id: "profile", icon: User, label: "Profilo" },
  ];

  const candidateItems = [
    { id: "home", icon: LayoutDashboard, label: "Home" },
    { id: "offers", icon: Briefcase, label: "Offerte" },
    { id: "feed", icon: Heart, label: "Feed" },
    { id: "carriera", icon: Kanban, label: "Carriera" },
    { id: "profile", icon: User, label: "Profilo" },
  ];

  const navItems = userRole === "recruiter" ? recruiterItems : candidateItems;

  const handleTabChange = (tabId: string) => {
    hapticFeedback.light();
    onTabChange(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 safe-area-inset-bottom shadow-apple-md">
      <div className="flex items-center justify-around h-16 max-w-screen-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const showBadge = (item.id === "trm" || item.id === "carriera" || item.id === "messages") && unreadCount > 0;
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full gap-1 smooth-transition ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`relative smooth-transition ${isActive ? "scale-110 -translate-y-0.5" : ""}`}>
                <Icon className="h-6 w-6" />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce-soft">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
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
    </nav>
  );
};
