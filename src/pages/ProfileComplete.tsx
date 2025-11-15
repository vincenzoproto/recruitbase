import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Award, 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Mail, 
  Phone,
  Edit,
  Download,
  TrendingUp
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { TinderMatch } from "@/components/match/TinderMatch";

const ProfileComplete = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
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

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <p>Profilo non trovato</p>
        </div>
      </MainLayout>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4 space-y-6">
        {/* Header con Info Profilo */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                  <p className="text-lg text-muted-foreground">{profile.job_title || "Candidato"}</p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {profile.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.city}
                    </div>
                  )}
                  {profile.phone_number && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {profile.phone_number}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email verificata
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => navigate("/profile")}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifica Profilo
                  </Button>
                  {profile.cv_url && (
                    <Button variant="outline" onClick={() => window.open(profile.cv_url, "_blank")}>
                      <Download className="h-4 w-4 mr-2" />
                      Scarica CV
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Biografia */}
        {profile.bio && (
          <Card>
            <CardHeader>
              <CardTitle>Chi sono</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Competenze */}
        {profile.skills && profile.skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Competenze
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Esperienze */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Esperienza
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.years_experience && (
              <div>
                <p className="font-semibold">Anni di Esperienza</p>
                <p className="text-muted-foreground">{profile.years_experience} anni</p>
              </div>
            )}
            {profile.industry && (
              <div>
                <p className="font-semibold">Settore</p>
                <p className="text-muted-foreground">{profile.industry}</p>
              </div>
            )}
            {profile.languages && (
              <div>
                <p className="font-semibold">Lingue</p>
                <p className="text-muted-foreground">{profile.languages}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formazione */}
        {(profile.education || profile.degree_title) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Formazione
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.degree_title && (
                <div>
                  <p className="font-semibold">Titolo di Studio</p>
                  <p className="text-muted-foreground">{profile.degree_title}</p>
                </div>
              )}
              {profile.education && (
                <div>
                  <p className="font-semibold">Istituto</p>
                  <p className="text-muted-foreground">{profile.education}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Valori Aziendali */}
        {profile.core_values && profile.core_values.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Valori Aziendali</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.core_values.map((value: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {value}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Match - solo per candidati */}
        {profile.role === "candidate" && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Job Match
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TinderMatch userId={profile.id} userRole="candidate" />
            </CardContent>
          </Card>
        )}

        {/* CV */}
        {profile.cv_url && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Curriculum Vitae
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => window.open(profile.cv_url, "_blank")}>
                <Download className="h-4 w-4 mr-2" />
                Visualizza CV
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ProfileComplete;
