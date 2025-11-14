import { ReactNode } from "react";
import UnifiedTopBar from "@/components/navigation/UnifiedTopBar";
import MobileBottomTabs from "@/components/navigation/MobileBottomTabs";

interface LayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* TOP BAR UNIFICATA */}
      <UnifiedTopBar />

      {/* CONTENUTO - SEMPRE RENDERIZZA SUBITO */}
      <main className="flex-1 overflow-y-auto pt-14 pb-16">
        {/* Swipe semplice opzionale senza logica complessa */}
        <div className="flex overflow-x-auto snap-x snap-mandatory">
          {children}
        </div>
      </main>

      {/* TABS IN BASSO */}
      <MobileBottomTabs />
    </div>
  );
};

