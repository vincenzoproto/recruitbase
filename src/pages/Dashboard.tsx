import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthCache } from "@/hooks/useAuthCache";
import SplashScreen from "@/components/SplashScreen";

// Lazy load dashboard components
const RecruiterDashboard = lazy(() => import("@/components/dashboard/RecruiterDashboard"));
const CandidateDashboard = lazy(() => import("@/components/dashboard/CandidateDashboard"));

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, session, cachedProfile, isLoadingFromCache, cacheProfile } = useAuthCache();
  const [profile, setProfile] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (!isLoadingFromCache) {
      if (!session && !user) {
        navigate("/auth");
      }
    }
  }, [user, session, navigate, isLoadingFromCache]);

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
        .select("id, role, full_name, is_premium, referral_code, city")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      
      // Aggiorna cache e stato
      if (data) {
        cacheProfile(data);
        setProfile(data);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoadingProfile(false);
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

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Profilo non trovato</div>
      </div>
    );
  }

  return (
    <>
      {showSplash && (
        <SplashScreen 
          userName={profile.full_name} 
          onComplete={() => setShowSplash(false)} 
        />
      )}
      
      {!showSplash && (
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
      )}
    </>
  );
};

export default Dashboard;
