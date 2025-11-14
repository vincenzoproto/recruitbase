import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OnlineStatus {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
}

export const useOnlineStatus = (userIds: string[]) => {
  const [statuses, setStatuses] = useState<Map<string, OnlineStatus>>(new Map());

  useEffect(() => {
    if (userIds.length === 0) return;

    const channel = supabase.channel("online-users");

    // Subscribe to presence
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const newStatuses = new Map<string, OnlineStatus>();

        Object.keys(state).forEach((userId) => {
          if (userIds.includes(userId)) {
            newStatuses.set(userId, {
              userId,
              isOnline: true,
            });
          }
        });

        // Mark users not in presence as offline
        userIds.forEach((userId) => {
          if (!newStatuses.has(userId)) {
            newStatuses.set(userId, {
              userId,
              isOnline: false,
              lastSeen: new Date().toISOString(),
            });
          }
        });

        setStatuses(newStatuses);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Track current user presence
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userIds.join(",")]);

  const getStatus = (userId: string): OnlineStatus => {
    return statuses.get(userId) || {
      userId,
      isOnline: false,
    };
  };

  return { statuses, getStatus };
};
