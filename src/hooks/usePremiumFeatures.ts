import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PlanType = "free" | "pro" | "business" | "enterprise";

interface PremiumFeatures {
  planType: PlanType;
  canAccessCopilot: boolean;
  canAccessFeed: boolean;
  canAccessAnalytics: boolean;
  canAccessTeamManagement: boolean;
  maxJobOffers: number;
  maxMessagesPerMonth: number;
  hasVideoCalls: boolean;
  hasPrioritySupport: boolean;
}

export const usePremiumFeatures = (userId: string | undefined): PremiumFeatures => {
  const [planType, setPlanType] = useState<PlanType>("free");
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const loadSubscription = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", userId)
        .single();

      if (profile?.is_premium) {
        setIsPremium(true);
        // In a real scenario, you'd fetch the actual plan from subscriptions table
        // For now, premium users get "pro" features
        setPlanType("pro");
      } else {
        setIsPremium(false);
        setPlanType("free");
      }
    };

    loadSubscription();

    // Real-time subscription to profile changes
    const channel = supabase
      .channel('profile-premium-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          const updatedProfile = payload.new as any;
          setIsPremium(updatedProfile.is_premium || false);
          setPlanType(updatedProfile.is_premium ? "pro" : "free");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Feature matrix based on plan (adjusted for candidates)
  const features: Record<PlanType, PremiumFeatures> = {
    free: {
      planType: "free",
      canAccessCopilot: false,
      canAccessFeed: false,
      canAccessAnalytics: false,
      canAccessTeamManagement: false,
      maxJobOffers: 1,
      maxMessagesPerMonth: 10,
      hasVideoCalls: false,
      hasPrioritySupport: false,
    },
    pro: {
      planType: "pro",
      canAccessCopilot: true,
      canAccessFeed: true, // Candidates get feed access at Pro
      canAccessAnalytics: false,
      canAccessTeamManagement: false,
      maxJobOffers: -1, // unlimited
      maxMessagesPerMonth: -1,
      hasVideoCalls: true,
      hasPrioritySupport: false,
    },
    business: {
      planType: "business",
      canAccessCopilot: true,
      canAccessFeed: true,
      canAccessAnalytics: true,
      canAccessTeamManagement: false,
      maxJobOffers: -1,
      maxMessagesPerMonth: -1,
      hasVideoCalls: true,
      hasPrioritySupport: true,
    },
    enterprise: {
      planType: "enterprise",
      canAccessCopilot: true,
      canAccessFeed: true,
      canAccessAnalytics: true,
      canAccessTeamManagement: true,
      maxJobOffers: -1,
      maxMessagesPerMonth: -1,
      hasVideoCalls: true,
      hasPrioritySupport: true,
    },
  };

  return features[planType];
};