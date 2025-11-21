import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingUp, Brain, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TRSInfoPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TRSInfoPopup = ({ open, onOpenChange }: TRSInfoPopupProps) => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    onOpenChange(false);
    navigate("/auth");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="h-6 w-6 text-primary" />
            Talent Relationship Score™
          </DialogTitle>
          <DialogDescription className="text-base">
            Il primo algoritmo proprietario per misurare la qualità delle relazioni professionali
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed">
              Il nostro <strong>Talent Relationship Score™</strong> misura la qualità delle relazioni 
              tra recruiter e candidati, analizzando <strong>frequenza</strong>, <strong>empatia</strong> e <strong>engagement reale</strong>.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
              <Brain className="h-8 w-8 text-primary" />
              <h4 className="font-semibold">AI Proprietaria</h4>
              <p className="text-sm text-muted-foreground">
                Algoritmo esclusivo che apprende dai tuoi pattern relazionali
              </p>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
              <Users className="h-8 w-8 text-primary" />
              <h4 className="font-semibold">Qualità vs Quantità</h4>
              <p className="text-sm text-muted-foreground">
                Non conta solo quanti contatti hai, ma quanto sono autentici
              </p>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
              <Zap className="h-8 w-8 text-primary" />
              <h4 className="font-semibold">Real-time</h4>
              <p className="text-sm text-muted-foreground">
                Aggiornamento continuo per decisioni sempre informate
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={handleGoToLogin} size="lg" className="w-full">
              Accedi a Pausilio TRM
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
