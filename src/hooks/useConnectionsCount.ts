import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useConnectionsCount = (userId: string | undefined) => {
  const [counts, setCounts] = useState({
    followers: 0,
    following: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadCounts();
    }
  }, [userId]);

  const loadCounts = async () => {
    if (!userId) return;

    try {
      const [followersRes, followingRes, pendingRes] = await Promise.all([
        supabase
          .from("connections")
          .select("id", { count: "exact", head: true })
          .eq("following_id", userId)
          .eq("status", "accepted"),
        supabase
          .from("connections")
          .select("id", { count: "exact", head: true })
          .eq("follower_id", userId)
          .eq("status", "accepted"),
        supabase
          .from("connections")
          .select("id", { count: "exact", head: true })
          .eq("following_id", userId)
          .eq("status", "pending"),
      ]);

      setCounts({
        followers: followersRes.count || 0,
        following: followingRes.count || 0,
        pending: pendingRes.count || 0,
      });
    } catch (error) {
      console.error("Error loading connections count:", error);
    } finally {
      setLoading(false);
    }
  };

  return { counts, loading, refresh: loadCounts };
};
