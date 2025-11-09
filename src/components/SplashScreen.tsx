import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";

interface SplashScreenProps {
  userName?: string;
  onComplete: () => void;
}

const SplashScreen = ({ userName, onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 200);
          return 100;
        }
        return prev + 20;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center z-50 animate-fade-in">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Briefcase className="h-12 w-12 text-white" />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto">
            <svg className="animate-spin" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeDasharray={`${progress * 2.83}, 283`}
                strokeLinecap="round"
                opacity="0.3"
              />
            </svg>
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Recruit Base</h1>
          {userName && (
            <p className="text-white/90 text-lg animate-fade-in">
              Benvenuto {userName} 👋
            </p>
          )}
          <p className="text-white/80 text-sm">Il tuo spazio si sta preparando...</p>
        </div>

        <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden mx-auto">
          <div 
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
