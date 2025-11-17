import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CompletionItem {
  label: string;
  completed: boolean;
}

interface ProfileCompletionData {
  percentage: number;
  items: CompletionItem[];
}

export const useProfileCompletion = (userId: string | undefined) => {
  const [completion, setCompletion] = useState<ProfileCompletionData>({
    percentage: 0,
    items: []
  });
  const [loading, setLoading] = useState(true);

  const loadCompletion = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Get profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      // Get related data
      const { data: experiences } = await supabase
        .from("work_experiences")
        .select("id")
        .eq("candidate_id", userId);

      const { data: education } = await supabase
        .from("education_records")
        .select("id")
        .eq("candidate_id", userId);

      const { data: languages } = await supabase
        .from("candidate_languages")
        .select("id")
        .eq("candidate_id", userId);

      if (!profile) return;

      // Calculate completion items
      const items: CompletionItem[] = [
        {
          label: "Informazioni personali complete",
          completed: !!(profile.full_name && profile.city && profile.age)
        },
        {
          label: "Riepilogo professionale",
          completed: !!(profile.job_title && profile.seniority_level && profile.professional_summary)
        },
        {
          label: "Preferenze di lavoro",
          completed: !!(profile.desired_roles?.length && profile.contract_type_preference?.length && profile.salary_min)
        },
        {
          label: "Competenze (Hard & Soft Skills)",
          completed: !!(profile.skills?.length && profile.skills.length >= 3)
        },
        {
          label: "Lingue conosciute",
          completed: !!(languages && languages.length > 0)
        },
        {
          label: "Esperienze lavorative",
          completed: !!(experiences && experiences.length > 0)
        },
        {
          label: "Formazione",
          completed: !!(education && education.length > 0)
        },
        {
          label: "CV caricato",
          completed: !!profile.cv_url
        }
      ];

      const completedCount = items.filter(item => item.completed).length;
      const percentage = Math.round((completedCount / items.length) * 100);

      setCompletion({ percentage, items });
    } catch (error) {
      console.error("Error loading profile completion:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompletion();
  }, [userId]);

  return { ...completion, loading, refresh: loadCompletion };
};
