import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useXP = () => {
  const addXP = async (amount: number, description?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profile) {
        // You can implement XP tracking here if needed
        toast.success(`+${amount} XP ${description ? `- ${description}` : ""}`);
      }
    } catch (error) {
      console.error("Error adding XP:", error);
    }
  };

  return { addXP };
};
