// Feature gating configuration
import type { PlanType } from '@/types';

export interface FeatureConfig {
  id: string;
  name: string;
  requiredPlan: PlanType;
  description?: string;
}

export const FEATURES: Record<string, FeatureConfig> = {
  AI_COPILOT: {
    id: 'copilot',
    name: 'Copilot AI',
    requiredPlan: 'pro',
    description: 'Assistente AI per suggerimenti personalizzati'
  },
  SOCIAL_FEED: {
    id: 'feed',
    name: 'Feed sociale',
    requiredPlan: 'business',
    description: 'Accesso al feed sociale professionale'
  },
  ANALYTICS: {
    id: 'analytics',
    name: 'Analytics & Insight',
    requiredPlan: 'business',
    description: 'Analytics avanzate e insight predittivi'
  },
  TEAM_MANAGEMENT: {
    id: 'team',
    name: 'Gestione team',
    requiredPlan: 'enterprise',
    description: 'Gestione del team aziendale'
  },
  AMBASSADORS: {
    id: 'ambassadors',
    name: 'Programma Ambassadors',
    requiredPlan: 'enterprise',
    description: 'Rete di ambassador aziendali'
  }
};

export const canAccessFeature = (userPlan: PlanType, requiredPlan: PlanType): boolean => {
  const planHierarchy: Record<PlanType, number> = {
    free: 0,
    pro: 1,
    business: 2,
    enterprise: 3
  };

  return planHierarchy[userPlan] >= planHierarchy[requiredPlan];
};

export const STRIPE_PRO_LINK = "https://buy.stripe.com/7sYfZh2br4aUfNW24GabK00";
export const STRIPE_BUSINESS_LINK = "https://buy.stripe.com/business-link"; // TODO: Update with real link
export const STRIPE_ENTERPRISE_LINK = "https://buy.stripe.com/enterprise-link"; // TODO: Update with real link
