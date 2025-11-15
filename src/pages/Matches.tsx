import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { TinderMatch } from "@/components/match/TinderMatch";

const Matches = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"recruiter" | "candidate">("recruiter");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserId(user.id);
        setUserRole(profile.role as "recruiter" | "candidate");
      }
    } catch (error) {
      console.error("Error loading user:", error);
      navigate("/auth");
    }
  };

  if (!userId) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <TinderMatch userId={userId} userRole={userRole} />
      </div>
    </MainLayout>
  );
};

export default Matches;
