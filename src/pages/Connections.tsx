import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, UserPlus, UserMinus, Check, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { ProfileBadge } from "@/components/profile/ProfileBadge";
import { useConnectionsCount } from "@/hooks/useConnectionsCount";

interface Connection {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  job_title?: string;
  role: string;
  status: string;
  created_at: string;
}

const Connections = () => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [followers, setFollowers] = useState<Connection[]>([]);
  const [following, setFollowing] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const { counts } = useConnectionsCount(currentUserId);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      loadConnections(user.id);
    }
  };

  const loadConnections = async (userId: string) => {
    setLoading(true);
    try {
      // Load followers (people who follow me)
      const { data: followersData } = await supabase
        .from("connections")
        .select(`
          id,
          follower_id,
          status,
          created_at,
          profiles!connections_follower_id_fkey(id, full_name, avatar_url, job_title, role)
        `)
        .eq("following_id", userId)
        .eq("status", "accepted");

      // Load following (people I follow)
      const { data: followingData } = await supabase
        .from("connections")
        .select(`
          id,
          following_id,
          status,
          created_at,
          profiles!connections_following_id_fkey(id, full_name, avatar_url, job_title, role)
        `)
        .eq("follower_id", userId)
        .eq("status", "accepted");

      // Load pending requests (requests I received)
      const { data: pendingData } = await supabase
        .from("connections")
        .select(`
          id,
          follower_id,
          status,
          created_at,
          profiles!connections_follower_id_fkey(id, full_name, avatar_url, job_title, role)
        `)
        .eq("following_id", userId)
        .eq("status", "pending");

      setFollowers(
        followersData?.map((c: any) => ({
          id: c.id,
          user_id: c.profiles.id,
          full_name: c.profiles.full_name,
          avatar_url: c.profiles.avatar_url,
          job_title: c.profiles.job_title,
          role: c.profiles.role,
          status: c.status,
          created_at: c.created_at
        })) || []
      );

      setFollowing(
        followingData?.map((c: any) => ({
          id: c.id,
          user_id: c.profiles.id,
          full_name: c.profiles.full_name,
          avatar_url: c.profiles.avatar_url,
          job_title: c.profiles.job_title,
          role: c.profiles.role,
          status: c.status,
          created_at: c.created_at
        })) || []
      );

      setPendingRequests(
        pendingData?.map((c: any) => ({
          id: c.id,
          user_id: c.profiles.id,
          full_name: c.profiles.full_name,
          avatar_url: c.profiles.avatar_url,
          job_title: c.profiles.job_title,
          role: c.profiles.role,
          status: c.status,
          created_at: c.created_at
        })) || []
      );
    } catch (error) {
      console.error("Error loading connections:", error);
      toast.error("Errore nel caricamento delle connessioni");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("id", connectionId);

      if (error) throw error;

      toast.success("Richiesta accettata");
      loadConnections(currentUserId);
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Errore nell'accettare la richiesta");
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from("connections")
        .delete()
        .eq("id", connectionId);

      if (error) throw error;

      toast.success("Richiesta rifiutata");
      loadConnections(currentUserId);
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Errore nel rifiutare la richiesta");
    }
  };

  const handleUnfollow = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from("connections")
        .delete()
        .eq("id", connectionId);

      if (error) throw error;

      toast.success("Connessione rimossa");
      loadConnections(currentUserId);
    } catch (error) {
      console.error("Error unfollowing:", error);
      toast.error("Errore nella rimozione della connessione");
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

  const renderConnectionCard = (
    connection: Connection,
    showUnfollow: boolean = false,
    showAcceptReject: boolean = false
  ) => (
    <div
      key={connection.id}
      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={() => navigate(`/profile/${connection.user_id}`)}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={connection.avatar_url} alt={connection.full_name} />
          <AvatarFallback>{getInitials(connection.full_name)}</AvatarFallback>
        </Avatar>
        <ProfileBadge userId={connection.user_id} size="sm" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold">{connection.full_name}</h3>
        {connection.job_title && (
          <p className="text-sm text-muted-foreground">{connection.job_title}</p>
        )}
        <Badge variant="secondary" className="mt-1">
          {connection.role === "recruiter" ? "Recruiter" : "Candidato"}
        </Badge>
      </div>

      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        {showAcceptReject && (
          <>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleAcceptRequest(connection.id)}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRejectRequest(connection.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}

        {showUnfollow && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUnfollow(connection.id)}
          >
            <UserMinus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Le Mie Connessioni
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="followers">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="followers">
                  Followers ({counts.followers})
                </TabsTrigger>
                <TabsTrigger value="following">
                  Following ({counts.following})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Richieste ({counts.pending})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="followers" className="space-y-4 mt-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Caricamento...
                  </div>
                ) : followers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nessun follower
                  </div>
                ) : (
                  followers.map(conn => renderConnectionCard(conn))
                )}
              </TabsContent>

              <TabsContent value="following" className="space-y-4 mt-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Caricamento...
                  </div>
                ) : following.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Non segui nessuno
                  </div>
                ) : (
                  following.map(conn => renderConnectionCard(conn, true))
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4 mt-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Caricamento...
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nessuna richiesta in sospeso
                  </div>
                ) : (
                  pendingRequests.map(conn => renderConnectionCard(conn, false, true))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Connections;
