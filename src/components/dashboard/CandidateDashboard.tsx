import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, LogOut, User, CheckCircle, Clock, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import EditProfileDialog from "./EditProfileDialog";
import JobOfferCard from "./JobOfferCard";
import { Badge } from "@/components/ui/badge";
import AmbassadorSection from "@/components/ambassador/AmbassadorSection";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { MatchesList } from "@/components/match/MatchesList";
import { SearchFilters, SearchFilterValues } from "@/components/search/SearchFilters";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipe } from "@/hooks/use-swipe";
import { CVUploader } from "@/components/candidate/CVUploader";

interface CandidateDashboardProps {
  profile: any;
}

const CandidateDashboard = ({ profile }: CandidateDashboardProps) => {
  const navigate = useNavigate();
  const [jobOffers, setJobOffers] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const isMobile = useIsMobile();
  const [currentView, setCurrentView] = useState(0); // 0: Home, 1: Offerte, 2: Profilo
  const views = [
    { id: 0, name: "Home", icon: "🏠" },
    { id: 1, name: "Offerte", icon: "💼" },
    { id: 2, name: "Profilo", icon: "👤" },
  ];

  useEffect(() => {
    loadJobOffers();
    loadApplications();
  }, []);

  const loadJobOffers = async () => {
    const { data, error } = await supabase
      .from("job_offers")
      .select("id, title, city, sector, experience_level, description, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      toast.error("Errore nel caricamento delle offerte");
      return;
    }
    setJobOffers(data || []);
    setFilteredJobs(data || []);
  };

  const handleSearch = (query: string, filters: SearchFilterValues) => {
    let filtered = [...jobOffers];

    // Filter by query
    if (query) {
      filtered = filtered.filter(j =>
        j.title?.toLowerCase().includes(query.toLowerCase()) ||
        j.description?.toLowerCase().includes(query.toLowerCase()) ||
        j.sector?.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by city
    if (filters.city) {
      filtered = filtered.filter(j => j.city === filters.city);
    }

    // Filter by sector
    if (filters.sector) {
      filtered = filtered.filter(j => j.sector === filters.sector);
    }

    // Filter by experience level
    if (filters.experienceLevel) {
      filtered = filtered.filter(j => j.experience_level === filters.experienceLevel);
    }

    setFilteredJobs(filtered);
  };

  const loadApplications = async () => {
    const { data, error } = await supabase
      .from("applications")
      .select("job_offer_id")
      .eq("candidate_id", profile.id);

    if (error) {
      toast.error("Errore nel caricamento delle candidature");
      return;
    }
    setApplications(data || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleApply = async (jobOfferId: string) => {
    const { error } = await supabase.from("applications").insert({
      job_offer_id: jobOfferId,
      candidate_id: profile.id,
    });

    if (error) {
      const code = (error as any).code;
      if (code === "23505") {
        toast.error("Ti sei già candidato per questa posizione");
      } else {
        toast.error("Errore nell'invio della candidatura");
      }
      return;
    }

    toast.success("Candidatura inviata con successo!");
    loadApplications();
  };

  const swipeHandlers = useSwipe({
    onSwipedLeft: () => {
      if (!isMobile) return;
      if (currentView < views.length - 1) setCurrentView(currentView + 1);
    },
    onSwipedRight: () => {
      if (!isMobile) return;
      if (currentView > 0) setCurrentView(currentView - 1);
    },
    minSwipeDistance: 50,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recruit Base</h1>
            <p className="text-sm text-muted-foreground">Dashboard Candidato</p>
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
        {/* Indicatori vista - solo mobile */}
        {isMobile && (
          <div className="flex justify-center gap-2 -mt-2">
            {views.map((v) => (
              <button
                key={v.id}
                onClick={() => setCurrentView(v.id)}
                className={`h-2 rounded-full transition-all ${
                  currentView === v.id ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        )}

        {/* Header vista corrente - solo mobile */}
        {isMobile && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>{views[currentView].icon}</span>
                  {views[currentView].name}
                </div>
                <p className="text-xs text-muted-foreground mt-1">👈 Swipe per navigare 👉</p>
              </div>
              <div className="flex gap-1">
                {views.map((v) => (
                  <Button
                    key={v.id}
                    onClick={() => setCurrentView(v.id)}
                    variant={currentView === v.id ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    {v.icon}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div {...(isMobile ? swipeHandlers : {})} className="min-h-[60vh] touch-pan-y">
          {/* Vista 0: Home */}
          {(!isMobile || currentView === 0) && (
            <div className="space-y-6 animate-fade-in">
              <Card className="border-none shadow-md bg-gradient-to-r from-card to-accent/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        👋 Benvenuto, {profile.full_name}
                        {profile.is_premium && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-base">Trova il lavoro perfetto per te</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {profile.referral_code && (
                <AmbassadorSection userId={profile.id} referralCode={profile.referral_code} />
              )}

              <MatchesList userId={profile.id} userRole="candidate" />

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Benvenuto, {profile.full_name}</CardTitle>
                    {!profile.city || !profile.job_title || !profile.skills?.length ? (
                      <Badge variant="outline" className="text-amber-600 border-amber-600">
                        Profilo incompleto
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-600">
                        Profilo completo ✓
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {!profile.city || !profile.job_title || !profile.skills?.length
                      ? "Completa il tuo profilo per aumentare le tue possibilità!"
                      : "Trova le migliori opportunità di lavoro per te"}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Vista 1: Offerte */}
          {(!isMobile || currentView === 1) && (
            <Card className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Offerte Disponibili
                  </CardTitle>
                  <CardDescription>
                    {jobOffers.length === 0
                      ? "Nessuna offerta disponibile al momento"
                      : `${jobOffers.length} offerte disponibili`}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <SearchFilters userRole="candidate" onSearch={handleSearch} />
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredJobs.length === 0 ? (
                    <div className="col-span-2 text-center py-12 space-y-4 animate-fade-in">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Briefcase className="h-10 w-10 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-foreground">Nessuna offerta trovata</p>
                        <p className="text-sm text-muted-foreground">
                          {jobOffers.length === 0
                            ? "Torna più tardi per scoprire nuove opportunità"
                            : "Prova a modificare i filtri di ricerca"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    filteredJobs.map((job) => {
                      const hasApplied = applications.some((app) => app.job_offer_id === job.id);
                      return (
                        <JobOfferCard
                          key={job.id}
                          job={job}
                          onApply={() => handleApply(job.id)}
                          hasApplied={hasApplied}
                          isCandidate
                        />
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vista 2: Profilo */}
          {(!isMobile || currentView === 2) && (
            <Card className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Il Tuo Profilo
                  </CardTitle>
                  <CardDescription>
                    {!profile.city || !profile.job_title || !profile.skills?.length
                      ? "⚠️ Completa il profilo per essere più visibile ai recruiter"
                      : "Il tuo profilo è completo e visibile ai recruiter"}
                  </CardDescription>
                </div>
                <Button onClick={() => setShowEditProfile(true)} size="lg">
                  {!profile.city || !profile.job_title || !profile.skills?.length
                    ? "Completa Profilo"
                    : "Modifica"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Nome: </span>
                    <span>{profile.full_name}</span>
                  </div>
                  {profile.city && (
                    <div>
                      <span className="font-medium">Città: </span>
                      <span>{profile.city}</span>
                    </div>
                  )}
                  {profile.job_title && (
                    <div>
                      <span className="font-medium">Ruolo: </span>
                      <span>{profile.job_title}</span>
                    </div>
                  )}
                  {profile.skills && profile.skills.length > 0 && (
                    <div>
                      <span className="font-medium">Competenze: </span>
                      <span>{profile.skills.join(", ")}</span>
                    </div>
                  )}
                  {profile.linkedin_url && (
                    <div>
                      <span className="font-medium">LinkedIn: </span>
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Visualizza profilo
                      </a>
                    </div>
                  )}
                  {profile.phone_number && (
                    <div>
                      <span className="font-medium">Telefono: </span>
                      <span>{profile.phone_number}</span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="font-medium mb-2">Curriculum Vitae</p>
                  <CVUploader
                    userId={profile.id}
                    currentCvUrl={profile.cv_url}
                    onUploadComplete={() => window.location.reload()}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <EditProfileDialog
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
        profile={profile}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
};

export default CandidateDashboard;
