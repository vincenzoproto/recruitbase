import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost_xp: number;
  icon: string;
  category: string;
  stock: number | null;
  is_active: boolean;
}

export interface RewardClaim {
  id: string;
  reward_id: string;
  user_id: string;
  claimed_at: string;
  status: string;
  expires_at: string | null;
  metadata: any;
  reward_items?: Reward;
}

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [userXP, setUserXP] = useState(0);

  useEffect(() => {
    loadRewards();
    loadUserXP();
    loadClaims();
  }, []);

  const loadRewards = async () => {
    try {
      const { data, error } = await supabase
        .from("reward_items")
        .select("*")
        .eq("is_active", true)
        .order("cost_xp", { ascending: true });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error("Error loading rewards:", error);
      toast.error("Errore nel caricamento premi");
    } finally {
      setLoading(false);
    }
  };

  const loadUserXP = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("xp")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setUserXP(data?.xp || 0);
    } catch (error) {
      console.error("Error loading user XP:", error);
    }
  };

  const loadClaims = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("reward_claims")
        .select(`
          *,
          reward_items (*)
        `)
        .eq("user_id", user.id)
        .order("claimed_at", { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      console.error("Error loading claims:", error);
    }
  };

  const claimReward = async (rewardId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Devi effettuare l'accesso");
        return false;
      }

      const { data, error } = await supabase.rpc("claim_reward", {
        p_user_id: user.id,
        p_reward_id: rewardId,
      });

      if (error) throw error;

      const result = data as any;
      
      if (!result.success) {
        if (result.error === "Insufficient XP") {
          toast.error("XP insufficienti!");
        } else if (result.error === "Out of stock") {
          toast.error("Premio esaurito!");
        } else {
          toast.error(result.error || "Errore nel riscatto");
        }
        return false;
      }

      toast.success(`🎉 ${result.reward_name} riscattato!`, {
        description: `Hai speso ${result.xp_spent} XP`,
      });

      // Refresh data
      await loadUserXP();
      await loadClaims();
      await loadRewards();

      return true;
    } catch (error: any) {
      console.error("Error claiming reward:", error);
      toast.error("Errore nel riscattare il premio");
      return false;
    }
  };

  return {
    rewards,
    claims,
    loading,
    userXP,
    claimReward,
    refresh: () => {
      loadRewards();
      loadUserXP();
      loadClaims();
    },
  };
}
