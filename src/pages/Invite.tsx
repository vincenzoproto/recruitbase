import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Sparkles, CheckCircle } from "lucide-react";

const Invite = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [ambassadorName, setAmbassadorName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    validateReferralCode();
  }, [code]);

  const validateReferralCode = async () => {
    if (!code) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("referral_code", code)
        .single();

      if (error || !data) {
        setValid(false);
      } else {
        setValid(true);
        setAmbassadorName(data.full_name);
        // Store referral code in localStorage for signup
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background p-4">
        <Card className="max-w-lg w-full shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Link non valido</CardTitle>
            <CardDescription>Il link di invito non è valido o è scaduto</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">Puoi comunque registrarti su Pausilio!</p>
            <Button onClick={() => navigate("/auth")} size="lg" className="w-full">
              Vai alla Registrazione
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-primary/20 animate-scale-in">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto shadow-lg">
            <Gift className="h-10 w-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl mb-2">Sei stato invitato su Pausilio! 🎉</CardTitle>
            <CardDescription className="text-lg">
              <strong className="text-primary">{ambassadorName}</strong> ti invita a provare la migliore piattaforma per recruiter
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg">Offerta Speciale per Te</h3>
                  <p className="text-muted-foreground">Ricevi 30 giorni di prova gratuita Premium!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h4 className="font-semibold text-lg mb-3">Con Premium ottieni:</h4>
            <div className="space-y-2">
              {[
                "✓ Contatti illimitati con i candidati",
                "✓ Ricerca avanzata con filtri personalizzati",
                "✓ Notifiche real-time sulle candidature",
                "✓ Statistiche avanzate e analytics",
                "✓ Supporto prioritario via email",
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <p className="font-medium">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="pt-6 text-center">
              <p className="text-lg mb-2">
                <span className="text-2xl font-bold text-green-600">19€/mese</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Solo dopo i 30 giorni di prova gratuita
              </p>
            </CardContent>
          </Card>

          <Button onClick={handleSignup} size="lg" className="w-full h-14 text-lg shadow-lg hover:scale-[1.02] transition-transform">
            Inizia la Prova Gratuita 🚀
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Registrandoti accetti i nostri termini di servizio e la privacy policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invite;
