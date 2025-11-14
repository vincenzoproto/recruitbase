import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Mail, Phone, Linkedin, Edit, FileText, Users, Award } from "lucide-react";
import { toast } from "sonner";
import EditProfileDialog from "@/components/dashboard/EditProfileDialog";
import { CVUploader } from "@/components/candidate/CVUploader";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProfileBadge } from "@/components/profile/ProfileBadge";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [showCVUploader, setShowCVUploader] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    loadProfile();
    getCurrentUser();
  }, [userId]);

  useEffect(() => {
    if (profile?.id) {
      loadConnections();
    }
  }, [profile?.id]);

  const loadConnections = async () => {
    if (!profile?.id) return;

    try {
      const { count: followersCount } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile.id)
        .eq('status', 'accepted');

      const { count: followingCount } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profile.id)
        .eq('status', 'accepted');

      setFollowersCount(followersCount || 0);
      setFollowingCount(followingCount || 0);
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadProfile = async () => {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;

      if (!targetUserId) {
        toast.error("Utente non trovato");
        navigate("/dashboard");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", targetUserId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Errore nel caricamento del profilo");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = () => {
    if (profile?.id) {
      navigate("/messages", { state: { userId: profile.id }});
    }
  };

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  };

  const isOwnProfile = currentUserId === profile?.id;

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-2xl mx-auto p-4 space-y-6">

        {/* HEADER */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
              <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
              {profile?.job_title && (
                <p className="text-muted-foreground">
                  {profile.job_title}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <ProfileBadge userId={profile?.id} size="sm" />
              </div>
            </div>

            {isOwnProfile && (
              <Button size="sm" onClick={() => setEditOpen(true)}>
                <Edit className="h-4 w-4 mr-1" /> Modifica
              </Button>
            )}
          </CardHeader>
        </Card>

        {/* INFO */}
        <Card>
          <CardContent className="space-y-4 pt-6">

            {profile?.city && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {profile.city}
              </p>
            )}

            {profile?.phone_number && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a href={`tel:${profile.phone_number}`}>{profile.phone_number}</a>
              </p>
            )}

            {profile?.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                className="flex items-center gap-2 text-primary hover:underline"
                rel="noreferrer"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            )}
          </CardContent>
        </Card>

        {/* BIO */}
        {profile?.bio && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Bio</h3>
              <p className="text-muted-foreground">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* CONNECTIONS */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Connessioni
            </h3>
            <div className="flex gap-4">
              <div 
                className="cursor-pointer hover:opacity-80" 
                onClick={() => navigate('/connections')}
              >
                <p className="text-2xl font-bold">{followersCount}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div 
                className="cursor-pointer hover:opacity-80" 
                onClick={() => navigate('/connections')}
              >
                <p className="text-2xl font-bold">{followingCount}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CV SECTION */}
        {profile?.role === "candidate" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-semibold">Curriculum Vitae</h3>

              {isOwnProfile && (
                <Button size="sm" variant="outline" onClick={() => setShowCVUploader(true)}>
                  <FileText className="h-4 w-4 mr-1" /> Aggiorna CV
                </Button>
              )}
            </CardHeader>

            <CardContent>
              {profile?.cv_url ? (
                <a
                  className="text-primary hover:underline"
                  href={profile.cv_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visualizza CV
                </a>
              ) : (
                <p className="text-muted-foreground">Nessun CV caricato</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* CHAT BUTTON */}
        {!isOwnProfile && (
          <Button className="w-full" onClick={handleOpenChat}>
            Invia Messaggio
          </Button>
        )}

      </div>

      {/* DIALOGS */}
      {isOwnProfile && (
        <>
          <EditProfileDialog 
            open={editOpen} 
            onOpenChange={setEditOpen} 
            profile={profile} 
            onSuccess={loadProfile} 
          />
          {showCVUploader && (
            <CVUploader 
              userId={currentUserId || ""} 
              currentCvUrl={profile?.cv_url}
              onUploadComplete={(url) => {
                loadProfile();
                setShowCVUploader(false);
              }} 
            />
          )}
        </>
      )}

    </MainLayout>
  );
};

export default Profile;
