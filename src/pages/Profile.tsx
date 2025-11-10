import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Mail, Phone, Linkedin, ArrowLeft, MessageCircle, Edit } from "lucide-react";
import { toast } from "sonner";
import EditProfileDialog from "@/components/dashboard/EditProfileDialog";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    loadProfile();
    getCurrentUser();
  }, [userId]);

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
      navigate("/dashboard", { state: { openChatWith: profile.id, chatName: profile.full_name } });
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const isOwnProfile = currentUserId === profile?.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Profilo non trovato</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna alla Dashboard
        </Button>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-2xl">{getInitials(profile.full_name)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                  {isOwnProfile && (
                    <Button onClick={() => setEditOpen(true)} size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifica
                    </Button>
                  )}
                </div>
                
                {profile.job_title && (
                  <p className="text-xl text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    {profile.job_title}
                  </p>
                )}
                
                {profile.city && (
                  <p className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {profile.city}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Badge variant={profile.role === 'recruiter' ? 'default' : 'secondary'}>
                    {profile.role === 'recruiter' ? 'Recruiter' : 'Candidato'}
                  </Badge>
                  {profile.is_premium && (
                    <Badge variant="default">Premium</Badge>
                  )}
                </div>

                {!isOwnProfile && (
                  <Button onClick={handleOpenChat} className="mt-4">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Invia Messaggio
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {profile.bio && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Biografia</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Competenze</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string, idx: number) => (
                    <Badge key={idx} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {profile.core_values && profile.core_values.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Valori Professionali</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.core_values.map((value: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{value}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
              {profile.years_experience && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Esperienza</h4>
                  <p className="text-muted-foreground">{profile.years_experience}</p>
                </div>
              )}

              {profile.education && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Formazione</h4>
                  <p className="text-muted-foreground">{profile.education}</p>
                </div>
              )}

              {profile.languages && profile.languages.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Lingue</h4>
                  <p className="text-muted-foreground">{profile.languages.join(", ")}</p>
                </div>
              )}

              {profile.availability && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Disponibilità</h4>
                  <p className="text-muted-foreground">{profile.availability}</p>
                </div>
              )}

              {profile.work_preference && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Preferenza Lavoro</h4>
                  <p className="text-muted-foreground">{profile.work_preference}</p>
                </div>
              )}

              {profile.expected_salary && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">RAL Attesa</h4>
                  <p className="text-muted-foreground">{profile.expected_salary}</p>
                </div>
              )}

              {profile.company_size && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Dimensione Azienda</h4>
                  <p className="text-muted-foreground">{profile.company_size}</p>
                </div>
              )}

              {profile.industry && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Settore</h4>
                  <p className="text-muted-foreground">{profile.industry}</p>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-lg font-semibold">Contatti</h3>
              
              {profile.phone_number && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${profile.phone_number}`} className="hover:text-foreground">
                    {profile.phone_number}
                  </a>
                </div>
              )}
              
              {profile.linkedin_url && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Linkedin className="h-4 w-4" />
                  <a 
                    href={profile.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-foreground"
                  >
                    Profilo LinkedIn
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isOwnProfile && (
        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          profile={profile}
          onSuccess={loadProfile}
        />
      )}
    </div>
  );
};

export default Profile;
