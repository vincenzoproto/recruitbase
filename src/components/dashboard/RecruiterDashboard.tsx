import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Briefcase, LogOut, Gift, UserCheck, TrendingUp, Users, Send, User, Rss, Search, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CreateJobDialog from "./CreateJobDialog";
import JobOfferCard from "./JobOfferCard";
import LinkedInIntegration from "../LinkedInIntegration";
import StatsCard from "./StatsCard";
import AmbassadorSection from "@/components/ambassador/AmbassadorSection";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import TRSDashboardCard from "../trm/TRSDashboardCard";
import { TinderMatch } from "@/components/match/TinderMatch";
import { MatchesList } from "@/components/match/MatchesList";
import KanbanBoard from "../trm/KanbanBoard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipe } from "@/hooks/use-swipe";
import { RecruiterScore } from "@/components/mobile/RecruiterScore";
import { RBCopilot } from "@/components/mobile/RBCopilot";
import { WeeklyInsights } from "@/components/mobile/WeeklyInsights";
import { LiveMetrics } from "@/components/premium/LiveMetrics";
import { hapticFeedback } from "@/lib/haptics";
import { KPIWidget } from "./KPIWidget";
import CandidateCard from "./CandidateCard";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { MeetingRequestDialog } from "@/components/mobile/MeetingRequestDialog";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { ChatDialog } from "@/components/chat/ChatDialog";
import CandidateDetailDialog from "@/components/trm/CandidateDetailDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupChatSection } from "@/components/chat/GroupChatSection";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import EditProfileDialog from "./EditProfileDialog";
import { PremiumHomeDashboard } from "./PremiumHomeDashboard";
import { FeedWithTabs } from "@/components/social/FeedWithTabs";
import { UnifiedHeader } from "./UnifiedHeader";
import { UnifiedLevelCard } from "./UnifiedLevelCard";
import { TopOfTheDay } from "./TopOfTheDay";
import { MiniNavbar } from "./MiniNavbar";
import { QuickActionFAB } from "@/components/ui/quick-action-fab";
import { GlobalCopilotFAB } from "@/components/ui/global-copilot-fab";
import { RecruiterAnalytics } from "./RecruiterAnalytics";
import { RecruiterCalendar } from "./RecruiterCalendar";
import { TeamManagement } from "./TeamManagement";
import { PricingPlans } from "./PricingPlans";

interface RecruiterDashboardProps {
  profile: any;
}

const RecruiterDashboard = ({ profile }: RecruiterDashboardProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [jobOffers, setJobOffers] = useState<any[]>([]);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [currentView, setCurrentView] = useState(0); // 0: Home, 1: Feed, 2: Match, 3: Candidati, 4: Pipeline, 5: Offerte, 6: Insights, 7: Gruppi Chat
  const [miniNavSection, setMiniNavSection] = useState<"dashboard" | "chat" | "trm">("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [kpiData, setKpiData] = useState({
    avgTRS: 0,
    activeCandidates: 0,
    followUpsSent: 0,
  });
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [chatUserId, setChatUserId] = useState<string | null>(null);
  const [chatUserName, setChatUserName] = useState<string>("");
  const [candidateDetailOpen, setCandidateDetailOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const { unreadCount, requestNotificationPermission } = useMessageNotifications(profile.id);

  const views = [
    { id: 0, name: "Home", icon: "📊" },
    { id: 1, name: "Feed", icon: "📱" },
    { id: 2, name: "Match", icon: "💼" },
    { id: 3, name: "Candidati", icon: "👥" },
    { id: 4, name: "Pipeline", icon: "📋" },
    { id: 5, name: "Offerte", icon: "💼" },
    { id: 6, name: "Analytics", icon: "📈" },
    { id: 7, name: "Calendario", icon: "📅" },
    { id: 8, name: "Team", icon: "👥" },
    { id: 9, name: "Piani", icon: "💎" }
  ];

  const handleNavigateFromHome = (viewName: string) => {
    const viewMap: Record<string, number> = {
      "match": 2,
      "pipeline": 4,
      "offers": 5,
      "candidates": 3,
    };
    const viewId = viewMap[viewName];
    if (viewId !== undefined) {
      setCurrentView(viewId);
      hapticFeedback.light();
    }
  };

  useEffect(() => {
    loadJobOffers();
    loadKPIData();
    loadCandidates();
    loadFavorites();
  }, []);

  useEffect(() => {
    // Mostra l'onboarding solo dopo che il profilo è caricato e solo se non è stato completato
    if (profile?.id && profile?.role === "recruiter") {
      const onboardingCompleted = localStorage.getItem("rb_onboarding_completed");
      if (!onboardingCompleted) {
        // Ritarda di 500ms per permettere il caricamento completo della dashboard
        setTimeout(() => {
          setShowOnboarding(true);
        }, 500);
      }
    }
  }, [profile]);

  const loadKPIData = async () => {
    try {
      // Carica TRS medio
      const { data: profiles } = await supabase
        .from("profiles")
        .select("talent_relationship_score")
        .eq("role", "candidate")
        .not("talent_relationship_score", "is", null);

      const avgTRS = profiles && profiles.length > 0
        ? Math.round(profiles.reduce((acc, p) => acc + (p.talent_relationship_score || 0), 0) / profiles.length)
        : 0;

      // Carica candidati attivi
      const { count: activeCandidates } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "candidate");

      // Simula follow-up inviati (in futuro sostituire con dati reali)
      const followUpsSent = Math.floor(Math.random() * 50) + 20;

      setKpiData({
        avgTRS,
        activeCandidates: activeCandidates || 0,
        followUpsSent,
      });
    } catch (error) {
      console.error("Error loading KPI data:", error);
    }
  };

  const loadCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "candidate")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        toast.error("Errore nel caricamento dei candidati");
        return;
      }
      setCandidates(data || []);
    } catch (error) {
      console.error("Error loading candidates:", error);
    }
  };

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("candidate_id")
        .eq("recruiter_id", profile.id);

      if (error) throw error;
      
      const favSet = new Set(data?.map(f => f.candidate_id) || []);
      setFavorites(favSet);
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const toggleFavorite = async (candidateId: string) => {
    try {
      if (favorites.has(candidateId)) {
        await supabase
          .from("favorites")
          .delete()
          .eq("recruiter_id", profile.id)
          .eq("candidate_id", candidateId);
        
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(candidateId);
          return newSet;
        });
        toast.success("Rimosso dai preferiti");
      } else {
        await supabase
          .from("favorites")
          .insert({
            recruiter_id: profile.id,
            candidate_id: candidateId,
          });
        
        setFavorites(prev => new Set(prev).add(candidateId));
        toast.success("Aggiunto ai preferiti");
      }
    } catch (error) {
      toast.error("Errore nell'aggiornamento dei preferiti");
      console.error("Error toggling favorite:", error);
    }
  };

  const handleOpenChat = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();
    
    if (data) {
      setChatUserId(userId);
      setChatUserName(data.full_name);
    }
  };

  const handleOpenCandidateDetail = async (candidateId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", candidateId)
      .single();
    
    if (data) {
      setSelectedCandidate(data);
      setCandidateDetailOpen(true);
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


  const handleSignOut = async () => {
    await hapticFeedback.medium();
    await supabase.auth.signOut();
    navigate("/auth");
  };


  const handleOnboardingComplete = () => {
    localStorage.setItem("rb_onboarding_completed", "true");
    setShowOnboarding(false);
  };

  // Swipe per navigare tra le viste
  const handleSwipeLeft = () => {
    if (!isMobile) return;
    if (currentView < views.length - 1) {
      setCurrentView(currentView + 1);
      hapticFeedback.light();
    }
  };

  const handleSwipeRight = () => {
    if (!isMobile) return;
    if (currentView > 0) {
      setCurrentView(currentView - 1);
      hapticFeedback.light();
    }
  };

  const swipeHandlers = useSwipe({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    minSwipeDistance: 50
  });


  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <OnboardingFlow 
        open={showOnboarding} 
        onComplete={handleOnboardingComplete}
        userId={profile.id}
      />
      <MeetingRequestDialog 
        userId={profile.id}
        open={meetingDialogOpen}
        onOpenChange={setMeetingDialogOpen}
      />
      
      {chatUserId && (
        <ChatDialog
          currentUserId={profile.id}
          otherUserId={chatUserId}
          otherUserName={chatUserName}
          open={!!chatUserId}
          onOpenChange={(open) => !open && setChatUserId(null)}
        />
      )}

      {selectedCandidate && (
        <CandidateDetailDialog
          candidate={selectedCandidate}
          open={candidateDetailOpen}
          onOpenChange={setCandidateDetailOpen}
          onUpdate={loadCandidates}
        />
      )}

      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        profile={profile}
        onSuccess={() => {
          toast.success("Profilo aggiornato!");
          window.location.reload();
        }}
      />
      
      {profile?.id && (
        <>
          <WeeklyInsights userId={profile.id} />
          <RBCopilot />
        </>
      )}
      
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">Recruit Base TRM</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {profile.full_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/search')}
              className="gap-1"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Cerca</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="gap-1"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profilo</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/social')}
              className="gap-1"
            >
              <Rss className="h-4 w-4" />
              <span className="hidden sm:inline">Social</span>
            </Button>
            <NotificationBell 
              userId={profile.id}
              onMeetingNotificationClick={() => setMeetingDialogOpen(true)}
              onMessageNotificationClick={handleOpenChat}
              onApplicationNotificationClick={handleOpenCandidateDetail}
              onMatchNotificationClick={(matchId) => {
                setCurrentView(2); // Go to match view
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Esci</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-8">
        {/* View Indicators - solo mobile */}
        {isMobile && (
          <div className="flex justify-center gap-2 mb-4">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => {
                  setCurrentView(view.id);
                  hapticFeedback.light();
                }}
                className={`h-2 rounded-full transition-all ${
                  currentView === view.id 
                    ? "w-8 bg-primary" 
                    : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        )}

        {/* Header Vista Corrente - solo mobile */}
        {isMobile && (
          <Card className="mb-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span>{views[currentView].icon}</span>
                    {views[currentView].name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    👈 Swipe per navigare 👉
                  </p>
                </div>
                <div className="flex gap-1 overflow-x-auto max-w-[200px] scrollbar-hide">
                  {views.map((view) => (
                    <Button
                      key={view.id}
                      onClick={() => {
                        setCurrentView(view.id);
                        hapticFeedback.light();
                      }}
                      variant={currentView === view.id ? "default" : "ghost"}
                      size="sm"
                      className="h-8 w-8 p-0 flex-shrink-0"
                    >
                      {view.icon}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div 
          {...(isMobile ? swipeHandlers : {})}
          className="min-h-[60vh] touch-pan-y mb-6"
          style={{ touchAction: 'pan-y' }}
        >
          {/* Vista 0: Home Premium */}
          {(!isMobile || currentView === 0) && (
            <PremiumHomeDashboard 
              userId={profile.id} 
              onNavigate={(view) => handleNavigateFromHome(view)}
            />
          )}

          {/* Vista 1: Feed */}
          {(!isMobile || currentView === 1) && (
            <div className="animate-fade-in">
              <FeedWithTabs />
            </div>
          )}

          {/* Vista 2: Match */}
          {(!isMobile || currentView === 2) && (
            <div className="space-y-6 animate-fade-in">
              <TinderMatch userId={profile.id} userRole="recruiter" />
              <MatchesList userId={profile.id} userRole="recruiter" />
            </div>
          )}

          {/* Vista 3: Candidati */}
          {(!isMobile || currentView === 3) && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Candidati Disponibili
                </CardTitle>
                <CardDescription>
                  {candidates.length} candidati registrati · Contattali subito
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {candidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      currentUserId={profile.id}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={favorites.has(candidate.id)}
                    />
                  ))}
                  {candidates.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-card rounded-lg border">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-2">
                        Nessun candidato disponibile al momento
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vista 4: Pipeline */}
          {(!isMobile || currentView === 4) && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Pipeline Kanban
                </CardTitle>
                <CardDescription>
                  Trascina i candidati per aggiornare lo stato
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <KanbanBoard />
              </CardContent>
            </Card>
          )}

          {/* Vista 5: Offerte */}
          {(!isMobile || currentView === 5) && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-end">
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
                    isRecruiter={true}
                    onOpenChat={handleOpenChat}
                    onOpenCandidateDetail={handleOpenCandidateDetail}
                  />
                ))}
                {jobOffers.length === 0 && (
                  <div className="col-span-2 text-center py-12 bg-card rounded-lg border">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Nessuna offerta pubblicata. Crea la tua prima offerta!
                    </p>
                    <Button onClick={() => setShowCreateJob(true)} variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Crea Prima Offerta
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vista 6: Analytics */}
          {(!isMobile || currentView === 6) && (
            <div className="animate-fade-in">
              <RecruiterAnalytics userId={profile.id} />
            </div>
          )}

          {/* Vista 7: Calendario */}
          {(!isMobile || currentView === 7) && (
            <div className="animate-fade-in">
              <RecruiterCalendar userId={profile.id} />
            </div>
          )}

          {/* Vista 8: Team */}
          {(!isMobile || currentView === 8) && (
            <div className="animate-fade-in">
              <TeamManagement userId={profile.id} />
            </div>
          )}

          {/* Vista 9: Piani */}
          {(!isMobile || currentView === 9) && (
            <div className="animate-fade-in">
              <PricingPlans />
            </div>
          )}
        </div>

        <LinkedInIntegration />
      </main>

      <MobileBottomNav 
        activeTab={
          currentView === 0 ? "home" :
          currentView === 1 ? "feed" :
          currentView === 2 ? "match" :
          currentView === 4 ? "trm" :
          "home"
        }
        onTabChange={(tab) => {
          if (tab === "home") setCurrentView(0);
          else if (tab === "feed") setCurrentView(1);
          else if (tab === "match") setCurrentView(2);
          else if (tab === "trm") setCurrentView(4);
          else if (tab === "profile") setEditProfileOpen(true);
          hapticFeedback.light();
        }}
        userRole="recruiter"
        unreadCount={unreadCount}
      />

      <GlobalCopilotFAB userRole="recruiter" />

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
