import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TinderMatch } from "@/components/match/TinderMatch";
import { MatchesList } from "@/components/match/MatchesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Matches() {
  const [userId, setUserId] = useState<string>("");
  const [userRole, setUserRole] = useState<"candidate" | "recruiter">("candidate");
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        const role = profile.role as "candidate" | "recruiter";
        if (role === "candidate" || role === "recruiter") {
          setUserRole(role);
        }
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isMobile ? 'pb-20' : ''}`}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Briefcase className="h-8 w-8 text-primary" />
            Match
          </h1>
          <p className="text-muted-foreground">
            {userRole === "candidate" 
              ? "Trova le opportunità perfette per te" 
              : "Trova i candidati ideali per le tue offerte"}
          </p>
        </div>

        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="discover">Scopri</TabsTrigger>
            <TabsTrigger value="mymatches">I Miei Match</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover" className="space-y-4">
            <TinderMatch userId={userId} userRole={userRole} />
          </TabsContent>
          
          <TabsContent value="mymatches" className="space-y-4">
            <MatchesList userId={userId} userRole={userRole} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
