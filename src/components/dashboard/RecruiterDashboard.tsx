import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Briefcase, LogOut, Users, User, Rss, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CreateJobDialog from "./CreateJobDialog";
import JobOfferCard from "./JobOfferCard";
import LinkedInIntegration from "../LinkedInIntegration";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { TinderMatch } from "@/components/match/TinderMatch";
import { MatchesList } from "@/components/match/MatchesList";
import KanbanBoard from "../trm/KanbanBoard";
import { useIsMobile } from "@/hooks/use-mobile";
import { hapticFeedback } from "@/lib/haptics";
import CandidateCard from "./CandidateCard";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { MeetingRequestDialog } from "@/components/mobile/MeetingRequestDialog";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { ChatDialog } from "@/components/chat/ChatDialog";
import CandidateDetailDialog from "@/components/trm/CandidateDetailDialog";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import EditProfileDialog from "./EditProfileDialog";
import { PremiumHomeDashboard } from "./PremiumHomeDashboard";
import { FeedWithTabs } from "@/components/social/FeedWithTabs";
import { UnifiedHeader } from "./UnifiedHeader";
import { MiniNavbar } from "./MiniNavbar";
import { GlobalCopilotFAB } from "@/components/ui/global-copilot-fab";
import { RecruiterAnalytics } from "./RecruiterAnalytics";
import { RecruiterCalendar } from "./RecruiterCalendar";
import { TeamManagement } from "./TeamManagement";
import { PricingPlans } from "./PricingPlans";
import { WeeklyInsights } from "@/components/mobile/WeeklyInsights";
import { RBCopilot } from "@/components/mobile/RBCopilot";

interface RecruiterDashboardProps {
  profile: any;
}

const RecruiterDashboard = ({ profile }: RecruiterDashboardProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { unreadCount } = useMessageNotifications(profile.id);
  
  const [jobOffers, setJobOffers] = useState<any[]>([]);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [chatUserId, setChatUserId] = useState<string | null>(null);
  const [chatUserName, setChatUserName] = useState<string>("");
  const [candidateDetailOpen, setCandidateDetailOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  useEffect(() => {
    loadJobOffers();
    loadCandidates();
    loadFavorites();
  }, []);

  useEffect(() => {
    if (profile?.id && profile?.role === "recruiter") {
      const onboardingCompleted = localStorage.getItem("rb_onboarding_completed");
      if (!onboardingCompleted) {
        setTimeout(() => setShowOnboarding(true), 500);
      }
    }
  }, [profile]);

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

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
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

      {/* Mini Navbar - Only for Recruiter on Mobile */}
      {isMobile && (
        <MiniNavbar 
          onNavigate={(section) => setActiveView(section)} 
          activeSection={activeView}
        />
      )}
      
      <div className={`max-w-screen-lg mx-auto p-4 space-y-6 ${isMobile ? 'pt-20' : ''}`}>
        <UnifiedHeader fullName={profile?.full_name} avatarUrl={profile?.avatar_url} role="recruiter" />

        {/* Desktop Tabs */}
        {!isMobile && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
            <Button
              variant={activeView === "home" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("home")}
            >
              📊 Home
            </Button>
            <Button
              variant={activeView === "feed" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("feed")}
            >
              📱 Feed
            </Button>
            <Button
              variant={activeView === "match" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("match")}
            >
              💼 Match
            </Button>
            <Button
              variant={activeView === "candidati" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("candidati")}
            >
              👥 Candidati
            </Button>
            <Button
              variant={activeView === "trm" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("trm")}
            >
              📋 Pipeline
            </Button>
            <Button
              variant={activeView === "offerte" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("offerte")}
            >
              💼 Offerte
            </Button>
            <Button
              variant={activeView === "analytics" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("analytics")}
            >
              📈 Analytics
            </Button>
            <Button
              variant={activeView === "calendario" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("calendario")}
            >
              📅 Calendario
            </Button>
            <Button
              variant={activeView === "team" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("team")}
            >
              👥 Team
            </Button>
            <Button
              variant={activeView === "piani" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("piani")}
            >
              💎 Piani
            </Button>
          </div>
        )}
        
        {/* Content Views */}
        <div className="min-h-[60vh]">
          {activeView === "home" && (
            <PremiumHomeDashboard 
              userId={profile.id} 
              onNavigate={(view) => setActiveView(view)}
            />
          )}

          {activeView === "feed" && (
            <div className="animate-fade-in">
              <FeedWithTabs />
            </div>
          )}

          {activeView === "match" && (
            <div className="space-y-6 animate-fade-in">
              <TinderMatch userId={profile.id} userRole="recruiter" />
              <MatchesList userId={profile.id} userRole="recruiter" />
            </div>
          )}

          {activeView === "candidati" && (
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

          {activeView === "trm" && (
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

          {activeView === "offerte" && (
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

          {activeView === "analytics" && (
            <div className="animate-fade-in">
              <RecruiterAnalytics userId={profile.id} />
            </div>
          )}

          {activeView === "calendario" && (
            <div className="animate-fade-in">
              <RecruiterCalendar userId={profile.id} />
            </div>
          )}

          {activeView === "team" && (
            <div className="animate-fade-in">
              <TeamManagement userId={profile.id} />
            </div>
          )}

          {activeView === "piani" && (
            <div className="animate-fade-in">
              <PricingPlans />
            </div>
          )}
        </div>

        <LinkedInIntegration />
      </div>

      <MobileBottomNav 
        activeTab={activeView}
        onTabChange={(tab) => {
          if (tab === "profile") {
            setEditProfileOpen(true);
          } else {
            setActiveView(tab);
          }
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
