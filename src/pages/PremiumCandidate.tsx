import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, TrendingUp, Eye, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function PremiumCandidate() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium, role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'candidate') {
        toast.error('Questa funzionalità è disponibile solo per i candidati');
        navigate('/dashboard');
        return;
      }

      setIsPremium(profile?.is_premium || false);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleUpgrade = async () => {
    if (!currentUserId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_premium: true })
        .eq('id', currentUserId);

      if (error) throw error;

      setIsPremium(true);
      toast.success('🎉 Sei ora un candidato Premium!');
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      toast.error('Errore durante l\'upgrade');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Eye,
      title: "Massima Visibilità",
      description: "Appari in cima ai risultati di ricerca e ai match dei recruiter"
    },
    {
      icon: TrendingUp,
      title: "Priorità nel Feed",
      description: "I tuoi post social hanno priorità e maggiore visibilità"
    },
    {
      icon: Star,
      title: "Badge Premium",
      description: "Badge distintivo dorato visibile sul tuo profilo"
    },
    {
      icon: Sparkles,
      title: "Match Potenziati",
      description: "Appari per primo nei match style-Tinder dei recruiter"
    }
  ];

  return (
    <MainLayout>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="text-center space-y-4 mb-12">
          <div className="flex justify-center">
            <Crown className="h-16 w-16 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Diventa un Candidato Premium
          </h1>
          <p className="text-xl text-muted-foreground">
            Ottieni massima visibilità e aumenta le tue opportunità di carriera
          </p>
        </div>

        {isPremium ? (
          <Card className="border-2 border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Crown className="h-6 w-6 text-yellow-500" />
                Sei già Premium!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Stai già godendo di tutti i vantaggi del piano Premium.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="flex items-start gap-3 p-4 bg-background rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-8 border-2 border-primary shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl">Piano Premium Candidato</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">€19</span>
                  <span className="text-muted-foreground text-xl">/mese</span>
                </div>
                <p className="text-muted-foreground mt-2">
                  Massimizza le tue opportunità di carriera
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div key={feature.title} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{feature.title}</h3>
                          <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleUpgrade} 
                    disabled={loading}
                    className="w-full h-12 text-lg bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 hover:from-yellow-500 hover:via-orange-500 hover:to-yellow-600"
                  >
                    {loading ? (
                      "Attivazione in corso..."
                    ) : (
                      <>
                        <Crown className="mr-2 h-5 w-5" />
                        Diventa Premium Ora
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  Puoi cancellare in qualsiasi momento. Nessun impegno a lungo termine.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-xl">Perché scegliere Premium?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <div className="text-3xl font-bold text-primary mb-2">3x</div>
                    <p className="text-sm text-muted-foreground">Più visualizzazioni del profilo</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-3xl font-bold text-primary mb-2">2x</div>
                    <p className="text-sm text-muted-foreground">Più match con recruiter</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-3xl font-bold text-primary mb-2">5x</div>
                    <p className="text-sm text-muted-foreground">Più engagement sui post</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}
