import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Mail, Phone, Linkedin, Edit, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import EditProfileDialog from "@/components/dashboard/EditProfileDialog";
import { CVUploader } from "@/components/candidate/CVUploader";
import { MainLayout } from "@/components/layout/MainLayout";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [showCVUploader, setShowCVUploader] = useState(false);

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
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Profilo non trovato</p>
        </div>
      </MainLayout>
    );
  }

  // Calculate profile completion
  const completionFields = [
    profile.full_name,
    profile.job_title,
    profile.city,
    profile.bio,
    profile.skills?.length > 0,
    profile.core_values?.length >= 3,
    profile.linkedin_url,
    profile.phone_number,
    profile.cv_url,
    profile.avatar_url,
  ];
  const filledFields = completionFields.filter(Boolean).length;
  const completionPercentage = Math.round((filledFields / completionFields.length) * 100);

  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Profile Completion Banner */}
        {isOwnProfile && completionPercentage < 100 && (
          <Card className="mb-6 border-primary/30 bg-primary/5 animate-fade-in">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    Profilo {completionPercentage}% completo
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {10 - filledFields} campi mancanti
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Completa il tuo profilo per aumentare la visibilità e ricevere più opportunità
                </p>
                <Button onClick={() => setEditOpen(true)} size="sm" className="w-full">
                  Completa ora
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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

            {/* CV Section */}
            {profile.role === 'candidate' && (
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-3">Curriculum Vitae</h3>
                {profile.cv_url ? (
                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">CV caricato</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={profile.cv_url} target="_blank" rel="noopener noreferrer">
                          Visualizza
                        </a>
                      </Button>
                      {isOwnProfile && (
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ) : isOwnProfile ? (
                  <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 text-primary mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">Carica il tuo CV</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Aumenta la visibilità del tuo profilo del 70%
                      </p>
                      <Button size="sm" onClick={() => setEditOpen(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Carica CV
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <p className="text-sm text-muted-foreground">CV non disponibile</p>
                )}
              </div>
            )}

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
    </MainLayout>
  );
};

export default Profile;
