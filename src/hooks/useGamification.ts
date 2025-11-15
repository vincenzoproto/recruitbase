import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { awardGamificationPoints, GamificationEventType, getXPForNextLevel } from "@/lib/gamification";

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
}

/**
 * Unified gamification hook
 * Replaces useXPSystem, useRecruiterPoints, useCandidatePoints
 */
export function useGamification(userId: string | undefined) {
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
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("xp, level, engagement_score, talent_relationship_score")
        .eq("id", userId)
        .single();

      if (error) throw error;

      const xp = profile?.xp || 0;
      const level = profile?.level || 1;
      const engagement = profile?.engagement_score || 0;
      const trs = profile?.talent_relationship_score || 0;

      setStats({
        xp,
        level,
        engagement,
        trs,
        xpProgress: getXPForNextLevel(xp),
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const trackEvent = async (eventType: GamificationEventType, metadata?: any) => {
    if (!userId) return false;
    return await awardGamificationPoints(userId, eventType, metadata);
  };

  return {
    stats,
    loading,
    trackEvent,
    refresh: loadStats,
  };
}
