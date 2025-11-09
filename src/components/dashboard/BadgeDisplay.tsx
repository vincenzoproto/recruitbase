import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle2, Mail, Linkedin, Crown, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Achievement {
  badge_type: string;
  earned_at: string;
}

const badgeConfig: Record<string, { icon: any; label: string; color: string; description: string }> = {
  profile_complete: {
    icon: CheckCircle2,
    label: "Profilo Completo",
    color: "text-green-500",
    description: "Hai completato il tuo profilo"
  },
  first_application: {
    icon: Award,
    label: "Prima Candidatura",
    color: "text-blue-500",
    description: "Hai inviato la tua prima candidatura"
  },
  email_verified: {
    icon: Mail,
    label: "Email Verificata",
    color: "text-purple-500",
    description: "Hai verificato il tuo indirizzo email"
  },
  linkedin_verified: {
    icon: Linkedin,
    label: "LinkedIn Connesso",
    color: "text-blue-600",
    description: "Hai collegato il tuo profilo LinkedIn"
  },
  premium_user: {
    icon: Crown,
    label: "Utente Premium",
    color: "text-yellow-500",
    description: "Sei un membro premium"
  },
  ambassador: {
    icon: Users,
    label: "Ambassador",
    color: "text-primary",
    description: "Sei un ambassador attivo"
  }
};

export const BadgeDisplay = ({ userId }: { userId: string }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    try {
      const { data } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", userId)
        .order("earned_at", { ascending: false });

      setAchievements(data || []);
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-muted rounded-lg" />;
  }

  if (achievements.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 glass-card border-primary/20">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Award className="h-5 w-5 text-primary" />
        I Tuoi Badge
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const config = badgeConfig[achievement.badge_type];
          if (!config) return null;

          const Icon = config.icon;
          
          return (
            <div
              key={achievement.badge_type}
              className="flex flex-col items-center p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-all smooth-transition"
            >
              <div className={`p-3 rounded-full bg-background/80 mb-2 ${config.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-center">{config.label}</p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                {config.description}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
