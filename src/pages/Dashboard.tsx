import { useEffect, useState, lazy, Suspense, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthCache } from "@/hooks/useAuthCache";
import { toast } from "sonner";
import { SplashScreen } from "@/components/splash/SplashScreen";
import RoleSetup from "@/components/dashboard/RoleSetup";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load dashboard components
const RecruiterDashboard = lazy(() => import("@/components/dashboard/RecruiterDashboard"));
const CandidateDashboard = lazy(() => import("@/components/dashboard/CandidateDashboard"));

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, session, cachedProfile, isLoadingFromCache, cacheProfile, sessionExpired } = useAuthCache();
  const [profile, setProfile] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showRoleSetup, setShowRoleSetup] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const hasShownWelcome = useRef(false);

  // Guardia di navigazione: redirect ad /auth solo se session è definitivamente assente
  useEffect(() => {
    // Aspetta che il check della cache sia completo E che non ci sia user/session
    if (!isLoadingFromCache && !session && !user && !isLoadingProfile) {
      navigate("/auth", { replace: true });
    }
  }, [user, session, navigate, isLoadingFromCache, isLoadingProfile]);

  // Gestione sessione scaduta
  useEffect(() => {
    if (sessionExpired) {
      toast.error("Sessione scaduta, effettua di nuovo l'accesso");
      navigate("/auth", { replace: true });
    }
  }, [sessionExpired, navigate]);

  useEffect(() => {
    if (user && !isLoadingFromCache) {
      loadProfile();
    }
  }, [user, isLoadingFromCache]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      // Usa i dati dalla cache se disponibili per rendering immediato
      if (cachedProfile && cachedProfile.id === user.id) {
        setProfile(cachedProfile);
        setIsLoadingProfile(false);
      }

      // Carica i dati freschi in background (solo campi essenziali)
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, full_name, is_premium, referral_code, city, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found, lo gestiamo sotto
        throw error;
      }
      
      if (data) {
        // Profilo esiste
        cacheProfile(data);
        setProfile(data);

        // Se role è null/undefined, mostra setup
        if (!data.role) {
          setShowRoleSetup(true);
        }
        // Onboarding disabilitato temporaneamente
      } else {
        // Profilo non esiste, crealo automaticamente
        await createProfile();
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      // Estrai nome dalla email se non disponibile
      const nameFromEmail = user.email?.split('@')[0] || 'Utente';
      
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || nameFromEmail,
          role: "recruiter", // Default
        })
        .select("id, role, full_name, is_premium, referral_code, city")
        .single();

      if (insertError) throw insertError;

      if (newProfile) {
        cacheProfile(newProfile);
        setProfile(newProfile);

        // Invia email di benvenuto
        try {
          await supabase.functions.invoke("send-welcome-email", {
            body: { 
              name: newProfile.full_name, 
              email: user.email 
            },
          });
        } catch (emailError) {
          console.error("Error sending welcome email:", emailError);
        }

        // Crea trial subscription
        const trialStart = new Date();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 30);

        await supabase.from("subscriptions").insert({
          user_id: user.id,
          status: "trial",
          trial_start: trialStart.toISOString(),
          trial_end: trialEnd.toISOString(),
        });

        toast.success("Profilo creato con successo!");
      }
    } catch (error: any) {
      console.error("Error creating profile:", error);
      toast.error("Errore nella creazione del profilo");
    }
  };

  const handleRoleSetupComplete = (role: string) => {
    setShowRoleSetup(false);
    if (profile) {
      const updatedProfile = { ...profile, role };
      setProfile(updatedProfile);
      cacheProfile(updatedProfile);
    }
  };

  // Mostra splash screen solo brevemente
  useEffect(() => {
    if (!isLoadingProfile && profile) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoadingProfile, profile]);

  // Welcome toast al primo accesso
  useEffect(() => {
    if (!showSplash && profile && !hasShownWelcome.current) {
      const shouldShowWelcome = sessionStorage.getItem("show_welcome");
      if (shouldShowWelcome === "true") {
        toast.success(`Benvenuto/a, ${profile.full_name || "utente"} 👋`, {
          duration: 4000,
        });
        sessionStorage.removeItem("show_welcome");
        hasShownWelcome.current = true;
      }
    }
  }, [showSplash, profile]);

  if (isLoadingFromCache || (isLoadingProfile && !cachedProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Mostra setup ruolo se necessario
  if (showRoleSetup && profile) {
    return <RoleSetup userId={profile.id} onComplete={handleRoleSetupComplete} />;
  }

  // Mostra onboarding se necessario
  const handleOnboardingComplete = (data: any) => {
    setShowOnboarding(false);
    setProfile({ ...profile, ...data });
    cacheProfile({ ...profile, ...data });
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-muted-foreground">Preparazione profilo...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showSplash && (
        <SplashScreen 
          onComplete={() => setShowSplash(false)} 
        />
      )}
      
      {!showSplash && (
        <>
          <OnboardingFlow
            open={showOnboarding}
            onComplete={() => {
              setShowOnboarding(false);
              localStorage.setItem("rb_onboarding_completed", "true");
            }}
          />
          
          <ErrorBoundary 
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4 animate-fade-in">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-lg text-muted-foreground">Caricamento dashboard...</p>
                </div>
              </div>
            }
          >
          <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-lg text-muted-foreground">Preparazione dashboard...</p>
            </div>
          </div>
        }>
          {profile.role === "recruiter" ? (
            <RecruiterDashboard profile={profile} />
          ) : (
            <CandidateDashboard profile={profile} />
          )}
        </Suspense>
        </ErrorBoundary>
        </>
      )}
    </>
  );
};

export default Dashboard;
