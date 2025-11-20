import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { awardGamificationPoints, GamificationEventType } from "@/lib/gamification";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

interface GamificationStats {
  xp: number;
  level: number;
  engagement: number;
  trs: number;
  xpProgress: {
    current: number;
    needed: number;
    total: number;
  };
  badges: Badge[];
}

const ALL_BADGES: Omit<Badge, 'earned' | 'earnedAt'>[] = [
  {
    id: 'profile_complete',
    name: 'Profilo Completo',
    description: 'Hai completato il tuo profilo al 100%',
    icon: '✅'
  },
  {
    id: 'first_application',
    name: 'Prima Candidatura',
    description: 'Hai inviato la tua prima candidatura',
    icon: '📝'
  },
  {
    id: 'email_verified',
    name: 'Email Verificata',
    description: 'Hai verificato il tuo indirizzo email',
    icon: '📧'
  },
  {
    id: 'linkedin_verified',
    name: 'LinkedIn Connesso',
    description: 'Hai collegato il tuo profilo LinkedIn',
    icon: '💼'
  },
  {
    id: 'premium_user',
    name: 'Utente Premium',
    description: 'Sei un membro premium',
    icon: '👑'
  },
  {
    id: 'ambassador',
    name: 'Ambassador',
    description: 'Sei un ambassador attivo',
    icon: '🌟'
  },
  {
    id: 'top_performer',
    name: 'Top Performer',
    description: 'Hai raggiunto il livello 10',
    icon: '🏆'
  },
  {
    id: 'active_recruiter',
    name: 'Recruiter Attivo',
    description: 'Hai contattato 20+ candidati',
    icon: '💪'
  },
  {
    id: 'quick_responder',
    name: 'Risposta Rapida',
    description: 'Rispondi sempre entro 24 ore',
    icon: '⚡'
  },
  {
    id: 'relationship_builder',
    name: 'Costruttore di Relazioni',
    description: 'TRS medio sopra 80',
    icon: '🤝'
  }
];

export function useUnifiedGamification(userId: string | undefined) {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadStats();
      subscribeToChanges();
    }
  }, [userId]);

  const loadStats = async () => {
    if (!userId) return;

    try {
      // Load profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("xp, level, engagement_score, talent_relationship_score")
        .eq("id", userId)
        .single();

      // Load achievements
      const { data: achievements } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", userId);

      const xp = profile?.xp || 0;
      const level = profile?.level || 1;
      const engagement = profile?.engagement_score || 0;
      const trs = profile?.talent_relationship_score || 0;

      // Calculate XP progress
      const xpForNextLevel = level * 500;
      const xpInCurrentLevel = xp % 500;
      const xpNeeded = xpForNextLevel - xp;

      // Map badges
      const badges: Badge[] = ALL_BADGES.map(badge => {
        const achievement = achievements?.find(a => a.badge_type === badge.id);
        return {
          ...badge,
          earned: !!achievement,
          earnedAt: achievement?.earned_at
        };
      });

      setStats({
        xp,
        level,
        engagement,
        trs,
        xpProgress: {
          current: xpInCurrentLevel,
          needed: xpNeeded,
          total: xpForNextLevel
        },
        badges
      });
    } catch (error) {
      console.error("Error loading gamification stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChanges = () => {
    if (!userId) return;

    const channel = supabase
      .channel(`gamification-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        () => {
          loadStats();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "achievements",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const trackEvent = useCallback(async (eventType: GamificationEventType, metadata?: any) => {
    if (!userId) return false;
    
    const success = await awardGamificationPoints(userId, eventType, metadata);
    
    if (success) {
      await loadStats();
    }
    
    return success;
  }, [userId]);

  return {
    stats,
    loading,
    trackEvent,
    refresh: loadStats,
  };
}
