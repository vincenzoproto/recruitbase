import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Briefcase, User, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import EditProfileDialog from "./EditProfileDialog";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { MeetingRequestDialog } from "@/components/mobile/MeetingRequestDialog";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { ChatDialog } from "@/components/chat/ChatDialog";
import { PremiumCandidateDashboard } from "./PremiumCandidateDashboard";
import { CVCopilot } from "@/components/candidate/CVCopilot";
import { GlobalCopilotFAB } from "@/components/ui/global-copilot-fab";
import { MeetingConfirmationBanner } from "@/components/mobile/MeetingConfirmationBanner";
import { SidebarMenu } from "@/components/navigation/SidebarMenu";
import { QuickActionsFAB, candidateActions } from "@/components/ui/quick-actions-fab";
import { calculateCultureFit } from "@/lib/utils/profileHelper";

interface CandidateDashboardProps {
  profile: any;
  onUpdateProfile?: () => void;
}

const CandidateDashboard = ({ profile, onUpdateProfile }: CandidateDashboardProps) => {
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const isMobile = useIsMobile();
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [chatUserId, setChatUserId] = useState<string | null>(null);
  const [chatUserName, setChatUserName] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { unreadCount } = useMessageNotifications(profile.id);

  const cultureFitScore = calculateCultureFit(profile);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleMenuNavigate = (section: string) => {
    setSidebarOpen(false);
    if (section.startsWith("/")) {
      navigate(section);
    } else {
      navigate(`/${section}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
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
      
      <SidebarMenu
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        fullName={profile.full_name || "Candidato"}
        avatarUrl={profile.avatar_url}
        role="candidate"
        planType={profile.is_premium ? "business" : "free"}
        trsScore={profile.talent_relationship_score}
        cultureFit={cultureFitScore}
        onNavigate={handleMenuNavigate}
        onLogout={handleSignOut}
      />

      <main className="container mx-auto px-4 py-8 space-y-6">

        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                👋 Benvenuto, {profile.full_name}
                {profile.is_premium && (
                  <Badge className="ml-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </h2>
              <p className="text-muted-foreground">Pannello Carriera · controlla CV, candidature e match consigliati</p>
            </div>
            <CVCopilot profile={profile} />
          </div>

          <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-semibold">🚀 Azioni Rapide</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowEditProfile(true)}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                Completa profilo
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/offers")}
                className="gap-2"
              >
                <Briefcase className="h-4 w-4" />
                Vedi offerte
              </Button>
            </div>
          </Card>

          <PremiumCandidateDashboard 
            profile={profile} 
            onNavigate={(view) => {
              if (view === 1) navigate("/offers");
              else if (view === 2) navigate("/feed");
              else if (view === 3) navigate("/career");
              else if (view === 4) setShowEditProfile(true);
              else if (view === 5) navigate("/messages");
              else if (view === 6) navigate("/notifications");
            }} 
          />
        </div>
      </main>

      <QuickActionsFAB actions={candidateActions} userRole="candidate" />
      <GlobalCopilotFAB userRole="candidate" />

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
