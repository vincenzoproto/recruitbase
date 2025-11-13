// Shared TypeScript types across the application

export interface Profile {
  id: string;
  full_name?: string;
  city?: string;
  job_title?: string;
  bio?: string;
  skills?: string[];
  avatar_url?: string;
  cv_url?: string;
  role?: 'recruiter' | 'candidate';
  years_experience?: number;
  education?: string;
  languages?: string;
  availability?: string;
  company_size?: string;
  industry?: string;
  degree_title?: string;
  core_values?: string[];
  phone_number?: string;
  linkedin_url?: string;
  referral_code?: string;
  email_verified?: boolean;
  linkedin_verified?: boolean;
  onboarding_completed?: boolean;
  is_premium?: boolean;
  talent_relationship_score?: number;
  is_favorite?: boolean;
  engagement_score?: number;
  last_contact_date?: string;
  pipeline_stage_id?: string;
  trs_last_updated?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JobOffer {
  id: string;
  title: string;
  city: string;
  sector: string;
  description: string;
  experience_level: ExperienceLevel;
  recruiter_id: string;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export type ExperienceLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'lead';

export interface Application {
  id: string;
  candidate_id: string;
  job_offer_id: string;
  status: ApplicationStatus;
  applied_at: string;
  updated_at?: string;
  feedback_type?: FeedbackType;
  feedback_notes?: string;
  job_offers?: {
    title: string;
    city: string;
    sector: string;
  };
}

export type ApplicationStatus = 'in_valutazione' | 'colloquio_programmato' | 'assunto' | 'non_idoneo';
export type FeedbackType = 'positivo' | 'negativo' | 'neutro';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
}

export type NotificationType = 
  | 'meeting_request'
  | 'meeting_confirmed'
  | 'new_message'
  | 'new_application'
  | 'application_status'
  | 'profile_view'
  | 'match'
  | 'match_found'
  | 'post_comment'
  | 'post_reaction';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface AmbassadorReferral {
  id: string;
  ambassador_id: string;
  referred_user_id: string;
  referral_code: string;
  status: 'pending' | 'active' | 'completed';
  signup_date: string;
  first_payment_date?: string;
}

export interface AmbassadorEarning {
  id: string;
  ambassador_id: string;
  referral_id: string;
  amount: number;
  status: 'pending' | 'paid';
  created_at: string;
  paid_at?: string;
}

export interface AmbassadorStats {
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  completedReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
}

export type BadgeType = 
  | 'profile_complete'
  | 'first_application'
  | 'email_verified'
  | 'linkedin_verified'
  | 'premium_user'
  | 'ambassador';

export interface Achievement {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  earned_at: string;
}

export type PlanType = 'free' | 'pro' | 'business' | 'enterprise';
