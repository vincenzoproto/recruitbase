import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Euro, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AmbassadorStats {
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
}

export const AmbassadorPanel = ({ userId }: { userId: string }) => {
  const [stats, setStats] = useState<AmbassadorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", userId)
        .single();

      const { data: referrals } = await supabase
        .from("ambassador_referrals")
        .select("*")
        .eq("ambassador_id", userId);

      const { data: earnings } = await supabase
        .from("ambassador_earnings")
        .select("*")
        .eq("ambassador_id", userId);

      setStats({
        referralCode: profile?.referral_code || "",
        totalReferrals: referrals?.length || 0,
        activeReferrals: referrals?.filter(r => r.status === "active").length || 0,
        totalEarnings: earnings?.filter(e => e.status === "paid").reduce((sum, e) => sum + e.amount, 0) || 0,
        pendingEarnings: earnings?.filter(e => e.status === "pending").reduce((sum, e) => sum + e.amount, 0) || 0,
      });
    } catch (error) {
      console.error("Error loading ambassador stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `https://recruitbase.app/invite/${stats?.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiato! Condividilo per guadagnare 10€ per ogni referral attivo");
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  return (
    <Card className="p-6 glass-card border-primary/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Programma Ambassador
        </h3>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          10€ per referral
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="p-4 bg-background/50">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Referral Totali</p>
              <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-background/50">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Referral Attivi</p>
              <p className="text-2xl font-bold text-green-500">{stats?.activeReferrals || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-background/50">
          <div className="flex items-center gap-3">
            <Euro className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Guadagni Totali</p>
              <p className="text-2xl font-bold">€{stats?.totalEarnings || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Il tuo link referral:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={`https://recruitbase.app/invite/${stats?.referralCode}`}
              readOnly
              className="flex-1 px-4 py-2 rounded-lg border bg-background/50 text-sm"
            />
            <Button onClick={copyReferralLink} size="sm" className="apple-button">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {stats && stats.pendingEarnings > 0 && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <p className="text-sm">
              <span className="font-semibold text-primary">€{stats.pendingEarnings}</span> in attesa di pagamento
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Verranno pagati dopo che i tuoi referral completano il primo pagamento
            </p>
          </Card>
        )}
      </div>
    </Card>
  );
};

const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364 6.364l-2.121-2.121M8.757 8.757L6.636 6.636m12.728 0l-2.121 2.121M8.757 15.243l-2.121 2.121" />
  </svg>
);
