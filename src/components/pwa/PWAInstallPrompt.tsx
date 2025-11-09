import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { pwaInstall } from "@/lib/pwa-install";
import { hapticFeedback } from "@/lib/haptics";

export const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Show prompt only if can install and not already shown
    const hasSeenPrompt = localStorage.getItem('pwa_install_prompted');
    const canInstall = pwaInstall.canInstall();
    
    if (canInstall && !hasSeenPrompt) {
      // Wait a bit after login to show
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }
  }, []);

  const handleInstall = async () => {
    await hapticFeedback.medium();
    const installed = await pwaInstall.showPrompt();
    if (installed) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = async () => {
    await hapticFeedback.light();
    setShowPrompt(false);
    localStorage.setItem('pwa_install_prompted', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4 animate-slide-up">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Installa Recruit Base</h3>
              <p className="text-sm text-muted-foreground">
                Accesso rapido dalla schermata Home
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
            <p className="text-sm text-muted-foreground">
              Avvio istantaneo senza browser
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
            <p className="text-sm text-muted-foreground">
              Funziona offline
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
            <p className="text-sm text-muted-foreground">
              Login biometrico rapido
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1"
          >
            Più tardi
          </Button>
          <Button
            onClick={handleInstall}
            className="flex-1 gap-2"
          >
            <Download className="h-4 w-4" />
            Installa ora
          </Button>
        </div>
      </Card>
    </div>
  );
};
