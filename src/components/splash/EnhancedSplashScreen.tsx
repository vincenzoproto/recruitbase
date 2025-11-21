import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";

export const EnhancedSplashScreen = () => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 transition-opacity duration-700 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative">
        <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full animate-pulse" />
        <div className="relative h-24 w-24 rounded-2xl bg-primary flex items-center justify-center shadow-2xl animate-scale-in">
          <Briefcase className="h-12 w-12 text-primary-foreground" />
        </div>
      </div>
      <h1 className="mt-6 text-3xl font-bold text-foreground animate-fade-in">
        Pausilio
      </h1>
      <p className="mt-2 text-sm text-muted-foreground animate-fade-in">
        La tua piattaforma HR premium
      </p>
    </div>
  );
};
