import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Briefcase, Users, LogOut, Star, Gift, TrendingUp, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CreateJobDialog from "./CreateJobDialog";
import JobOfferCard from "./JobOfferCard";
import CandidateCard from "./CandidateCard";
import LinkedInIntegration from "../LinkedInIntegration";
import StatsCard from "./StatsCard";
import PremiumBadge from "@/components/PremiumBadge";
import AmbassadorSection from "@/components/ambassador/AmbassadorSection";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { MatchesList } from "@/components/match/MatchesList";
import { SearchFilters, SearchFilterValues } from "@/components/search/SearchFilters";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";

interface RecruiterDashboardProps {
  profile: any;
}

const RecruiterDashboard = ({ profile }: RecruiterDashboardProps) => {
  const navigate = useNavigate();
  const [jobOffers, setJobOffers] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showCandidates, setShowCandidates] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [filteredCandidates, setFilteredCandidates] = useState<any[]>([]);
  const [stats, setStats] = useState({
    jobOffersCount: 0,
    candidatesViewedCount: 0,
    referralsCount: 0,
  });
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  useEffect(() => {
    loadJobOffers();
    loadFavorites();
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (jobOffers.length > 0 || candidates.length > 0) {
      loadStats();
    }
  }, [jobOffers.length, candidates.length]);

  const loadStats = async () => {
    try {
      // Count referrals
      const { count: referralsCount } = await supabase
        .from("ambassador_referrals")
        .select("*", { count: "exact", head: true })
        .eq("ambassador_id", profile.id);

      setStats({
        jobOffersCount: jobOffers.length,
        candidatesViewedCount: candidates.length,
        referralsCount: referralsCount || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadJobOffers = async () => {
    // Carica solo i campi essenziali per performance
    const { data, error } = await supabase
      .from("job_offers")
      .select("id, title, city, sector, experience_level, is_active, created_at")
      .eq("recruiter_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20); // Limita inizialmente a 20 offerte

    if (error) {
      toast.error("Errore nel caricamento delle offerte");
      return;
    }
    setJobOffers(data || []);
  };

  const loadCandidates = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, city, job_title, skills, linkedin_url")
      .eq("role", "candidate")
      .limit(50);

    if (error) {
      toast.error("Errore nel caricamento dei candidati");
      return;
    }
    setCandidates(data || []);
    setFilteredCandidates(data || []);
  };

  const handleSearch = (query: string, filters: SearchFilterValues) => {
    let filtered = [...candidates];

    // Filter by query
    if (query) {
      filtered = filtered.filter(c =>
        c.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        c.job_title?.toLowerCase().includes(query.toLowerCase()) ||
        c.skills?.some((s: string) => s.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Filter by city
    if (filters.city) {
      filtered = filtered.filter(c => c.city === filters.city);
    }

    // Filter by skills
    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter(c =>
        c.skills?.some((s: string) =>
          filters.skills!.some(fs => s.toLowerCase().includes(fs.toLowerCase()))
        )
      );
    }

    setFilteredCandidates(filtered);
  };

  const loadAnalytics = async () => {
    try {
      // Generate mock analytics for last 7 days
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Get applications count for this date
        const { count: appCount } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .gte('applied_at', new Date(date.setHours(0, 0, 0, 0)).toISOString())
          .lte('applied_at', new Date(date.setHours(23, 59, 59, 999)).toISOString());

        // Get profile views count
        const { count: viewsCount } = await supabase
          .from('profile_views')
          .select('*', { count: 'exact', head: true })
          .eq('viewer_id', profile.id)
          .gte('created_at', new Date(date.setHours(0, 0, 0, 0)).toISOString())
          .lte('created_at', new Date(date.setHours(23, 59, 59, 999)).toISOString());

        data.push({
          date: date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
          applications: appCount || 0,
          views: viewsCount || 0,
          jobs: jobOffers.length,
        });
      }
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadFavorites = async () => {
    const { data, error } = await supabase
      .from("favorites")
      .select("*, candidate:profiles!favorites_candidate_id_fkey(*)")
      .eq("recruiter_id", profile.id);

    if (error) {
      toast.error("Errore nel caricamento dei preferiti");
      return;
    }
    setFavorites(data || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleToggleFavorite = async (candidateId: string) => {
    const isFavorite = favorites.some((f) => f.candidate_id === candidateId);

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("recruiter_id", profile.id)
        .eq("candidate_id", candidateId);

      if (error) {
        toast.error("Errore nella rimozione dai preferiti");
        return;
      }
      toast.success("Rimosso dai preferiti");
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({
          recruiter_id: profile.id,
          candidate_id: candidateId,
        });

      if (error) {
        toast.error("Errore nell'aggiunta ai preferiti");
        return;
      }
      toast.success("Aggiunto ai preferiti");
    }

    loadFavorites();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recruit Base</h1>
            <p className="text-sm text-muted-foreground">Dashboard Recruiter</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell userId={profile.id} />
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Esci
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card className="border-none shadow-md animate-fade-in bg-gradient-to-r from-card to-accent/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-3">
                  👋 Benvenuto, {profile.full_name}
                  <PremiumBadge isPremium={profile.is_premium} size="md" />
                </CardTitle>
                <CardDescription className="text-base">Gestisci le tue offerte di lavoro e trova i migliori candidati</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Offerte Pubblicate"
            value={stats.jobOffersCount}
            icon={Briefcase}
            subtitle="Offerte di lavoro attive"
            gradient="from-blue-500/10 to-blue-500/5"
          />
          <StatsCard
            title="Candidati Visti"
            value={stats.candidatesViewedCount}
            icon={UserCheck}
            subtitle="Profili visualizzati"
            gradient="from-green-500/10 to-green-500/5"
          />
          <StatsCard
            title="Referral Attivi"
            value={stats.referralsCount}
            icon={Gift}
            subtitle="Inviti inviati"
            gradient="from-purple-500/10 to-purple-500/5"
          />
        </div>

        <Card className="border-none shadow-lg bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground overflow-hidden relative animate-scale-in hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Star className="h-6 w-6 fill-current" />
                  </div>
                  <h3 className="text-2xl font-bold">Passa a Premium</h3>
                </div>
                <p className="text-primary-foreground/95 text-base font-medium">Sblocca tutte le funzionalità avanzate</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="px-3 py-1 bg-white/20 rounded-full">✓ 30 giorni gratis</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full">✓ Contatti illimitati</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full">✓ Ricerca avanzata</span>
                </div>
              </div>
              <Button 
                size="lg" 
                variant="secondary"
                className="h-12 px-8 font-bold shadow-lg hover:scale-105 transition-transform"
                onClick={() => window.open('https://buy.stripe.com/7sYfZh2br4aUfNW24GabK00', '_blank')}
              >
                Attiva Ora
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          <Button
            onClick={() => setShowCreateJob(true)}
            size="lg"
            className="h-28 flex flex-col items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] animate-fade-in"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Plus className="h-7 w-7" />
            </div>
            <span className="font-bold text-base">Nuova Offerta</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setShowCandidates(!showCandidates);
              if (!showCandidates) loadCandidates();
              setShowFavorites(false);
              setShowAnalytics(false);
            }}
            className="h-28 flex flex-col items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] hover:border-primary/50 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center">
              <div className="font-bold text-base">Cerca Candidati</div>
              {candidates.length > 0 && (
                <div className="text-xs text-muted-foreground mt-1">{candidates.length} disponibili</div>
              )}
            </div>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setShowFavorites(!showFavorites);
              setShowCandidates(false);
              setShowAnalytics(false);
            }}
            className="h-28 flex flex-col items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] hover:border-primary/50 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center">
              <div className="font-bold text-base">Preferiti</div>
              <div className="text-xs text-muted-foreground mt-1">{favorites.length} salvati</div>
            </div>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setShowAnalytics(!showAnalytics);
              setShowCandidates(false);
              setShowFavorites(false);
            }}
            className="h-28 flex flex-col items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] hover:border-primary/50 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center">
              <div className="font-bold text-base">Analytics</div>
              <div className="text-xs text-muted-foreground mt-1">Statistiche dettagliate</div>
            </div>
          </Button>
        </div>

        <MatchesList userId={profile.id} userRole="recruiter" />

        {showAnalytics && (
          <AnalyticsChart data={analyticsData} userRole="recruiter" />
        )}

        {showCandidates && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Candidati Disponibili
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SearchFilters userRole="recruiter" onSearch={handleSearch} />
              
              <div className="grid gap-4 md:grid-cols-2">
                {filteredCandidates.length === 0 ? (
                  <div className="col-span-2 text-center py-12 space-y-4 animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Users className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-foreground">Nessun candidato trovato</p>
                      <p className="text-sm text-muted-foreground">
                        {candidates.length === 0 
                          ? "I candidati appariranno qui quando si registreranno"
                          : "Prova a modificare i filtri di ricerca"}
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={favorites.some((f) => f.candidate_id === candidate.id)}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {showFavorites && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                I Tuoi Preferiti
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {favorites.length === 0 ? (
                <div className="col-span-2 text-center py-12 space-y-4 animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Star className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-foreground">Nessun preferito salvato</p>
                    <p className="text-sm text-muted-foreground">Clicca sulla stella per salvare i candidati che ti interessano</p>
                  </div>
                </div>
              ) : (
                favorites.map((fav) => (
                  <CandidateCard
                    key={fav.id}
                    candidate={fav.candidate}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={true}
                  />
                ))
              )}
            </CardContent>
          </Card>
        )}

        {profile.referral_code && (
          <AmbassadorSection userId={profile.id} referralCode={profile.referral_code} />
        )}

        <LinkedInIntegration />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Le Tue Offerte
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {jobOffers.length === 0 ? (
              <div className="col-span-2 text-center py-12 space-y-4 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Briefcase className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-foreground">Nessuna offerta pubblicata</p>
                  <p className="text-sm text-muted-foreground">Clicca su "Nuova Offerta" per iniziare a trovare candidati!</p>
                </div>
                <Button onClick={() => setShowCreateJob(true)} size="lg" className="mt-4">
                  <Plus className="mr-2 h-5 w-5" />
                  Crea la tua prima offerta
                </Button>
              </div>
            ) : (
              jobOffers.map((job) => (
                <JobOfferCard key={job.id} job={job} onUpdate={loadJobOffers} />
              ))
            )}
          </CardContent>
        </Card>
      </main>

      <CreateJobDialog
        open={showCreateJob}
        onOpenChange={setShowCreateJob}
        recruiterId={profile.id}
        onSuccess={loadJobOffers}
      />
    </div>
  );
};

export default RecruiterDashboard;
