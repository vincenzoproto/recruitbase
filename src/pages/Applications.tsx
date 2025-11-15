import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, MapPin, Building, Eye, Clock } from "lucide-react";
import { toast } from "sonner";
import { useOptimizedApplications } from "@/hooks/useOptimizedApplications";

interface Application {
  id: string;
  status: string;
  applied_at: string;
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

const statusColors: Record<string, string> = {
  in_valutazione: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  colloquio_programmato: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  assunto: "bg-green-500/10 text-green-700 dark:text-green-400",
  non_idoneo: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const statusLabels: Record<string, string> = {
  in_valutazione: "In Valutazione",
  colloquio_programmato: "Colloquio Programmato",
  assunto: "Assunto",
  non_idoneo: "Non Idoneo",
};

const Applications = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        navigate("/auth");
      }
    };
    loadCurrentUser();
  }, [navigate]);

  const { applications, loading } = useOptimizedApplications(userId);

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
            <h1 className="text-3xl font-bold">Le Tue Candidature</h1>
            <p className="text-muted-foreground mt-1">
              {applications.length} candidature totali
            </p>
          </div>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nessuna candidatura</h3>
              <p className="text-muted-foreground text-center mb-4">
                Non hai ancora inviato candidature. Esplora le offerte disponibili!
              </p>
              <Button onClick={() => navigate("/offers")}>
                Esplora Offerte
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => (
              <Card key={app.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {app.job_offers.title}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {app.job_offers.profiles.full_name}
                          {app.job_offers.profiles.company_size && 
                            ` • ${app.job_offers.profiles.company_size}`
                          }
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {app.job_offers.city}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[app.status] || ""}>
                      {statusLabels[app.status] || app.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{app.job_offers.sector}</Badge>
                    <Badge variant="outline">{app.job_offers.experience_level}</Badge>
                  </div>
                  
                  <p className="text-sm line-clamp-2 text-muted-foreground">
                    {app.job_offers.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Candidato il {new Date(app.applied_at).toLocaleDateString('it-IT')}
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/offers#${app.job_offers.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizza Offerta
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Applications;
