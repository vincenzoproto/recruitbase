import { ReactNode } from "react";
import GlobalTopBar from "@/components/navigation/GlobalTopBar";
import MobileBottomTabs from "@/components/navigation/MobileBottomTabs";

interface LayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* TOP BAR GLOBALE */}
      <GlobalTopBar />

      {/* CONTENUTO */}
      <main className="flex-1 overflow-y-auto pt-14 pb-16">
        {children}
      </main>

      {/* TABS IN BASSO */}
      <MobileBottomTabs />
    </div>
  );
};

