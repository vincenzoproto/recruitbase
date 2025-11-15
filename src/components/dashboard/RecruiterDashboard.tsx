import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SidebarMenu } from "@/components/navigation/SidebarMenu";
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures";
import { hapticFeedback } from "@/lib/haptics";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { ChatDialog } from "@/components/chat/ChatDialog";
import CandidateDetailDialog from "@/components/trm/CandidateDetailDialog";
import EditProfileDialog from "./EditProfileDialog";
import { PremiumHomeDashboard } from "./PremiumHomeDashboard";
import { QuickActionsFAB, recruiterActions } from "@/components/ui/quick-actions-fab";
import { GlobalCopilotFAB } from "@/components/ui/global-copilot-fab";
import { MeetingConfirmationBanner } from "@/components/mobile/MeetingConfirmationBanner";
import { MeetingRequestDialog } from "@/components/mobile/MeetingRequestDialog";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { PriorityCard } from "./PriorityCard";
import { FollowUpManager } from "./FollowUpManager";
import { UpcomingMeetingsCard } from "./UpcomingMeetingsCard";
import { PositiveFeedbackCard } from "./PositiveFeedbackCard";
import { RBCopilot } from "@/components/mobile/RBCopilot";
import { WeeklyInsights } from "@/components/mobile/WeeklyInsights";

interface RecruiterDashboardProps {
  profile: any;
}

const RecruiterDashboard = ({ profile }: RecruiterDashboardProps) => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [chatUserId, setChatUserId] = useState<string | null>(null);
  const [chatUserName, setChatUserName] = useState<string>("");
  const [candidateDetailOpen, setCandidateDetailOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
  const { unreadCount } = useMessageNotifications(profile.id);
  const premiumFeatures = usePremiumFeatures(profile.id);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("rb_onboarding_completed");
    if (!hasSeenOnboarding && !profile.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [profile.onboarding_completed]);

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

  const handleSignOut = async () => {
    await hapticFeedback.medium();
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem("rb_onboarding_completed", "true");
    setShowOnboarding(false);
  };

  const handleNavigateFromHome = (section: string) => {
    navigate(`/${section}`);
  };

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
          onUpdate={() => {}}
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
      
      <SidebarMenu
        open={sidebarMenuOpen}
        onOpenChange={setSidebarMenuOpen}
        fullName={profile.full_name}
        avatarUrl={profile.avatar_url}
        role="recruiter"
        planType={premiumFeatures.planType}
        trsScore={profile.talent_relationship_score || 0}
        onNavigate={(section) => {
          setSidebarMenuOpen(false);
          if (section.startsWith("/")) {
            navigate(section);
          } else {
            navigate(`/${section}`);
          }
        }}
        onLogout={handleSignOut}
      />

      <main className="container mx-auto px-4 py-4 sm:py-8">
        <MeetingConfirmationBanner userId={profile.id} userRole="recruiter" />
        
        <div className="space-y-6 animate-fade-in">
          {/* 1. Da ricontattare oggi */}
          <div className="cursor-pointer" onClick={() => navigate('/pipeline')}>
            <FollowUpManager 
              recruiterId={profile.id} 
              onOpenChat={(candidateId, candidateName) => {
                setChatUserId(candidateId);
                setChatUserName(candidateName);
              }}
            />
          </div>
          
          {/* 2. Prossimi colloqui (48h) */}
          <div className="cursor-pointer" onClick={() => navigate('/calendar')}>
            <UpcomingMeetingsCard userId={profile.id} userRole="recruiter" />
          </div>
          
          {/* 3. Top 5 candidati da contattare */}
          <div className="cursor-pointer" onClick={() => navigate('/pipeline')}>
            <PriorityCard 
              recruiterId={profile.id}
              onOpenChat={(candidateId, candidateName) => {
                setChatUserId(candidateId);
                setChatUserName(candidateName);
              }}
            />
          </div>
          
          {/* 4. Candidati con feedback positivo */}
          <div className="cursor-pointer" onClick={() => navigate('/pipeline')}>
            <PositiveFeedbackCard 
              recruiterId={profile.id}
              onOpenChat={(candidateId, candidateName) => {
                setChatUserId(candidateId);
                setChatUserName(candidateName);
              }}
            />
          </div>

          <PremiumHomeDashboard 
            userId={profile.id} 
            onNavigate={(view) => handleNavigateFromHome(view)}
          />
        </div>
      </main>

      <QuickActionsFAB actions={recruiterActions} userRole="recruiter" />
      <GlobalCopilotFAB userRole="recruiter" />
    </div>
  );
};

export default RecruiterDashboard;
