import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Sparkles, MapPin, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Match {
  id: string;
  match_score: number;
  created_at: string;
  job_offer_id: string;
  candidate_id: string;
  job_offers?: {
    title: string;
    city: string;
    sector: string;
    profiles: {
      full_name: string;
      avatar_url: string;
    };
  };
  profiles?: {
    full_name: string;
    avatar_url: string;
    job_title: string;
    city: string;
  };
}

interface MatchesListProps {
  userId: string;
  userRole: "candidate" | "recruiter";
}

export const MatchesList = ({ userId, userRole }: MatchesListProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadMatches();
  }, [userId, userRole]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      if (userRole === "candidate") {
        const { data, error } = await supabase
          .from("matches")
          .select(`
            *,
            job_offers!inner (
              title,
              city,
              sector,
              profiles:recruiter_id (
                full_name,
                avatar_url
              )
            )
          `)
          .eq("candidate_id", userId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        setMatches(data || []);
      } else {
        // For recruiters, get matches for their job offers
        const { data: jobOffers } = await supabase
          .from("job_offers")
          .select("id")
          .eq("recruiter_id", userId);
        
        if (!jobOffers || jobOffers.length === 0) {
          setMatches([]);
          return;
        }

        const offerIds = jobOffers.map(o => o.id);
        
        const { data: matchesData, error } = await supabase
          .from("matches")
          .select("*")
          .in("job_offer_id", offerIds)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        
        // Get candidate profiles separately
        if (matchesData && matchesData.length > 0) {
          const candidateIds = matchesData.map(m => m.candidate_id);
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, job_title, city")
            .in("id", candidateIds);
          
          // Combine matches with profiles
          const enrichedMatches = matchesData.map(match => ({
            ...match,
            profiles: profilesData?.find(p => p.id === match.candidate_id)
          }));
          
          setMatches(enrichedMatches as any);
        } else {
          setMatches([]);
        }
      }
    } catch (error) {
      console.error("Error loading matches:", error);
      toast.error("Errore nel caricamento dei match");
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async (match: Match) => {
    const otherUserId = userRole === "candidate" 
      ? match.job_offers?.profiles?.full_name 
      : match.profiles?.full_name;
    
    // Navigate to messages/chat (you may need to adjust this based on your routing)
    navigate("/dashboard", { state: { openChat: match.candidate_id } });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            I Tuoi Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            I Tuoi Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nessun match ancora. Inizia a swipare! 💫
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          I Tuoi Match ({matches.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {matches.map((match) => (
            <Card key={match.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                      {userRole === "candidate" ? (
                        <Sparkles className="h-6 w-6 text-primary" />
                      ) : (
                        <span className="text-2xl">👤</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">
                        {userRole === "candidate"
                          ? match.job_offers?.title
                          : match.profiles?.full_name}
                      </h4>
                      
                      {userRole === "candidate" ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {match.job_offers?.city}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {match.job_offers?.profiles?.full_name}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {match.profiles?.job_title}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {match.profiles?.city}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {match.match_score}% Match
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(match.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleMessage(match)}
                    className="flex-shrink-0"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
