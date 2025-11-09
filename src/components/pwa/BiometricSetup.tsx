import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Fingerprint, X, Check } from "lucide-react";
import { biometricAuth } from "@/lib/biometric-auth";
import { hapticFeedback } from "@/lib/haptics";
import { useToast } from "@/hooks/use-toast";

interface BiometricSetupProps {
  userId: string;
  userName: string;
  onComplete: () => void;
}

export const BiometricSetup = ({ userId, userName, onComplete }: BiometricSetupProps) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();

  const handleSetup = async () => {
    setIsRegistering(true);
    await hapticFeedback.medium();

    try {
      const available = await biometricAuth.isAvailable();
      
      if (!available) {
        toast({
          title: "Biometria non disponibile",
          description: "Il tuo dispositivo non supporta l'autenticazione biometrica",
          variant: "destructive"
        });
        onComplete();
        return;
      }

      const registered = await biometricAuth.register(userId, userName);

      if (registered) {
        await hapticFeedback.success();
        toast({
          title: "✓ Biometria attivata!",
          description: "Potrai accedere rapidamente con impronta o Face ID",
        });
        onComplete();
      } else {
        toast({
          title: "Configurazione non completata",
          description: "Potrai attivare la biometria più tardi dalle impostazioni",
        });
        onComplete();
      }
    } catch (error) {
      console.error('Biometric setup error:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la configurazione",
        variant: "destructive"
      });
      onComplete();
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSkip = async () => {
    await hapticFeedback.light();
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6 animate-slide-up">
        <div className="flex items-start justify-between">
          <div className="flex flex-col items-center justify-center w-full">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4">
              <Fingerprint className="h-10 w-10 text-white" />
            </div>
            <h3 className="font-semibold text-xl text-center mb-2">
              Attiva Login Biometrico
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Accedi rapidamente con Touch ID, Face ID o impronta digitale
            </p>
          </div>
        </div>

        <div className="space-y-3 bg-muted/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Login istantaneo</p>
              <p className="text-xs text-muted-foreground">
                Accedi in un tocco senza digitare password
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Massima sicurezza</p>
              <p className="text-xs text-muted-foreground">
                I tuoi dati biometrici restano sul dispositivo
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Fallback automatico</p>
              <p className="text-xs text-muted-foreground">
                Puoi sempre usare email e password
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleSetup}
            disabled={isRegistering}
            className="w-full gap-2"
            size="lg"
          >
            <Fingerprint className="h-5 w-5" />
            {isRegistering ? 'Configurazione...' : 'Attiva ora'}
          </Button>
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="w-full"
          >
            Più tardi
          </Button>
        </div>
      </Card>
    </div>
  );
};
