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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KanbanBoard from "../trm/KanbanBoard";
import { PremiumButton } from "../premium/PremiumButton";

interface RecruiterDashboardProps {
  profile: any;
}

const RecruiterDashboard = ({ profile }: RecruiterDashboardProps) => {
  const navigate = useNavigate();
  const [jobOffers, setJobOffers] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [showCreateJob, setShowCreateJob] = useState(false);
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
    const { data, error } = await supabase
      .from("job_offers")
      .select("id, title, city, sector, experience_level, is_active, created_at")
      .eq("recruiter_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);

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

    if (query) {
      filtered = filtered.filter(c =>
        c.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        c.job_title?.toLowerCase().includes(query.toLowerCase()) ||
        c.skills?.some((s: string) => s.toLowerCase().includes(query.toLowerCase()))
      );
    }

    if (filters.city) {
      filtered = filtered.filter(c => c.city === filters.city);
    }

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
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const { count: appCount } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .gte('applied_at', new Date(date.setHours(0, 0, 0, 0)).toISOString())
          .lte('applied_at', new Date(date.setHours(23, 59, 59, 999)).toISOString());

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
          <div className="flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Recruit Base TRM</h1>
              <p className="text-sm text-muted-foreground">
                {profile.full_name} - Talent Relationship Manager
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell userId={profile.id} />
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Esci
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Non gestire candidati. Coltiva relazioni.
              </h2>
              <p className="text-muted-foreground">
                Trasforma il recruiting in un'esperienza fluida e relazionale con AI e automazioni.
              </p>
            </div>
            <PremiumButton />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Offerte Attive"
            value={jobOffers.length}
            icon={Briefcase}
            subtitle="Offerte di lavoro attive"
            gradient="from-blue-500/10 to-blue-500/5"
          />
          <StatsCard
            title="Candidati Visualizzati"
            value={stats.candidatesViewedCount}
            icon={UserCheck}
            subtitle="Profili visualizzati"
            gradient="from-green-500/10 to-green-500/5"
          />
          <StatsCard
            title="Referral"
            value={stats.referralsCount}
            icon={Gift}
            subtitle="Inviti inviati"
            gradient="from-purple-500/10 to-purple-500/5"
          />
        </div>

        <Tabs defaultValue="pipeline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="pipeline">Pipeline Kanban</TabsTrigger>
            <TabsTrigger value="offers">Offerte</TabsTrigger>
            <TabsTrigger value="candidates">Candidati</TabsTrigger>
            <TabsTrigger value="favorites">Preferiti</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="matches">Match AI</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Pipeline Kanban - Vista Completa
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Trascina i candidati tra le fasi per aggiornare il loro stato
                </p>
              </CardHeader>
              <CardContent>
                <KanbanBoard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Le Tue Offerte</h2>
                <Button onClick={() => setShowCreateJob(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuova Offerta
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {jobOffers.map((offer) => (
                  <JobOfferCard
                    key={offer.id}
                    job={offer}
                    onUpdate={loadJobOffers}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Candidati Disponibili
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidates.length === 0 && (
                  <Button onClick={loadCandidates} variant="outline" className="w-full">
                    Carica Candidati
                  </Button>
                )}
                {candidates.length > 0 && (
                  <>
                    <SearchFilters userRole="recruiter" onSearch={handleSearch} />
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      {filteredCandidates.length === 0 ? (
                        <div className="col-span-2 text-center py-12">
                          <p className="text-muted-foreground">
                            {candidates.length === 0 
                              ? "I candidati appariranno qui quando si registreranno"
                              : "Nessun candidato trovato con questi filtri"}
                          </p>
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
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  I Tuoi Preferiti
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {favorites.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-muted-foreground">
                      Nessun preferito salvato. Clicca sulla stella per salvare i candidati.
                    </p>
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
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsChart data={analyticsData} userRole="recruiter" />
          </TabsContent>

          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle>Match AI Intelligenti</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Candidati suggeriti automaticamente in base alle tue offerte
                </p>
              </CardHeader>
              <CardContent>
                <MatchesList userId={profile.id} userRole="recruiter" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {profile.referral_code && (
          <AmbassadorSection
            referralCode={profile.referral_code}
            userId={profile.id}
          />
        )}

        <LinkedInIntegration />
      </main>

      {showCreateJob && (
        <CreateJobDialog
          open={showCreateJob}
          onOpenChange={setShowCreateJob}
          recruiterId={profile.id}
          onSuccess={loadJobOffers}
        />
      )}
    </div>
  );
};

export default RecruiterDashboard;
