import type { PlanType } from '@/types';
import { FEATURES, canAccessFeature } from './constants/features';

export interface FeatureGateResult {
  hasAccess: boolean;
  requiredPlan?: PlanType;
  featureName?: string;
}

export const checkFeatureAccess = (
  userPlan: PlanType,
  featureId: string
): FeatureGateResult => {
  const feature = FEATURES[featureId];
  
  if (!feature) {
    return { hasAccess: true };
  }

  const hasAccess = canAccessFeature(userPlan, feature.requiredPlan);
  
  return {
    hasAccess,
    requiredPlan: hasAccess ? undefined : feature.requiredPlan,
    featureName: feature.name,
  };
};

export const getPlanType = (profile: any): PlanType => {
  if (!profile) return 'free';
  
  // Check subscription status or is_premium flag
  if (profile.subscription_plan) {
    return profile.subscription_plan as PlanType;
  }
  
  if (profile.is_premium) {
    return 'pro'; // Default premium to pro
  }
  
  return 'free';
};