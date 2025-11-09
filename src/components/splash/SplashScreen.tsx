import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 5;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background animate-fade-in">
      <div className="text-center space-y-8 px-6">
        <div className="animate-scale-in">
          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="text-4xl font-bold text-primary">RB</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Recruit Base</h1>
          <p className="text-muted-foreground mt-2">
            Connessione dei talenti in corso...
          </p>
        </div>
        
        <div className="w-64 mx-auto">
          <Progress value={progress} className="h-1" />
        </div>
      </div>
    </div>
  );
};
