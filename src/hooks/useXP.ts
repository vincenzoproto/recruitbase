import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useXP = () => {
  const addXP = async (amount: number, reason?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profile) {
        // Show XP toast
        toast.success(`+${amount} XP${reason ? ` - ${reason}` : ""}`, {
          duration: 2000,
        });

        // Here you can implement actual XP tracking if needed
        // For now, just show the notification
        // You could add a user_xp table or xp field to profiles
      }
    } catch (error) {
      console.error("Error adding XP:", error);
    }
  };

  return { addXP };
};
