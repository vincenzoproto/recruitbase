import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRecruiterPoints = () => {
  const awardPoints = async (
    userId: string,
    actionType: string,
    points: number,
    description?: string
  ) => {
    try {
      const { error } = await supabase.rpc('award_recruiter_points', {
        p_user_id: userId,
        p_action_type: actionType,
        p_points: points,
        p_description: description || null,
      });

      if (error) throw error;

      if (points > 0) {
        toast.success(`🏆 +${points} punti!`, {
          description: description || actionType,
          duration: 2000,
        });
      } else if (points < 0) {
        toast.info(`${points} punti`, {
          description: description || actionType,
          duration: 2000,
        });
      }

      return true;
    } catch (error) {
      console.error('Error awarding points:', error);
      return false;
    }
  };

  return { awardPoints };
};
