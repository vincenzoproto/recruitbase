import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FeedWithTabs } from "@/components/social/FeedWithTabs";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { hapticFeedback } from "@/lib/haptics";

const Social = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [userRole, setUserRole] = useState<"recruiter" | "candidate">("recruiter");
  
  // Get post ID from query params for deep-linking
  const highlightPostId = searchParams.get('post');

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      if (profile?.role) {
        setUserRole(profile.role as "recruiter" | "candidate");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-bold">Community HR</h1>
              <p className="text-xs text-muted-foreground">Condividi e connetti</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <FeedWithTabs highlightPostId={highlightPostId || undefined} />
      </main>

      {isMobile && (
        <MobileBottomNav
          activeTab="feed"
          onTabChange={(tab) => {
            if (tab === "home") navigate("/dashboard");
            else if (tab === "pipeline") navigate("/dashboard");
            else if (tab === "profile") navigate("/profile");
            hapticFeedback.light();
          }}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default Social;
