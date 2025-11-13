// Badge configuration
import { Award, CheckCircle2, Mail, Linkedin, Crown, Users } from 'lucide-react';
import type { BadgeType } from '@/types';

export interface BadgeConfig {
  icon: any;
  label: string;
  color: string;
  description: string;
}

export const BADGE_CONFIG: Record<BadgeType, BadgeConfig> = {
  profile_complete: {
    icon: CheckCircle2,
    label: 'Profilo Completo',
    color: 'text-green-500',
    description: 'Hai completato il tuo profilo'
  },
  first_application: {
    icon: Award,
    label: 'Prima Candidatura',
    color: 'text-blue-500',
    description: 'Hai inviato la tua prima candidatura'
  },
  email_verified: {
    icon: Mail,
    label: 'Email Verificata',
    color: 'text-purple-500',
    description: 'Hai verificato il tuo indirizzo email'
  },
  linkedin_verified: {
    icon: Linkedin,
    label: 'LinkedIn Connesso',
    color: 'text-blue-600',
    description: 'Hai collegato il tuo profilo LinkedIn'
  },
  premium_user: {
    icon: Crown,
    label: 'Utente Premium',
    color: 'text-yellow-500',
    description: 'Sei un membro premium'
  },
  ambassador: {
    icon: Users,
    label: 'Ambassador',
    color: 'text-primary',
    description: 'Sei un ambassador attivo'
  }
};
