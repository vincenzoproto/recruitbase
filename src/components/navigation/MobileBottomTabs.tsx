import { NavLink } from "react-router-dom";
import { Home, Briefcase, Rss, MessageCircle, Sparkles } from "lucide-react";

const TABS = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Briefcase, label: "Offerte", path: "/offers" },
  { icon: Rss, label: "Feed", path: "/feed" },
  { icon: MessageCircle, label: "Messaggi", path: "/messages" },
  { icon: Sparkles, label: "Copilot", path: "/copilot" },
];

const MobileBottomTabs = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex items-center justify-around z-40">
      {TABS.map(tab => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center text-xs gap-1 transition-colors ${
                isActive ? "text-primary font-semibold" : "text-muted-foreground"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileBottomTabs;
