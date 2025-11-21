export type Language = "it" | "en";

export const translations = {
  it: {
    hero: {
      title: "Il primo Talent Relationship Manager per recruiter moderni.",
      cta: "Scopri come funziona →",
    },
    splash: {
      loading: "Connessione dei talenti in corso...",
    },
    auth: {
      title: "Benvenuto",
      subtitle: "Accedi al tuo account",
      email: "Email",
      password: "Password",
      login: "Accedi",
      signup: "Registrati",
      biometric: "Accedi con impronta digitale",
      secure: "Login sicuro – dati criptati e protetti",
      forgotPassword: "Password dimenticata?",
    },
    onboarding: {
      welcome: "Benvenuto in Pausilio",
      skip: "Salta onboarding",
      next: "Avanti",
      start: "Inizia",
      step1: {
        title: "Crea la tua prima pipeline",
        description: "Organizza i candidati in colonne personalizzabili per tracciare ogni fase del processo.",
      },
      step2: {
        title: "Aggiungi un candidato",
        description: "Importa profili, aggiungi note e costruisci relazioni autentiche.",
      },
      step3: {
        title: "Scopri il tuo primo TRS™",
        description: "Il nostro algoritmo proprietario misura la qualità delle tue relazioni.",
      },
    },
    kpi: {
      avgTRS: "TRS medio settimanale",
      activeCandidates: "Candidati attivi",
      followUps: "Follow-up inviati",
    },
    menu: {
      profile: "Profilo personale",
      matches: "Match Candidati",
      pipeline: "Pipeline",
      offers: "Gestione offerte",
      analytics: "Analytics",
      calendar: "Calendario",
      feed: "Feed Social",
      connections: "Connessioni",
      messages: "Messaggi",
      notifications: "Notifiche",
      settings: "Impostazioni",
      rewards: "Marketplace Premi",
      badges: "Badge e Livelli",
      career: "Carriera",
      savedOffers: "Offerte salvate",
      applications: "Candidature",
    },
    footer: "Pausilio™ — Il TRM veloce e intelligente.",
  },
  en: {
    hero: {
      title: "The first Talent Relationship Manager for modern recruiters.",
      cta: "Learn how it works →",
    },
    splash: {
      loading: "Connecting talents...",
    },
    auth: {
      title: "Welcome",
      subtitle: "Sign in to your account",
      email: "Email",
      password: "Password",
      login: "Sign In",
      signup: "Sign Up",
      biometric: "Sign in with fingerprint",
      secure: "Secure login – encrypted and protected data",
      forgotPassword: "Forgot password?",
    },
    onboarding: {
      welcome: "Welcome to Pausilio",
      skip: "Skip onboarding",
      next: "Next",
      start: "Start",
      step1: {
        title: "Create your first pipeline",
        description: "Organize candidates in customizable columns to track every stage.",
      },
      step2: {
        title: "Add a candidate",
        description: "Import profiles, add notes, and build authentic relationships.",
      },
      step3: {
        title: "Discover your first TRS™",
        description: "Our proprietary algorithm measures the quality of your relationships.",
      },
    },
    kpi: {
      avgTRS: "Weekly avg TRS",
      activeCandidates: "Active candidates",
      followUps: "Follow-ups sent",
    },
    menu: {
      profile: "Personal Profile",
      matches: "Candidate Matches",
      pipeline: "Pipeline",
      offers: "Manage Offers",
      analytics: "Analytics",
      calendar: "Calendar",
      feed: "Social Feed",
      connections: "Connections",
      messages: "Messages",
      notifications: "Notifications",
      settings: "Settings",
      rewards: "Rewards Marketplace",
      badges: "Badges & Levels",
      career: "Career",
      savedOffers: "Saved Offers",
      applications: "Applications",
    },
    footer: "Pausilio™ — Fast and smart TRM.",
  },
};

export const useTranslation = (lang: Language = "it") => {
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[lang];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return { t };
};
