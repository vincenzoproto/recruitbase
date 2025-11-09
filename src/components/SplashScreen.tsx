import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";

interface SplashScreenProps {
  userName?: string;
  onComplete: () => void;
}

const SplashScreen = ({ userName, onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setFadeOut(true);
          setTimeout(onComplete, 600);
          return 100;
        }
        return prev + 15;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90 flex items-center justify-center z-50 transition-all duration-600 ${
        fadeOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-fade-in'
      }`}
    >
      <div className="text-center space-y-8 px-6">
        {/* Logo with Glow Effect */}
        <div className="relative">
          <div className="w-28 h-28 glass-card rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(255,255,255,0.3)] animate-bounce-soft">
            <Briefcase className="h-14 w-14 text-white" strokeWidth={1.5} />
          </div>
        </div>
        
        {/* Brand & Welcome Message */}
        <div className="space-y-3 animate-fade-in">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Recruit Base
          </h1>
          {userName ? (
            <p className="text-white/90 text-xl font-medium animate-slide-up">
              Bentornato, {userName} 👋
            </p>
          ) : (
            <p className="text-white/85 text-lg font-light animate-slide-up">
              Crea la tua connessione perfetta<br />tra talento e opportunità ✨
            </p>
          )}
        </div>

        {/* Progress Bar with Shimmer Effect */}
        <div className="w-64 h-1.5 bg-white/20 rounded-full overflow-hidden mx-auto backdrop-blur-sm">
          <div 
            className="h-full bg-white rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(255,255,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Text */}
        <p className="text-white/70 text-sm font-light tracking-wide animate-pulse">
          Preparazione in corso...
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
