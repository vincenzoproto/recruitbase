import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, LogOut, User, CheckCircle, Clock, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import EditProfileDialog from "./EditProfileDialog";
import JobOfferCard from "./JobOfferCard";
import { Badge } from "@/components/ui/badge";
import AmbassadorSection from "@/components/ambassador/AmbassadorSection";

interface CandidateDashboardProps {
  profile: any;
}

const CandidateDashboard = ({ profile }: CandidateDashboardProps) => {
  const navigate = useNavigate();
  const [jobOffers, setJobOffers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    loadJobOffers();
    loadApplications();
  }, []);

  const loadJobOffers = async () => {
    const { data, error } = await supabase
      .from("job_offers")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Errore nel caricamento delle offerte");
      return;
    }
    setJobOffers(data || []);
  };

  const loadApplications = async () => {
    const { data, error } = await supabase
      .from("applications")
      .select("job_offer_id")
      .eq("candidate_id", profile.id);

    if (error) {
      toast.error("Errore nel caricamento delle candidature");
      return;
    }
    setApplications(data || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleApply = async (jobOfferId: string) => {
    const { error } = await supabase.from("applications").insert({
      job_offer_id: jobOfferId,
      candidate_id: profile.id,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("Ti sei già candidato per questa posizione");
      } else {
        toast.error("Errore nell'invio della candidatura");
      }
      return;
    }

    toast.success("Candidatura inviata con successo!");
    loadApplications();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recruit Base</h1>
            <p className="text-sm text-muted-foreground">Dashboard Candidato</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Esci
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card className="border-none shadow-md animate-fade-in bg-gradient-to-r from-card to-accent/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  👋 Benvenuto, {profile.full_name}
                  {profile.is_premium && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-base">Trova il lavoro perfetto per te</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {profile.referral_code && (
          <AmbassadorSection userId={profile.id} referralCode={profile.referral_code} />
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Benvenuto, {profile.full_name}</CardTitle>
              {!profile.city || !profile.job_title || !profile.skills?.length ? (
                <Badge variant="outline" className="text-amber-600 border-amber-600">
                  Profilo incompleto
                </Badge>
              ) : (
                <Badge variant="default" className="bg-green-600">
                  Profilo completo ✓
                </Badge>
              )}
            </div>
            <CardDescription>
              {!profile.city || !profile.job_title || !profile.skills?.length
                ? "Completa il tuo profilo per aumentare le tue possibilità!"
                : "Trova le migliori opportunità di lavoro per te"}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5" />
                Il Tuo Profilo
              </CardTitle>
              <CardDescription>
                {!profile.city || !profile.job_title || !profile.skills?.length
                  ? "⚠️ Completa il profilo per essere più visibile ai recruiter"
                  : "Il tuo profilo è completo e visibile ai recruiter"}
              </CardDescription>
            </div>
            <Button onClick={() => setShowEditProfile(true)} size="lg">
              {!profile.city || !profile.job_title || !profile.skills?.length
                ? "Completa Profilo"
                : "Modifica"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Nome: </span>
              <span>{profile.full_name}</span>
            </div>
            {profile.city && (
              <div>
                <span className="font-medium">Città: </span>
                <span>{profile.city}</span>
              </div>
            )}
            {profile.job_title && (
              <div>
                <span className="font-medium">Ruolo: </span>
                <span>{profile.job_title}</span>
              </div>
            )}
            {profile.skills && profile.skills.length > 0 && (
              <div>
                <span className="font-medium">Competenze: </span>
                <span>{profile.skills.join(", ")}</span>
              </div>
            )}
            {profile.linkedin_url && (
              <div>
                <span className="font-medium">LinkedIn: </span>
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Visualizza profilo
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Offerte Disponibili
              </CardTitle>
              {applications.length > 0 && (
                <Badge variant="secondary">{applications.length} candidature inviate</Badge>
              )}
            </div>
            <CardDescription>
              {jobOffers.length === 0
                ? "Nessuna offerta disponibile al momento"
                : `${jobOffers.length} offerte disponibili`}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {jobOffers.length === 0 ? (
              <div className="col-span-2 text-center py-12 space-y-4 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Briefcase className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-foreground">Nessuna offerta disponibile</p>
                  <p className="text-sm text-muted-foreground">Torna più tardi per scoprire nuove opportunità</p>
                </div>
              </div>
            ) : (
              jobOffers.map((job) => {
                const hasApplied = applications.some((app) => app.job_offer_id === job.id);
                return (
                  <JobOfferCard
                    key={job.id}
                    job={job}
                    onApply={() => handleApply(job.id)}
                    hasApplied={hasApplied}
                    isCandidate
                  />
                );
              })
            )}
          </CardContent>
        </Card>
      </main>

      <EditProfileDialog
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
        profile={profile}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
};

export default CandidateDashboard;
