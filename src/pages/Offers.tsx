import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, MapPin, Users, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import CreateJobDialog from "@/components/dashboard/CreateJobDialog";
import EditJobDialog from "@/components/dashboard/EditJobDialog";
import { MainLayout } from "@/components/layout/MainLayout";

const Offers = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [jobOffers, setJobOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      if (profile.role === "recruiter") {
        loadRecruiterOffers();
      } else {
        loadAllOffers();
      }
    }
  }, [profile]);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      navigate("/auth");
    }
  };

  const loadRecruiterOffers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("job_offers")
        .select(`
          *,
          applications (
            id,
            status
          )
        `)
        .eq("recruiter_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobOffers(data || []);
    } catch (error) {
      console.error("Error loading offers:", error);
      toast.error("Errore nel caricamento delle offerte");
    } finally {
      setLoading(false);
    }
  };

  const loadAllOffers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("job_offers")
        .select("*, profiles!job_offers_recruiter_id_fkey(full_name, avatar_url, company_size)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobOffers(data || []);
    } catch (error) {
      console.error("Error loading offers:", error);
      toast.error("Errore nel caricamento delle offerte");
    } finally {
      setLoading(false);
    }
  };

  const handleJobCreated = () => {
    setShowCreateJob(false);
    if (profile?.role === "recruiter") {
      loadRecruiterOffers();
    }
  };

  const handleJobUpdated = () => {
    setEditingJob(null);
    if (profile?.role === "recruiter") {
      loadRecruiterOffers();
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-4 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Offerte di Lavoro</h1>
            <p className="text-muted-foreground">
              {profile?.role === "recruiter"
                ? "Gestisci le tue offerte"
                : "Trova l'opportunità perfetta per te"}
            </p>
          </div>
          {profile?.role === "recruiter" && (
            <Button onClick={() => setShowCreateJob(true)} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Nuova Offerta
            </Button>
          )}
        </div>

        {jobOffers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {profile?.role === "recruiter"
                  ? "Nessuna offerta creata"
                  : "Nessuna offerta disponibile"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {profile?.role === "recruiter"
                  ? "Inizia creando la tua prima offerta di lavoro"
                  : "Torna più tardi per nuove opportunità"}
              </p>
              {profile?.role === "recruiter" && (
                <Button onClick={() => setShowCreateJob(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crea la prima offerta
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobOffers.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    {job.is_active ? (
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Attiva
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Chiusa</Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {job.city}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{job.sector}</Badge>
                    <Badge variant="outline">{job.experience_level}</Badge>
                  </div>
                  
                  {profile?.role === "recruiter" && job.applications && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {job.applications.length} candidature
                    </div>
                  )}

                  <p className="text-sm line-clamp-3">{job.description}</p>

                  <div className="flex gap-2">
                    {profile?.role === "recruiter" ? (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setEditingJob(job)}
                      >
                        Modifica
                      </Button>
                    ) : (
                      <Button
                        className="flex-1"
                        onClick={() => navigate(`/profile/${job.recruiter_id}`)}
                      >
                        Candidati
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {profile?.role === "recruiter" && (
        <>
          <CreateJobDialog
            open={showCreateJob}
            onOpenChange={setShowCreateJob}
            recruiterId={profile.id}
            onSuccess={handleJobCreated}
          />
          {editingJob && (
            <EditJobDialog
              open={!!editingJob}
              onOpenChange={(open) => !open && setEditingJob(null)}
              job={editingJob}
              onSuccess={handleJobUpdated}
            />
          )}
        </>
      )}
      </div>
    </MainLayout>
  );
};

export default Offers;
