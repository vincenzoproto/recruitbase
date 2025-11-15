import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Event types and their XP/engagement/TRS values
export const GAMIFICATION_EVENTS = {
  // Recruiter events
  job_published: { xp: 40, engagement: 5, trs: 0, label: "Offerta pubblicata" },
  job_updated: { xp: 10, engagement: 2, trs: 0, label: "Offerta aggiornata" },
  candidate_viewed: { xp: 5, engagement: 1, trs: 0, label: "Candidato visualizzato" },
  candidate_contacted: { xp: 20, engagement: 5, trs: 5, label: "Candidato contattato" },
  message_reply_fast: { xp: 30, engagement: 8, trs: 10, label: "Risposta rapida" },
  feed_post_created: { xp: 25, engagement: 6, trs: 0, label: "Post pubblicato" },
  feed_comment_created: { xp: 10, engagement: 3, trs: 0, label: "Commento pubblicato" },
  colleague_invited: { xp: 15, engagement: 4, trs: 0, label: "Collega invitato" },
  external_share: { xp: 20, engagement: 5, trs: 0, label: "Condivisione esterna" },
  
  // Candidate events
  profile_completed: { xp: 50, engagement: 10, trs: 10, label: "Profilo completato" },
  cv_uploaded: { xp: 20, engagement: 5, trs: 5, label: "CV caricato" },
  offer_saved: { xp: 5, engagement: 1, trs: 0, label: "Offerta salvata" },
  application_sent: { xp: 15, engagement: 4, trs: 0, label: "Candidatura inviata" },
  feed_reaction: { xp: 5, engagement: 1, trs: 0, label: "Like" },
  feed_repost: { xp: 15, engagement: 4, trs: 0, label: "Repost" },
} as const;

export type GamificationEventType = keyof typeof GAMIFICATION_EVENTS;

/**
 * Award gamification points to a user
 * Centralized function that updates XP, engagement, TRS and logs the event
 */
export async function awardGamificationPoints(
  userId: string,
  eventType: GamificationEventType,
  metadata?: any,
  showToast = true
): Promise<boolean> {
  try {
    const event = GAMIFICATION_EVENTS[eventType];
    if (!event) {
      console.error(`Unknown event type: ${eventType}`);
      return false;
    }

    // Call Supabase function to award points
    const { error } = await supabase.rpc('award_gamification_points', {
      p_user_id: userId,
      p_event_type: eventType,
      p_xp: event.xp,
      p_engagement: event.engagement,
      p_trs: event.trs,
      p_metadata: metadata ? JSON.stringify(metadata) : null,
    });

    if (error) throw error;

    // Show toast notification
    if (showToast && event.xp > 0) {
      toast.success(`+${event.xp} XP`, {
        description: event.label,
        duration: 2000,
      });
    }

    return true;
  } catch (error) {
    console.error('Error awarding gamification points:', error);
    return false;
  }
}

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / 500) + 1);
}

/**
 * Calculate XP needed for next level
 */
export function getXPForNextLevel(currentXP: number): { current: number; needed: number; total: number } {
  const currentLevel = calculateLevel(currentXP);
  const xpForCurrentLevel = (currentLevel - 1) * 500;
  const xpForNextLevel = currentLevel * 500;
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;

  return {
    current: xpInCurrentLevel,
    needed: xpNeededForNextLevel,
    total: xpForNextLevel,
  };
}

/**
 * Check if a message was replied to quickly (within 24 hours)
 */
export function isQuickReply(lastMessageTimestamp: string): boolean {
  const lastMessage = new Date(lastMessageTimestamp);
  const now = new Date();
  const hoursDiff = (now.getTime() - lastMessage.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= 24;
}

/**
 * Get level color based on level number
 */
export function getLevelColor(level: number): string {
  if (level >= 10) return "from-purple-500 to-pink-500";
  if (level >= 7) return "from-blue-500 to-purple-500";
  if (level >= 5) return "from-green-500 to-blue-500";
  if (level >= 3) return "from-yellow-500 to-green-500";
  return "from-gray-400 to-gray-500";
}

/**
 * Get level badge emoji
 */
export function getLevelEmoji(level: number): string {
  if (level >= 10) return "👑";
  if (level >= 7) return "💎";
  if (level >= 5) return "⭐";
  if (level >= 3) return "🌟";
  return "✨";
}
