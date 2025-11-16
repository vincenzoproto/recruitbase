import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ADMIN_EMAIL = "digital.vincenzoproto@gmail.com";
const FREE_ACTION_LIMIT = 10;

interface ActionCount {
  message_sent: number;
  post_created: number;
  application_sent: number;
  profile_viewed: number;
  [key: string]: number;
}

export const useActionLimits = (userId: string | undefined) => {
  const [actionCounts, setActionCounts] = useState<ActionCount>({
    message_sent: 0,
    post_created: 0,
    application_sent: 0,
    profile_viewed: 0,
  });
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      checkUserStatus();
      loadActionCounts();
    }
  }, [userId]);

  const checkUserStatus = async () => {
    if (!userId) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", userId)
        .single();

      const { data: { user } } = await supabase.auth.getUser();
      
      setIsPremium(profile?.is_premium || false);
      setIsAdmin(user?.email === ADMIN_EMAIL);
    } catch (error) {
      console.error("Error checking user status:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadActionCounts = async () => {
    if (!userId) return;

    try {
      // Count actions from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: messages } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("sender_id", userId)
        .gte("created_at", today.toISOString());

      const { data: posts } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", today.toISOString());

      const { data: applications } = await supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("candidate_id", userId)
        .gte("applied_at", today.toISOString());

      const { data: views } = await supabase
        .from("profile_views")
        .select("id", { count: "exact", head: true })
        .eq("viewer_id", userId)
        .gte("created_at", today.toISOString());

      setActionCounts({
        message_sent: messages?.length || 0,
        post_created: posts?.length || 0,
        application_sent: applications?.length || 0,
        profile_viewed: views?.length || 0,
      });
    } catch (error) {
      console.error("Error loading action counts:", error);
    }
  };

  const canPerformAction = (actionType: keyof ActionCount): boolean => {
    if (isAdmin || isPremium) return true;

    const totalActions = Object.values(actionCounts).reduce((a, b) => a + b, 0);
    return totalActions < FREE_ACTION_LIMIT;
  };

  const trackAction = async (actionType: keyof ActionCount): Promise<boolean> => {
    if (isAdmin || isPremium) return true;

    if (!canPerformAction(actionType)) {
      toast.error("Limite azioni gratuite raggiunto", {
        description: "Passa a Premium per azioni illimitate!",
      });
      return false;
    }

    setActionCounts((prev) => ({
      ...prev,
      [actionType]: prev[actionType] + 1,
    }));

    return true;
  };

  const getRemainingActions = (): number => {
    if (isAdmin || isPremium) return -1; // unlimited
    const totalActions = Object.values(actionCounts).reduce((a, b) => a + b, 0);
    return Math.max(0, FREE_ACTION_LIMIT - totalActions);
  };

  return {
    canPerformAction,
    trackAction,
    getRemainingActions,
    actionCounts,
    isPremium,
    isAdmin,
    loading,
  };
};
