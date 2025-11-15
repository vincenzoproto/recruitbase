import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFollowUser = (currentUserId: string | null, targetUserId: string | undefined) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUserId && targetUserId && currentUserId !== targetUserId) {
      checkFollowStatus();
    }
  }, [currentUserId, targetUserId]);

  const checkFollowStatus = async () => {
    if (!currentUserId || !targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .eq('status', 'accepted')
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const toggleFollow = async () => {
    if (!currentUserId || !targetUserId) return;
    
    setLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('connections')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', targetUserId);

        if (error) throw error;
        setIsFollowing(false);
        toast.success('Non segui più questo utente');
        return -1; // Return -1 to decrease follower count
      } else {
        // Follow - directly set as accepted (no approval needed)
        const { error } = await supabase
          .from('connections')
          .insert({
            follower_id: currentUserId,
            following_id: targetUserId,
            status: 'accepted'
          });

        if (error) throw error;
        setIsFollowing(true);
        toast.success('Ora segui questo utente');
        return 1; // Return 1 to increase follower count
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Errore nel seguire/smettere di seguire');
      return 0;
    } finally {
      setLoading(false);
    }
  };

  return {
    isFollowing,
    loading,
    toggleFollow,
    refetch: checkFollowStatus
  };
};
