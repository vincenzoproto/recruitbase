import type { Profile, PlanType } from '@/types';

/**
 * Get user's plan type from profile
 */
export const getPlanType = (profile: Profile | null): PlanType => {
  if (!profile) return 'free';
  
  // Fallback to is_premium (subscription_plan doesn't exist in DB)
  if (profile.is_premium) {
    return 'pro';
  }
  
  return 'free';
};

/**
 * Calculate stable culture fit score (based on core_values)
 */
export const calculateCultureFit = (profile: Profile): number => {
  if (profile.core_values && profile.core_values.length > 0) {
    return Math.min(95, 60 + profile.core_values.length * 5);
  }
  
  return 0;
}

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