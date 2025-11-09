import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Gift, Users, Euro, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AmbassadorSectionProps {
  userId: string;
  referralCode: string;
}

const AmbassadorSection = ({ userId, referralCode }: AmbassadorSectionProps) => {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  const inviteLink = `${window.location.origin}/invite?ref=${referralCode}`;

  useEffect(() => {
    // Carica in background per non bloccare il rendering
    const timer = setTimeout(() => {
      loadAmbassadorData();
    }, 500);
    return () => clearTimeout(timer);
  }, [userId]);

  const loadAmbassadorData = async () => {
    try {
      // Carica referrals solo se necessario (limita a 10 più recenti)
      const { data: referralData, error: refError } = await supabase
        .from("ambassador_referrals")
        .select("id, status, signup_date, referred_user_id")
        .eq("ambassador_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (refError) throw refError;
      setReferrals(referralData || []);

      // Carica earnings (solo campi essenziali)
      const { data: earningsData, error: earnError } = await supabase
        .from("ambassador_earnings")
        .select("amount, status")
        .eq("ambassador_id", userId);

      if (earnError) throw earnError;
      setEarnings(earningsData || []);

      // Calculate totals
      const total = earningsData?.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0) || 0;
      const pending = earningsData?.filter(e => e.status === "pending").reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0) || 0;
      
      setTotalEarnings(total);
      setPendingEarnings(pending);
    } catch (error) {
      console.error("Error loading ambassador data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Link copiato negli appunti!");
  };

  const requestPayment = async () => {
    if (pendingEarnings === 0) {
      toast.error("Non hai guadagni in sospeso da richiedere");
      return;
    }

    try {
      // Update all pending earnings to requested
      const { error } = await supabase
        .from("ambassador_earnings")
        .update({ payment_requested_at: new Date().toISOString() })
        .eq("ambassador_id", userId)
        .eq("status", "pending")
        .is("payment_requested_at", null);

      if (error) throw error;

      toast.success("Richiesta di pagamento inviata! Sarai contattato presto.");
      loadAmbassadorData();
    } catch (error) {
      console.error("Error requesting payment:", error);
      toast.error("Errore nell'invio della richiesta");
    }
  };

  const completedReferrals = referrals.filter(r => r.status === "completed" || r.status === "paid").length;

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-card via-card to-accent/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Gift className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Programma Ambassador 🎁</CardTitle>
            <CardDescription className="text-base">Guadagna 10€ per ogni recruiter Premium che inviti</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Inviti Premium</p>
                  <p className="text-2xl font-bold text-primary">{completedReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Euro className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Guadagni Totali</p>
                  <p className="text-2xl font-bold text-green-600">{totalEarnings.toFixed(2)}€</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Euro className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">In Sospeso</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingEarnings.toFixed(2)}€</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Il tuo link personale
              </p>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="font-mono text-sm" />
                <Button onClick={copyInviteLink} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={requestPayment} 
                disabled={pendingEarnings === 0}
                className="flex-1"
                size="lg"
              >
                <Euro className="mr-2 h-5 w-5" />
                Richiedi Pagamento
              </Button>
            </div>
          </CardContent>
        </Card>

        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Come funziona
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary">1.</span>
              <p>Condividi il tuo link personale con recruiter interessati</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary">2.</span>
              <p>I nuovi iscritti ottengono 30 giorni di prova gratuita Premium</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary">3.</span>
              <p>Dopo i 30 giorni, quando effettuano il primo pagamento (19€/mese), <strong>guadagni 10€</strong></p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary">4.</span>
              <p>Richiedi il pagamento quando vuoi dal tuo dashboard</p>
            </div>
          </div>
        </div>

        {referrals.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">I tuoi inviti recenti</h3>
            <div className="space-y-2">
              {referrals.slice(0, 5).map((ref) => (
                <div key={ref.id} className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                  <div>
                    <p className="font-medium">Recruiter Invitato</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ref.signup_date).toLocaleDateString("it-IT")}
                    </p>
                  </div>
                  <Badge variant={ref.status === "completed" ? "default" : ref.status === "paid" ? "secondary" : "outline"}>
                    {ref.status === "completed" ? "Completato" : ref.status === "paid" ? "Pagato" : "In prova"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AmbassadorSection;
