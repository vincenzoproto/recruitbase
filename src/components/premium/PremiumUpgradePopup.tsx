import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Check, Sparkles } from "lucide-react";

interface PremiumUpgradePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: () => void;
}

export const PremiumUpgradePopup = ({ open, onOpenChange, onUpgrade }: PremiumUpgradePopupProps) => {
  const features = [
    "TRS™ in tempo reale con aggiornamenti continui",
    "AI Assistant per messaggi e follow-up automatici",
    "Statistiche avanzate e report personalizzati",
    "Pipeline illimitate e candidati senza limiti",
    "Supporto prioritario via chat e email",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">
            Sblocca il tuo vantaggio competitivo
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Provalo gratis 30 giorni. Cancella quando vuoi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-foreground">{feature}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 space-y-3">
            <Button onClick={onUpgrade} size="lg" className="w-full gap-2">
              <Sparkles className="h-4 w-4" />
              Inizia la prova gratuita
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Nessuna carta richiesta per i primi 30 giorni
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
