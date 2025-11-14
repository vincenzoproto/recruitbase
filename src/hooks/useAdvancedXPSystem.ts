import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  earned: boolean;
  earnedAt?: string;
}

interface WeeklyStats {
  posts: number;
  comments: number;
  likes: number;
  shares: number;
  profileUpdates: number;
  feedVisits: number;
}

export const useAdvancedXPSystem = (userId: string | undefined) => {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    posts: 0,
    comments: 0,
    likes: 0,
    shares: 0,
    profileUpdates: 0,
    feedVisits: 0,
  });

  const XP_PER_LEVEL = 100;

  useEffect(() => {
    if (userId) {
      loadXPData();
      loadWeeklyStats();
    }
  }, [userId]);

  const loadXPData = async () => {
    if (!userId) return;

    try {
      const stored = localStorage.getItem(`xp_${userId}`);
      if (stored) {
        const data = JSON.parse(stored);
        setXp(data.xp || 0);
        setLevel(data.level || 1);
      }

      // Load earned badges
      const { data: achievements } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", userId);

      if (achievements) {
        updateBadgesWithAchievements(achievements);
      }
    } catch (error) {
      console.error("Error loading XP data:", error);
    }
  };

  const loadWeeklyStats = async () => {
    if (!userId) return;

    const stored = localStorage.getItem(`weekly_stats_${userId}`);
    if (stored) {
      const data = JSON.parse(stored);
      const weekStart = getWeekStart();
      if (data.weekStart === weekStart) {
        setWeeklyStats(data.stats);
      } else {
        resetWeeklyStats();
      }
    }
  };

  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split("T")[0];
  };

  const resetWeeklyStats = () => {
    const newStats = {
      posts: 0,
      comments: 0,
      likes: 0,
      shares: 0,
      profileUpdates: 0,
      feedVisits: 0,
    };
    setWeeklyStats(newStats);
    if (userId) {
      localStorage.setItem(
        `weekly_stats_${userId}`,
        JSON.stringify({ weekStart: getWeekStart(), stats: newStats })
      );
    }
  };

  const updateBadgesWithAchievements = (achievements: any[]) => {
    const allBadges: Badge[] = [
      {
        id: "top_recruiter",
        name: "Top Recruiter",
        description: "Più interazioni in una settimana",
        icon: "🏆",
        progress: weeklyStats.posts + weeklyStats.comments + weeklyStats.likes,
        maxProgress: 20,
        earned: achievements.some((a) => a.badge_type === "top_recruiter"),
      },
      {
        id: "candidate_booster",
        name: "Candidate Booster",
        description: "Profilo aggiornato + CV caricato",
        icon: "🚀",
        progress: weeklyStats.profileUpdates,
        maxProgress: 3,
        earned: achievements.some((a) => a.badge_type === "candidate_booster"),
      },
      {
        id: "social_pro",
        name: "Social Pro",
        description: "Usa feed social 3+ volte in una settimana",
        icon: "💬",
        progress: weeklyStats.feedVisits,
        maxProgress: 3,
        earned: achievements.some((a) => a.badge_type === "social_pro"),
      },
      {
        id: "share_hero",
        name: "Share Hero",
        description: "Condividi link 2+ volte",
        icon: "📤",
        progress: weeklyStats.shares,
        maxProgress: 2,
        earned: achievements.some((a) => a.badge_type === "share_hero"),
      },
      {
        id: "active_user",
        name: "Utente Attivo",
        description: "Login giornaliero per 3 giorni",
        icon: "⭐",
        progress: 0,
        maxProgress: 3,
        earned: achievements.some((a) => a.badge_type === "active_user"),
      },
    ];

    setBadges(allBadges);
  };

  const addXP = useCallback(
    async (amount: number, reason: string) => {
      if (!userId) return;

      const newXP = xp + amount;
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
      const leveledUp = newLevel > level;

      setXp(newXP);
      setLevel(newLevel);

      // Save to localStorage
      localStorage.setItem(
        `xp_${userId}`,
        JSON.stringify({ xp: newXP, level: newLevel })
      );

      // Show toast
      toast.success(`+${amount} XP`, {
        description: reason,
        duration: 2000,
      });

      if (leveledUp) {
        toast.success(`🎉 Livello ${newLevel}!`, {
          description: "Hai sbloccato nuove funzionalità",
          duration: 3000,
        });
      }

      // Save to database
      try {
        await supabase.from("recruiter_actions").insert({
          user_id: userId,
          action_type: reason,
          points: amount,
          description: reason,
        });
      } catch (error) {
        console.error("Error saving XP:", error);
      }
    },
    [userId, xp, level]
  );

  const trackAction = useCallback(
    async (action: keyof WeeklyStats, xpAmount: number, reason: string) => {
      if (!userId) return;

      // Update weekly stats
      const newStats = { ...weeklyStats, [action]: weeklyStats[action] + 1 };
      setWeeklyStats(newStats);

      localStorage.setItem(
        `weekly_stats_${userId}`,
        JSON.stringify({ weekStart: getWeekStart(), stats: newStats })
      );

      // Add XP
      await addXP(xpAmount, reason);

      // Check for badge progress
      checkBadgeProgress(newStats);
    },
    [userId, weeklyStats, addXP]
  );

  const checkBadgeProgress = async (stats: WeeklyStats) => {
    if (!userId) return;

    // Top Recruiter
    if (stats.posts + stats.comments + stats.likes >= 20) {
      await awardBadge("top_recruiter");
    }

    // Candidate Booster
    if (stats.profileUpdates >= 3) {
      await awardBadge("candidate_booster");
    }

    // Social Pro
    if (stats.feedVisits >= 3) {
      await awardBadge("social_pro");
    }

    // Share Hero
    if (stats.shares >= 2) {
      await awardBadge("share_hero");
    }
  };

  const awardBadge = async (badgeType: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase.from("achievements").insert({
        user_id: userId,
        badge_type: badgeType,
      });

      if (!error) {
        toast.success("🏆 Nuovo Badge!", {
          description: `Hai ottenuto il badge ${badgeType}`,
          duration: 4000,
        });
        loadXPData();
      }
    } catch (error) {
      console.error("Error awarding badge:", error);
    }
  };

  const xpToNextLevel = XP_PER_LEVEL - (xp % XP_PER_LEVEL);

  return {
    level,
    xp,
    xpToNextLevel,
    badges,
    weeklyStats,
    addXP,
    trackAction,
  };
};
