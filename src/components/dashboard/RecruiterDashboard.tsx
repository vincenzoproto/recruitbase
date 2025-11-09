import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Briefcase, Users, LogOut, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CreateJobDialog from "./CreateJobDialog";
import JobOfferCard from "./JobOfferCard";
import CandidateCard from "./CandidateCard";

interface RecruiterDashboardProps {
  profile: any;
}

const RecruiterDashboard = ({ profile }: RecruiterDashboardProps) => {
  const navigate = useNavigate();
  const [jobOffers, setJobOffers] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showCandidates, setShowCandidates] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    loadJobOffers();
    loadFavorites();
  }, []);

  const loadJobOffers = async () => {
    const { data, error } = await supabase
      .from("job_offers")
      .select("*")
      .eq("recruiter_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Errore nel caricamento delle offerte");
      return;
    }
    setJobOffers(data || []);
  };

  const loadCandidates = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "candidate");

    if (error) {
      toast.error("Errore nel caricamento dei candidati");
      return;
    }
    setCandidates(data || []);
  };

  const loadFavorites = async () => {
    const { data, error } = await supabase
      .from("favorites")
      .select("*, candidate:profiles!favorites_candidate_id_fkey(*)")
      .eq("recruiter_id", profile.id);

    if (error) {
      toast.error("Errore nel caricamento dei preferiti");
      return;
    }
    setFavorites(data || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleToggleFavorite = async (candidateId: string) => {
    const isFavorite = favorites.some((f) => f.candidate_id === candidateId);

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("recruiter_id", profile.id)
        .eq("candidate_id", candidateId);

      if (error) {
        toast.error("Errore nella rimozione dai preferiti");
        return;
      }
      toast.success("Rimosso dai preferiti");
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({
          recruiter_id: profile.id,
          candidate_id: candidateId,
        });

      if (error) {
        toast.error("Errore nell'aggiunta ai preferiti");
        return;
      }
      toast.success("Aggiunto ai preferiti");
    }

    loadFavorites();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recruit Base</h1>
            <p className="text-sm text-muted-foreground">Dashboard Recruiter</p>
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
            <CardDescription>Gestisci le tue offerte di lavoro e trova i migliori candidati</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Button
            onClick={() => setShowCreateJob(true)}
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <Plus className="h-8 w-8" />
            <span>Nuova Offerta</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowCandidates(!showCandidates);
              if (!showCandidates) loadCandidates();
              setShowFavorites(false);
            }}
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <Users className="h-8 w-8" />
            <span>Cerca Candidati</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowFavorites(!showFavorites);
              setShowCandidates(false);
            }}
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <Star className="h-8 w-8" />
            <span>Preferiti ({favorites.length})</span>
          </Button>
        </div>

        {showCandidates && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Candidati Disponibili
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites.some((f) => f.candidate_id === candidate.id)}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {showFavorites && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                I Tuoi Preferiti
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {favorites.map((fav) => (
                <CandidateCard
                  key={fav.id}
                  candidate={fav.candidate}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={true}
                />
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Le Tue Offerte
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {jobOffers.length === 0 ? (
              <p className="text-muted-foreground col-span-2 text-center py-8">
                Nessuna offerta pubblicata. Clicca su "Nuova Offerta" per iniziare!
              </p>
            ) : (
              jobOffers.map((job) => (
                <JobOfferCard key={job.id} job={job} onUpdate={loadJobOffers} />
              ))
            )}
          </CardContent>
        </Card>
      </main>

      <CreateJobDialog
        open={showCreateJob}
        onOpenChange={setShowCreateJob}
        recruiterId={profile.id}
        onSuccess={loadJobOffers}
      />
    </div>
  );
};

export default RecruiterDashboard;
