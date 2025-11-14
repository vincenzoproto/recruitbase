import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import UnifiedTopBar from "@/components/navigation/UnifiedTopBar";
import MobileBottomTabs from "@/components/navigation/MobileBottomTabs";
import SwipeNavigator from "@/components/navigation/SwipeNavigator";

interface LayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: LayoutProps) => {
  const location = useLocation();

  // Se cambiano le tab sotto, cambiano anche le swipe pages in automatico
  const PAGES_ORDER = [
    "/dashboard",
    "/offers",
    "/social",
    "/messages",
    "/profile",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* TOP BAR UNIFICATA */}
      <UnifiedTopBar />

      {/* CONTENUTO + SWIPE */}
      <div className="flex-1 overflow-hidden pt-14 pb-16">
        <SwipeNavigator
          activePath={location.pathname}
          pages={PAGES_ORDER}
        >
          {children}
        </SwipeNavigator>
      </div>

      {/* TABS IN BASSO */}
      <MobileBottomTabs />
    </div>
  );
};
