import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCandidatePoints = () => {
  const awardPoints = async (
    userId: string,
    actionType: string,
    points: number,
    description?: string
  ) => {
    try {
      // Verifica se esiste già un record per questo candidato
      const { data: existing } = await supabase
        .from("recruiter_points")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!existing) {
        // Crea nuovo record
        const { error: insertError } = await supabase
          .from("recruiter_points")
          .insert({
            user_id: userId,
            points: points,
            level: "Bronze",
            level_progress: 0
          });

        if (insertError) throw insertError;
      } else {
        // Aggiorna punti esistenti
        const newPoints = Math.max(0, existing.points + points);
        let newLevel = existing.level;
        let newProgress = 0;

        // Calcola livello
        if (newPoints >= 1000) {
          newLevel = "Platinum";
          newProgress = ((newPoints - 1000) * 100) / 1000;
        } else if (newPoints >= 500) {
          newLevel = "Gold";
          newProgress = ((newPoints - 500) * 100) / 500;
        } else if (newPoints >= 200) {
          newLevel = "Silver";
          newProgress = ((newPoints - 200) * 100) / 300;
        } else {
          newLevel = "Bronze";
          newProgress = (newPoints * 100) / 200;
        }

        const { error: updateError } = await supabase
          .from("recruiter_points")
          .update({
            points: newPoints,
            level: newLevel,
            level_progress: Math.min(100, newProgress),
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId);

        if (updateError) throw updateError;
      }

      // Registra l'azione
      await supabase.from("recruiter_actions").insert({
        user_id: userId,
        action_type: actionType,
        points: points,
        description: description || null
      });

      if (points > 0) {
        toast.success(`🏆 +${points} punti!`, {
          description: description || actionType,
          duration: 2000,
        });
      }

      return true;
    } catch (error) {
      console.error("Error awarding candidate points:", error);
      return false;
    }
  };

  return { awardPoints };
};
