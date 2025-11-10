import { Heart, MessageCircle, LayoutDashboard, User } from "lucide-react";
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

  const recruiterTabs = [
    { id: "home", icon: LayoutDashboard, label: "Home" },
    { id: "matches", icon: Heart, label: "Match" },
    { id: "pipeline", icon: MessageCircle, label: "TRM" },
    { id: "profile", icon: User, label: "Profilo" },
  ];

  const candidateTabs = [
    { id: "home", icon: LayoutDashboard, label: "Home" },
    { id: "matches", icon: Heart, label: "Match" },
    { id: "offers", icon: MessageCircle, label: "Offerte" },
    { id: "profile", icon: User, label: "Profilo" },
  ];

  const navItems = userRole === "recruiter" ? recruiterTabs : candidateTabs;

  const handleTabChange = (tabId: string) => {
    hapticFeedback.light();
    onTabChange(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-screen-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`relative transition-transform ${isActive ? "scale-110" : ""}`}>
                <Icon className="h-6 w-6" />
                {(item.id === "pipeline" || item.label === "TRM") && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
