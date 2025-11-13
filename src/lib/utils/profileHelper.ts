import type { Profile, PlanType } from '@/types';

/**
 * Get user's plan type from profile
 */
export const getPlanType = (profile: Profile | null): PlanType => {
  if (!profile) return 'free';
  
  // Check if there's an explicit subscription_plan field
  if ('subscription_plan' in profile && profile.subscription_plan) {
    return profile.subscription_plan as PlanType;
  }
  
  // Fallback to is_premium
  if (profile.is_premium) {
    return 'pro';
  }
  
  return 'free';
};

/**
 * Calculate stable culture fit score
 */
export const calculateCultureFit = (profile: Profile): number => {
  if (profile.culture_fit_score !== undefined && profile.culture_fit_score !== null) {
    return Math.min(100, Math.max(0, profile.culture_fit_score));
  }
  
  if (profile.core_values && profile.core_values.length > 0) {
    return Math.min(95, 60 + profile.core_values.length * 5);
  }
  
  return 0;
};

/**
 * Get user initials from full name
 */
export const getInitials = (fullName: string): string => {
  return fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';
};