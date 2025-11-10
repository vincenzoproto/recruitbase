import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, TrendingUp, TrendingDown, Briefcase, Star, AlertCircle, Sparkles } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Progress } from "@/components/ui/progress";

interface PremiumCandidateDashboardProps {
  profile: any;
  onNavigate: (view: number) => void;
}

export const PremiumCandidateDashboard = ({ profile, onNavigate }: PremiumCandidateDashboardProps) => {
  const [stats, setStats] = useState({
    applications: 0,
    cultureFit: 0,
    feedbackAvg: 0,
    highFitOffers: 0,
    pendingApplications: 0
  });
  const [trsChange, setTrsChange] = useState(0);

  useEffect(() => {
    loadStats();
  }, [profile.id]);

  const loadStats = async () => {
    try {
      // Carica candidature
      const { data: apps } = await supabase
        .from("applications")
        .select("*")
        .eq("candidate_id", profile.id);

      // Calcola Culture Fit medio (simulato basandosi sui core_values)
      const cultureFit = profile.core_values?.length > 0 
        ? Math.min(profile.core_values.length * 20, 100) 
        : 0;

      // Simulazione TRS change (da sostituire con calcolo reale)
      const lastWeekTrs = profile.talent_relationship_score || 0;
      const change = Math.floor(Math.random() * 15) - 5; // -5 a +10

      setStats({
        applications: apps?.length || 0,
        cultureFit,
        feedbackAvg: 4.5, // Da implementare con recensioni reali
        highFitOffers: 0, // Da implementare con match >80%
        pendingApplications: apps?.filter(a => a.status === 'in_valutazione').length || 0
      });
      setTrsChange(change);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const getCultureFitColor = () => {
    if (stats.cultureFit >= 75) return "text-green-600";
    if (stats.cultureFit >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getCultureFitBg = () => {
    if (stats.cultureFit >= 75) return "bg-green-100 border-green-200";
    if (stats.cultureFit >= 50) return "bg-yellow-100 border-yellow-200";
    return "bg-red-100 border-red-200";
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Banner motivazionale dinamico */}
      {stats.highFitOffers > 0 && (
        <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  🔥 Ottimo! Hai {stats.highFitOffers} offerte compatibili con i tuoi valori.
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary"
                  onClick={() => onNavigate(2)}
                >
                  Visualizza offerte →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(!profile.city || !profile.job_title || !profile.skills?.length) && (
        <Card className="border-amber-500/50 bg-gradient-to-r from-amber-50 to-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  💡 Migliora il tuo TRS aggiornando il profilo
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-amber-600"
                  onClick={() => onNavigate(4)}
                >
                  Completa profilo →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* TRS personale */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              TRS Personale
              <InfoTooltip content="Talent Relationship Score: il tuo indice di affidabilità professionale. Cresce con interazioni, risposte rapide e feedback positivi." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-foreground">
                  {profile.talent_relationship_score || 0}
                </span>
                <Badge variant={trsChange >= 0 ? "default" : "destructive"} className="mb-1">
                  {trsChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {trsChange > 0 ? '+' : ''}{trsChange}%
                </Badge>
              </div>
              <Progress value={profile.talent_relationship_score || 0} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Ottimo lavoro! Continua a rispondere rapidamente ai recruiter.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Culture Fit */}
        <Card className={`hover:shadow-md transition-all ${getCultureFitBg()}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Culture Fit
              <InfoTooltip content="Compatibilità media con i valori delle aziende. Aggiorna i tuoi core values per migliorare il match." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-bold ${getCultureFitColor()}`}>
                  {stats.cultureFit}%
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    {stats.cultureFit >= 75 && <span className="text-2xl">🟢</span>}
                    {stats.cultureFit >= 50 && stats.cultureFit < 75 && <span className="text-2xl">🟡</span>}
                    {stats.cultureFit < 50 && <span className="text-2xl">🔴</span>}
                    <span className="text-xs font-medium text-muted-foreground">
                      {stats.cultureFit >= 75 ? "Eccellente" : stats.cultureFit >= 50 ? "Buono" : "Da migliorare"}
                    </span>
                  </div>
                </div>
              </div>
              <Progress value={stats.cultureFit} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Candidature attive */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Candidature Attive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{stats.applications}</span>
                <span className="text-sm text-muted-foreground">candidature totali</span>
              </div>
              {stats.pendingApplications > 0 && (
                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                  {stats.pendingApplications} in valutazione
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => onNavigate(2)}
              >
                Visualizza stato
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feedback ricevuti */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Feedback Ricevuti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= stats.feedbackAvg
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xl font-bold text-foreground">
                  {stats.feedbackAvg.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Media valutazioni dai recruiter
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
