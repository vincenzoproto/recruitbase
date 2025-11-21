import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface CachedProfile {
  id: string;
  role: string;
  full_name: string;
  is_premium: boolean;
  referral_code: string | null;
  cached_at: number;
}

const CACHE_KEY = "pausilio_profile";
const CACHE_DURATION = 1000 * 60 * 30; // 30 minuti

export const useAuthCache = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [cachedProfile, setCachedProfile] = useState<CachedProfile | null>(null);
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Carica dal cache al mount
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const profile = JSON.parse(cached) as CachedProfile;
        const now = Date.now();
        if (now - profile.cached_at < CACHE_DURATION) {
          setCachedProfile(profile);
        } else {
          localStorage.removeItem(CACHE_KEY);
        }
      } catch (error) {
        console.error("Error loading cached profile:", error);
        localStorage.removeItem(CACHE_KEY);
      }
    }
    setIsLoadingFromCache(false);
  }, []);

  // Setup auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === "SIGNED_OUT") {
          localStorage.removeItem(CACHE_KEY);
          setCachedProfile(null);
          setSessionExpired(false);
        }

        // Gestione token scaduto
        if (event === "TOKEN_REFRESHED" && !session) {
          setSessionExpired(true);
          localStorage.removeItem(CACHE_KEY);
          setCachedProfile(null);
        }

        if (event === "USER_UPDATED" && session) {
          setSessionExpired(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const cacheProfile = (profile: any) => {
    const toCache: CachedProfile = {
      id: profile.id,
      role: profile.role,
      full_name: profile.full_name,
      is_premium: profile.is_premium,
      referral_code: profile.referral_code,
      cached_at: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(toCache));
    setCachedProfile(toCache);
  };

  const invalidateCache = () => {
    localStorage.removeItem(CACHE_KEY);
    setCachedProfile(null);
  };

  return {
    user,
    session,
    cachedProfile,
    isLoadingFromCache,
    sessionExpired,
    cacheProfile,
    invalidateCache,
  };
};
