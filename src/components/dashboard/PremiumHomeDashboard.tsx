import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Briefcase, Plus, Users, Send, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RecruiterPoints } from "@/components/gamification/RecruiterPoints";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface PremiumHomeDashboardProps {
  userId: string;
  onNavigate: (view: string) => void;
}

interface SmartBanner {
  type: "candidates" | "followups" | "trs_drop";
  message: string;
  action?: () => void;
  actionLabel?: string;
}

export const PremiumHomeDashboard = ({ userId, onNavigate }: PremiumHomeDashboardProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeOffers: 0,
    avgTRS: 0,
    trsChange: 0,
    monthlyContacts: 0,
    pendingFollowups: 0,
    highCultureFitCandidates: 0,
  });
  const [banner, setBanner] = useState<SmartBanner | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      // Load job offers
      const { data: offers } = await supabase
        .from("job_offers")
        .select("id")
        .eq("recruiter_id", userId)
        .eq("is_active", true);

      // Load TRS data
      const { data: interactions } = await supabase
        .from("interactions")
        .select("candidate_id, created_at")
        .eq("recruiter_id", userId)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { data: profiles } = await supabase
        .from("profiles")
        .select("talent_relationship_score, core_values")
        .eq("role", "candidate")
        .not("talent_relationship_score", "is", null);

      // Get recruiter values for culture fit
      const { data: recruiterProfile } = await supabase
        .from("profiles")
        .select("core_values")
        .eq("id", userId)
        .single();

      const avgTRS = profiles && profiles.length > 0
        ? profiles.reduce((sum, p) => sum + (p.talent_relationship_score || 0), 0) / profiles.length
        : 0;

      // Calculate high culture fit candidates (>80%)
      let highCultureFitCount = 0;
      if (recruiterProfile?.core_values && Array.isArray(recruiterProfile.core_values)) {
        highCultureFitCount = profiles?.filter(p => {
          if (!p.core_values || !Array.isArray(p.core_values)) return false;
          const matchCount = p.core_values.filter(v => 
            recruiterProfile.core_values.includes(v)
          ).length;
          const cultureFit = (matchCount / recruiterProfile.core_values.length) * 100;
          return cultureFit > 80;
        }).length || 0;
      }

      // Mock TRS change for now (replace with actual historical data)
      const trsChange = Math.random() > 0.5 ? Math.floor(Math.random() * 10) : -Math.floor(Math.random() * 5);

      setStats({
        activeOffers: offers?.length || 0,
        avgTRS: Math.round(avgTRS),
        trsChange,
        monthlyContacts: interactions?.length || 0,
        pendingFollowups: Math.floor(Math.random() * 5), // Mock data
        highCultureFitCandidates: highCultureFitCount,
      });

      // Determine smart banner
      if (highCultureFitCount >= 3) {
        setBanner({
          type: "candidates",
          message: `Hai ${highCultureFitCount} nuovi candidati con Culture Fit >80%`,
          action: () => onNavigate("match"),
          actionLabel: "Vedi candidati",
        });
      } else if (stats.pendingFollowups > 0) {
        setBanner({
          type: "followups",
          message: `Hai ${stats.pendingFollowups} follow-up in sospeso oggi`,
          action: () => onNavigate("pipeline"),
          actionLabel: "Gestisci",
        });
      } else if (trsChange < -3) {
        setBanner({
          type: "trs_drop",
          message: `Il tuo TRS è calato del ${Math.abs(trsChange)}% questa settimana`,
          action: () => navigate("/score-info"),
          actionLabel: "Scopri come migliorare",
        });
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Errore nel caricamento dei dati");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 animate-fade-in">
      {/* Smart Banner */}
      {banner && (
        <Card className="border-primary/20 bg-primary/5 animate-slide-in-top">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-sm font-medium">{banner.message}</p>
              </div>
              {banner.action && (
                <Button size="sm" onClick={banner.action} className="flex-shrink-0">
                  {banner.actionLabel}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main 4 Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Block 1: Recruiter Points/Score */}
        <div className="animate-scale-in">
          <RecruiterPoints userId={userId} />
        </div>

        {/* Block 2: Active Offers */}
        <Card className="hover-scale transition-all duration-200 shadow-sm hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">Offerte Attive</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold">{stats.activeOffers}</p>
                <p className="text-sm text-muted-foreground">posizioni aperte</p>
              </div>
              <Button 
                onClick={() => onNavigate("offers")} 
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuova offerta
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Block 3: TRS Medio */}
        <Card className="hover-scale transition-all duration-200 shadow-sm hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">TRS Medio</CardTitle>
                <InfoTooltip 
                  content="Talent Relationship Score medio dei tuoi candidati. Più alto è meglio!"
                  side="top"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold">{stats.avgTRS}</p>
                <Badge 
                  variant={stats.trsChange >= 0 ? "default" : "destructive"}
                  className="gap-1"
                >
                  {stats.trsChange >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stats.trsChange >= 0 ? "+" : ""}{stats.trsChange}%
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Trend settimanale</span>
                  <span>{stats.avgTRS}/100</span>
                </div>
                <Progress value={stats.avgTRS} className="h-2" />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate("/score-info")}
              >
                📈 Approfondisci performance
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Block 4: Contatti Mese */}
        <Card className="hover-scale transition-all duration-200 shadow-sm hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">Contatti Mese</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold">{stats.monthlyContacts}</p>
                <p className="text-sm text-muted-foreground">interazioni</p>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Follow-up attivi</span>
                  <span className="font-medium">{stats.pendingFollowups}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => onNavigate("pipeline")}
              >
                <Send className="h-4 w-4 mr-2" />
                Gestisci contatti
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
