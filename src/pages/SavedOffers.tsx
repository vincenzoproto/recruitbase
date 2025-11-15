import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Building, Bookmark, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface SavedOffer {
  id: string;
  job_offer_id: string;
  job_offers: {
    id: string;
    title: string;
    city: string;
    sector: string;
    experience_level: string;
    description: string;
    profiles: {
      full_name: string;
      company_size?: string;
    };
  };
}

const SavedOffers = () => {
  const navigate = useNavigate();
  const [savedOffers, setSavedOffers] = useState<SavedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      loadSavedOffers(user.id);
    } else {
      navigate("/auth");
    }
  };

  const loadSavedOffers = async (candidateId: string) => {
    try {
      setLoading(true);
      // In questo esempio usiamo la tabella favorites come "saved offers"
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          candidate_id,
          job_offers!favorites_candidate_id_fkey (
            id,
            title,
            city,
            sector,
            experience_level,
            description,
            profiles:recruiter_id (
              full_name,
              company_size
            )
          )
        `)
        .eq("recruiter_id", candidateId);

      if (error) throw error;
      
      // Trasformiamo i dati nel formato corretto
      const formattedData = data?.map(item => ({
        id: item.id,
        job_offer_id: item.candidate_id,
        job_offers: item.job_offers as any
      })) || [];
      
      setSavedOffers(formattedData);
    } catch (error) {
      console.error("Error loading saved offers:", error);
      toast.error("Errore nel caricamento delle offerte salvate");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveOffer = async (savedId: string) => {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", savedId);

      if (error) throw error;
      
      toast.success("Offerta rimossa dai salvati");
      setSavedOffers(prev => prev.filter(offer => offer.id !== savedId));
    } catch (error) {
      console.error("Error unsaving offer:", error);
      toast.error("Errore nella rimozione dell'offerta");
    }
  };

  const handleApply = async (jobOfferId: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .insert({
          candidate_id: userId,
          job_offer_id: jobOfferId,
          status: "in_valutazione"
        });

      if (error) throw error;
      
      toast.success("Candidatura inviata con successo!");
      navigate("/applications");
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Hai già candidato per questa offerta");
      } else {
        console.error("Error applying:", error);
        toast.error("Errore nell'invio della candidatura");
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Offerte Salvate</h1>
            <p className="text-muted-foreground mt-1">
              {savedOffers.length} offerte salvate
            </p>
          </div>
        </div>

        {savedOffers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bookmark className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nessuna offerta salvata</h3>
              <p className="text-muted-foreground mb-4">
                Salva le offerte che ti interessano per trovarle facilmente
              </p>
              <Button onClick={() => navigate("/offers")}>
                Esplora Offerte
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {savedOffers.map((saved) => {
              const offer = saved.job_offers;
              if (!offer) return null;

              return (
                <Card key={saved.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{offer.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {offer.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {offer.sector}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{offer.experience_level}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {offer.description}
                    </p>

                    {offer.profiles && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4" />
                        <span>{offer.profiles.full_name}</span>
                        {offer.profiles.company_size && (
                          <Badge variant="secondary">{offer.profiles.company_size}</Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleApply(offer.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Candidati
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleUnsaveOffer(saved.id)}
                      >
                        <Bookmark className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SavedOffers;
