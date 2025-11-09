import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { useState } from "react";

interface PremiumBannerProps {
  onDismiss?: () => void;
}

const PremiumBanner = ({ onDismiss }: PremiumBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <Card className="border-none shadow-lg bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 text-white overflow-hidden relative animate-fade-in">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      <CardContent className="p-6 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 fill-current" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Hai raggiunto il limite gratuito</h3>
              <p className="text-white/95 font-medium">Attiva Premium per continuare – 30 giorni gratis!</p>
            </div>
          </div>
          <Button
            size="lg"
            variant="secondary"
            className="ml-auto h-12 px-8 font-bold shadow-lg hover:scale-105 transition-transform"
            onClick={() => window.open('https://buy.stripe.com/7sYfZh2br4aUfNW24GabK00', '_blank')}
          >
            Attiva Ora
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumBanner;
