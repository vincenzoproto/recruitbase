import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, UserPlus, UserCheck, UserX, Eye } from "lucide-react";
import { toast } from "sonner";
import { ProfileBadge } from "@/components/profile/ProfileBadge";

interface SearchResult {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  role: "recruiter" | "candidate" | "admin";
  job_title?: string;
  city?: string;
  connectionStatus?: "none" | "accepted";
}

const SearchPeople = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (searchQuery && currentUserId) {
      performSearch();
    }
  }, [searchQuery, currentUserId]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      // Search profiles - show all users (including current user for testing)
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio, role, job_title, city")
        .or(`full_name.ilike.%${searchQuery}%,job_title.ilike.%${searchQuery}%`)
        .limit(50);

      if (error) throw error;

      // Load connection statuses
      if (profiles) {
        const userIds = profiles.map(p => p.id);
        const { data: connections } = await supabase
          .from("connections")
          .select("following_id, status")
          .eq("follower_id", currentUserId)
          .in("following_id", userIds);

        const connectionMap = new Map(
          connections?.map(c => [c.following_id, c.status]) || []
        );

        const resultsWithStatus: SearchResult[] = profiles.map(profile => ({
          ...profile,
          connectionStatus: (connectionMap.get(profile.id) as "accepted") || "none"
        }));

        setResults(resultsWithStatus);
      }
    } catch (error) {
      console.error("Error searching people:", error);
      toast.error("Errore nella ricerca");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("connections")
        .insert({
          follower_id: currentUserId,
          following_id: userId,
          status: "accepted" // Direct follow without approval
        });

      if (error) throw error;

      toast.success("Ora segui questo utente");
      setResults(prev => 
        prev.map(r => r.id === userId ? { ...r, connectionStatus: "accepted" } : r)
      );
    } catch (error: any) {
      console.error("Error following user:", error);
      if (error.code === "23505") {
        toast.error("Segui già questo utente");
      } else {
        toast.error("Errore nel seguire l'utente");
      }
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("connections")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", userId);

      if (error) throw error;

      toast.success("Non segui più questo utente");
      setResults(prev => 
        prev.map(r => r.id === userId ? { ...r, connectionStatus: "none" } : r)
      );
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("Errore nello smettere di seguire");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>

          <form onSubmit={(e) => { e.preventDefault(); performSearch(); }} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cerca persone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Risultati della ricerca</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Caricamento...
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nessun risultato trovato
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={person.avatar_url} alt={person.full_name} />
                        <AvatarFallback>{getInitials(person.full_name)}</AvatarFallback>
                      </Avatar>
                      <ProfileBadge userId={person.id} size="sm" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{person.full_name}</h3>
                        <Badge variant="outline" className="shrink-0 font-semibold">
                          {person.role === 'recruiter' ? '👔 Recruiter' : '👤 Candidato'}
                        </Badge>
                      </div>
                      {person.job_title && (
                        <p className="text-sm text-muted-foreground">{person.job_title}</p>
                      )}
                      {person.city && (
                        <p className="text-xs text-muted-foreground">{person.city}</p>
                      )}
                      {person.bio && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {person.bio}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/profile/${person.id}`)}
                        title="Visualizza Profilo"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {person.connectionStatus === "none" && (
                        <Button
                          variant="default"
                          size="icon"
                          onClick={() => handleFollow(person.id)}
                          title="Segui"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      )}

                      {person.connectionStatus === "accepted" && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUnfollow(person.id)}
                          title="Segui già"
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SearchPeople;
