import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import EditProfileDialog from "./EditProfileDialog";
import JobOfferCard from "./JobOfferCard";

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
        <Card>
          <CardHeader>
            <CardTitle>Benvenuto, {profile.full_name}</CardTitle>
            <CardDescription>Trova le migliori opportunità di lavoro per te</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Il Tuo Profilo
              </CardTitle>
              <CardDescription>Completa il tuo profilo per aumentare le tue possibilità</CardDescription>
            </div>
            <Button onClick={() => setShowEditProfile(true)}>Modifica Profilo</Button>
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
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Offerte Disponibili
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {jobOffers.length === 0 ? (
              <p className="text-muted-foreground col-span-2 text-center py-8">
                Nessuna offerta disponibile al momento
              </p>
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
