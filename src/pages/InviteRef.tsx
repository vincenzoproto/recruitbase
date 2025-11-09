import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Gift, Crown, Zap } from "lucide-react";

const InviteRef = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const refCode = searchParams.get("ref");
  const [ambassadorName, setAmbassadorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (refCode) {
      validateReferralCode(refCode);
    } else {
      setLoading(false);
    }
  }, [refCode]);

  const validateReferralCode = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("referral_code", code)
        .maybeSingle();

      if (error || !data) {
        setValid(false);
      } else {
        setValid(true);
        setAmbassadorName(data.full_name);
        localStorage.setItem("referral_code", code);
      }
    } catch (error) {
      console.error("Error validating referral code:", error);
      setValid(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-accent to-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-accent to-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-6 w-6 text-destructive" />
              Link non valido
            </CardTitle>
            <CardDescription>
              Il link di invito non è valido o è scaduto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Vai alla Registrazione
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent via-background to-accent p-4">
      <div className="container mx-auto max-w-4xl py-12">
        <Card className="border-none shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Gift className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Sei stato invitato! 🎉</h1>
                <p className="text-lg opacity-90">{ambassadorName} ti ha invitato su Recruit Base</p>
              </div>
            </div>
          </div>

          <CardContent className="p-8 space-y-6">
            <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                <Crown className="h-6 w-6 text-green-600" />
                Offerta Speciale Premium
              </h2>
              <p className="text-lg text-muted-foreground">
                Ottieni <strong className="text-foreground">30 giorni GRATIS</strong> di Recruit Base Premium!
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-xl">Cosa include Premium:</h3>
              <div className="grid gap-3">
                {[
                  "✅ Contatti illimitati con i candidati",
                  "✅ Ricerca avanzata con filtri personalizzati",
                  "✅ Visibilità prioritaria delle tue offerte",
                  "✅ Dashboard analytics e statistiche dettagliate",
                  "✅ Supporto prioritario via email",
                ].map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Zap className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-center">
                  <strong>Dopo i 30 giorni:</strong> solo 19€/mese • Cancella quando vuoi
                </p>
              </div>
              <Button size="lg" onClick={handleSignup} className="w-full h-14 text-lg font-bold">
                <Gift className="mr-2 h-5 w-5" />
                Inizia la Prova Gratuita
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Nessuna carta di credito richiesta per la prova gratuita
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>Unisciti a centinaia di recruiter e candidati su Recruit Base</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InviteRef;
