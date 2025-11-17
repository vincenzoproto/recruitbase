import { useEffect } from "react";
import { toast } from "sonner";
import { useProfileCompletion } from "./useProfileCompletion";

interface UseProfileNotificationsProps {
  userId: string | undefined;
  role: string | undefined;
}

export const useProfileNotifications = ({ userId, role }: UseProfileNotificationsProps) => {
  const { percentage, items, loading } = useProfileCompletion(userId);

  useEffect(() => {
    if (loading || role !== "candidate" || !userId) return;

    // Show notification based on completion percentage
    if (percentage === 100) {
      // Completed - congratulate (only once per session)
      const hasSeenComplete = sessionStorage.getItem(`profile_complete_${userId}`);
      if (!hasSeenComplete) {
        setTimeout(() => {
          toast.success("🎉 Profilo completato! Ottimo lavoro!", {
            description: "Il tuo Ranking AI è ora ottimizzato per i migliori match"
          });
          sessionStorage.setItem(`profile_complete_${userId}`, "true");
        }, 2000);
      }
    } else if (percentage >= 60 && percentage < 80) {
      // Medium completion - encourage to add more
      const hasSeenMedium = sessionStorage.getItem(`profile_medium_${userId}`);
      if (!hasSeenMedium) {
        setTimeout(() => {
          const missingItems = items.filter(item => !item.completed);
          if (missingItems.length > 0) {
            toast.info(`Il tuo profilo è al ${percentage}%`, {
              description: `Aggiungi ${missingItems[0].label.toLowerCase()} per un matching più preciso`
            });
            sessionStorage.setItem(`profile_medium_${userId}`, "true");
          }
        }, 3000);
      }
    } else if (percentage < 60) {
      // Low completion - remind to complete
      const hasSeenLow = sessionStorage.getItem(`profile_low_${userId}`);
      if (!hasSeenLow) {
        setTimeout(() => {
          toast.warning("⚠️ Completa il tuo profilo", {
            description: "Un profilo completo aumenta del 40% la visibilità ai recruiter"
          });
          sessionStorage.setItem(`profile_low_${userId}`, "true");
        }, 5000);
      }
    }

    // Check for specific missing sections
    const missingExperiences = items.find(item => item.label.includes("Esperienze") && !item.completed);
    const missingSkills = items.find(item => item.label.includes("Competenze") && !item.completed);

    if (missingExperiences && percentage < 80) {
      const hasSeenExpNotif = sessionStorage.getItem(`profile_exp_${userId}`);
      if (!hasSeenExpNotif) {
        setTimeout(() => {
          toast.info("💼 Ricordati di aggiungere le tue esperienze lavorative", {
            description: "Le esperienze aiutano i recruiter a valutarti meglio"
          });
          sessionStorage.setItem(`profile_exp_${userId}`, "true");
        }, 8000);
      }
    }

    if (missingSkills && percentage < 60) {
      const hasSeenSkillsNotif = sessionStorage.getItem(`profile_skills_${userId}`);
      if (!hasSeenSkillsNotif) {
        setTimeout(() => {
          toast.info("🎯 Aggiungi le tue competenze", {
            description: "Le competenze sono fondamentali per il matching AI"
          });
          sessionStorage.setItem(`profile_skills_${userId}`, "true");
        }, 6000);
      }
    }
  }, [percentage, items, loading, userId, role]);

  return { percentage, items };
};
