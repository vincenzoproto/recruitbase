import { useEffect, useState, lazy, Suspense, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthCache } from "@/hooks/useAuthCache";
import { toast } from "sonner";
import { EnhancedSplashScreen } from "@/components/splash/EnhancedSplashScreen";
import UnifiedOnboarding from "@/components/onboarding/UnifiedOnboarding";
import ErrorBoundary from "@/components/ErrorBoundary";
import { MainLayout } from "@/components/layout/MainLayout";

// Lazy load dashboard components
const RecruiterDashboard = lazy(() => import("@/components/dashboard/RecruiterDashboard"));
const CandidateDashboard = lazy(() => import("@/components/dashboard/CandidateDashboard"));

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, session, cachedProfile, isLoadingFromCache, cacheProfile, sessionExpired } = useAuthCache();
  const [profile, setProfile] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
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
      setIsLoadingProfile(true);

      // Get authenticated user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        console.error('User error:', userError);
        navigate('/auth');
        return;
      }

      // Try to fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      // If profile doesn't exist, create it
      if (!profileData || profileError) {
        console.log('Profile not found, creating new profile');
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Utente',
            avatar_url: currentUser.user_metadata?.avatar_url || null,
            role: 'candidate'
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          toast.error("Impossibile creare il profilo");
          setIsLoadingProfile(false);
          return;
        }

        // Reload the newly created profile
        const { data: newProfile, error: reloadError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (reloadError || !newProfile) {
          console.error('Error reloading profile:', reloadError);
          toast.error("Impossibile caricare il profilo");
          setIsLoadingProfile(false);
          return;
        }

        setProfile(newProfile);
        cacheProfile(newProfile);
        
        // Check if onboarding is needed
        if (!newProfile.onboarding_completed) {
          setShowOnboarding(true);
        }
        
        setIsLoadingProfile(false);
        return;
      }

      // Profile exists
      console.log('Profile loaded successfully');
      setProfile(profileData);
      cacheProfile(profileData);
      
      // Check if onboarding is needed
      if (!profileData.onboarding_completed) {
        setShowOnboarding(true);
      }
      
      setIsLoadingProfile(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error("Impossibile caricare il profilo");
      setIsLoadingProfile(false);
    }
  };


  const handleOnboardingComplete = async () => {
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profile?.id)
      .single();

    if (updatedProfile) {
      setProfile(updatedProfile);
      cacheProfile(updatedProfile);
    }

    setShowOnboarding(false);
    window.location.reload();
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
        <div className="text-center space-y-6 animate-fade-in max-w-md mx-auto px-4">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-foreground">Preparazione dashboard</p>
            <p className="text-sm text-muted-foreground">
              Stiamo caricando i tuoi dati e preparando l'esperienza personalizzata...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span>Verifica profilo</span>
            <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <span>Caricamento dati</span>
            <div className="w-2 h-2 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: '400ms' }}></div>
            <span>Pronto</span>
          </div>
        </div>
      </div>
    );
  }



  if (showSplash) {
    return <EnhancedSplashScreen />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 animate-fade-in max-w-md mx-auto px-4">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-foreground">Finalizzazione accesso</p>
            <p className="text-sm text-muted-foreground">
              Ultimo controllo prima di mostrarti la tua dashboard personalizzata...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <UnifiedOnboarding
        open={showOnboarding}
        userId={profile.id}
        onComplete={handleOnboardingComplete}
      />
      
      <MainLayout>
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
      </MainLayout>
    </>
  );
};

export default Dashboard;
