import { NavLink } from "react-router-dom";
import { Home, Briefcase, Heart, MessageCircle, User } from "lucide-react";

const TABS = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Briefcase, label: "Offerte", path: "/offers" },
  { icon: Heart, label: "Feed", path: "/social" },
  { icon: MessageCircle, label: "Messaggi", path: "/messages" },
  { icon: User, label: "Profilo", path: "/profile" },
];

const MobileBottomTabs = () => {
  return (
    <nav className="h-16 bg-background border-t border-border flex items-center justify-around fixed bottom-0 left-0 right-0 z-40">
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
