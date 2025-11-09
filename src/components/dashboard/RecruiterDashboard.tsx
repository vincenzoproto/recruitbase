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
import LinkedInIntegration from "../LinkedInIntegration";

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
        <Card className="border-none shadow-md animate-fade-in bg-gradient-to-r from-card to-accent/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">👋 Benvenuto, {profile.full_name}</CardTitle>
            <CardDescription className="text-base">Gestisci le tue offerte di lavoro e trova i migliori candidati</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground overflow-hidden relative animate-scale-in hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Star className="h-6 w-6 fill-current" />
                  </div>
                  <h3 className="text-2xl font-bold">Passa a Premium</h3>
                </div>
                <p className="text-primary-foreground/95 text-base font-medium">Sblocca tutte le funzionalità avanzate</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="px-3 py-1 bg-white/20 rounded-full">✓ 30 giorni gratis</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full">✓ Contatti illimitati</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full">✓ Ricerca avanzata</span>
                </div>
              </div>
              <Button 
                size="lg" 
                variant="secondary"
                className="h-12 px-8 font-bold shadow-lg hover:scale-105 transition-transform"
                onClick={() => window.open('https://buy.stripe.com/7sYfZh2br4aUfNW24GabK00', '_blank')}
              >
                Attiva Ora
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Button
            onClick={() => setShowCreateJob(true)}
            size="lg"
            className="h-28 flex flex-col items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] animate-fade-in"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Plus className="h-7 w-7" />
            </div>
            <span className="font-bold text-base">Nuova Offerta</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setShowCandidates(!showCandidates);
              if (!showCandidates) loadCandidates();
              setShowFavorites(false);
            }}
            className="h-28 flex flex-col items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] hover:border-primary/50 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center">
              <div className="font-bold text-base">Cerca Candidati</div>
              {candidates.length > 0 && (
                <div className="text-xs text-muted-foreground mt-1">{candidates.length} disponibili</div>
              )}
            </div>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setShowFavorites(!showFavorites);
              setShowCandidates(false);
            }}
            className="h-28 flex flex-col items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] hover:border-primary/50 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center">
              <div className="font-bold text-base">Preferiti</div>
              <div className="text-xs text-muted-foreground mt-1">{favorites.length} salvati</div>
            </div>
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
              {candidates.length === 0 ? (
                <div className="col-span-2 text-center py-12 space-y-4 animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-foreground">Nessun candidato trovato</p>
                    <p className="text-sm text-muted-foreground">I candidati appariranno qui quando si registreranno</p>
                  </div>
                </div>
              ) : (
                candidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={favorites.some((f) => f.candidate_id === candidate.id)}
                  />
                ))
              )}
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
              {favorites.length === 0 ? (
                <div className="col-span-2 text-center py-12 space-y-4 animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Star className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-foreground">Nessun preferito salvato</p>
                    <p className="text-sm text-muted-foreground">Clicca sulla stella per salvare i candidati che ti interessano</p>
                  </div>
                </div>
              ) : (
                favorites.map((fav) => (
                  <CandidateCard
                    key={fav.id}
                    candidate={fav.candidate}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={true}
                  />
                ))
              )}
            </CardContent>
          </Card>
        )}

        <LinkedInIntegration />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Le Tue Offerte
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {jobOffers.length === 0 ? (
              <div className="col-span-2 text-center py-12 space-y-4 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Briefcase className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-foreground">Nessuna offerta pubblicata</p>
                  <p className="text-sm text-muted-foreground">Clicca su "Nuova Offerta" per iniziare a trovare candidati!</p>
                </div>
                <Button onClick={() => setShowCreateJob(true)} size="lg" className="mt-4">
                  <Plus className="mr-2 h-5 w-5" />
                  Crea la tua prima offerta
                </Button>
              </div>
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
