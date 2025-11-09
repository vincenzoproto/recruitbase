import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Briefcase, LogOut, Gift, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CreateJobDialog from "./CreateJobDialog";
import JobOfferCard from "./JobOfferCard";
import LinkedInIntegration from "../LinkedInIntegration";
import StatsCard from "./StatsCard";
import AmbassadorSection from "@/components/ambassador/AmbassadorSection";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import TRSDashboardCard from "../trm/TRSDashboardCard";
import { SmartNotifications } from "@/components/mobile/SmartNotifications";
import { RecruiterScore } from "@/components/mobile/RecruiterScore";
import { RBCopilot } from "@/components/mobile/RBCopilot";
import { MobileOnboarding } from "@/components/mobile/MobileOnboarding";
import { WeeklyInsights } from "@/components/mobile/WeeklyInsights";
import { useIsMobile } from "@/hooks/use-mobile";
import { LiveMetrics } from "@/components/premium/LiveMetrics";
import { hapticFeedback } from "@/lib/haptics";

interface RecruiterDashboardProps {
  profile: any;
}

const RecruiterDashboard = ({ profile }: RecruiterDashboardProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [jobOffers, setJobOffers] = useState<any[]>([]);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    loadJobOffers();
  }, []);

  useEffect(() => {
    // Mostra l'onboarding solo dopo che il profilo è caricato e solo se non è stato completato
    if (profile?.id && profile?.role === "recruiter") {
      const onboardingCompleted = localStorage.getItem("onboarding-completed");
      if (!onboardingCompleted) {
        // Ritarda di 500ms per permettere il caricamento completo della dashboard
        setTimeout(() => {
          setShowOnboarding(true);
        }, 500);
      }
    }
  }, [profile]);


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
    localStorage.setItem("onboarding-completed", "true");
    setShowOnboarding(false);
  };


  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <MobileOnboarding open={showOnboarding} onComplete={handleOnboardingComplete} />
      {profile?.id && (
        <>
          <WeeklyInsights userId={profile.id} />
          <SmartNotifications userId={profile.id} />
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
            <NotificationBell userId={profile.id} />
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
        {profile?.id && (
          <div className="mb-4">
            <RecruiterScore userId={profile.id} />
          </div>
        )}

        <Card className="mb-4 sm:mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                  Le Tue Offerte di Lavoro
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Gestisci e pubblica nuove opportunità
                </p>
              </div>
              <Button onClick={() => setShowCreateJob(true)} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Nuova Offerta
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          {jobOffers.map((offer) => (
            <JobOfferCard
              key={offer.id}
              job={offer}
              onUpdate={loadJobOffers}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="Offerte Attive"
            value={jobOffers.length}
            icon={Briefcase}
            subtitle="Offerte pubblicate"
            gradient="from-blue-500/10 to-blue-500/5"
          />
          <StatsCard
            title="TRS Medio"
            value={85}
            icon={UserCheck}
            subtitle="Score relazioni"
            gradient="from-green-500/10 to-green-500/5"
          />
          <StatsCard
            title="Contatti Mese"
            value={24}
            icon={Gift}
            subtitle="Follow-up attivi"
            gradient="from-purple-500/10 to-purple-500/5"
          />
        </div>

        {/* Live Metrics Premium */}
        {profile?.id && (
          <div className="mb-6">
            <LiveMetrics userId={profile.id} />
          </div>
        )}

        <div className="mb-6">
          <TRSDashboardCard recruiterId={profile.id} />
        </div>

        {profile.referral_code && (
          <div className="mb-6">
            <AmbassadorSection
              referralCode={profile.referral_code}
              userId={profile.id}
            />
          </div>
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
