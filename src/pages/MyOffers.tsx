import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, MapPin, Users, Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import CreateJobDialog from "@/components/dashboard/CreateJobDialog";
import EditJobDialog from "@/components/dashboard/EditJobDialog";
import { useOptimizedOffers } from "@/hooks/useOptimizedOffers";

const MyOffers = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

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

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      navigate("/auth");
    }
  };

  const { offers: jobOffers, loading, refetch, invalidate } = useOptimizedOffers({
    recruiterId: profile?.id,
    active: undefined
  });

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa offerta?")) return;

    try {
      const { error } = await supabase
        .from("job_offers")
        .delete()
        .eq("id", jobId);

      if (error) throw error;
      toast.success("Offerta eliminata");
      invalidate();
      refetch();
    } catch (error) {
      toast.error("Errore nell'eliminazione dell'offerta");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Le Mie Offerte</h1>
            <p className="text-muted-foreground mt-1">
              {jobOffers.length} offerte create
            </p>
          </div>
          <Button onClick={() => setShowCreateJob(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuova Offerta
          </Button>
        </div>

        {jobOffers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nessuna offerta creata</h3>
              <p className="text-muted-foreground mb-4">
                Inizia creando la tua prima offerta di lavoro
              </p>
              <Button onClick={() => setShowCreateJob(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crea Offerta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobOffers.map((job) => {
              const applicationsCount = job.applications?.length || 0;
              const activeApplications = job.applications?.filter(
                (app: any) => app.status === "in_valutazione"
              ).length || 0;

              return (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2">{job.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <MapPin className="h-4 w-4" />
                          {job.city}
                        </CardDescription>
                      </div>
                      <Badge variant={job.is_active ? "default" : "secondary"}>
                        {job.is_active ? "Attiva" : "Chiusa"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{applicationsCount} candidature</span>
                      {activeApplications > 0 && (
                        <Badge variant="outline" className="ml-auto">
                          {activeApplications} nuove
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditingJob(job)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifica
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <CreateJobDialog
        open={showCreateJob}
        onOpenChange={setShowCreateJob}
        onSuccess={() => {
          setShowCreateJob(false);
          invalidate();
          refetch();
        }}
        recruiterId={profile?.id || ""}
      />

      {editingJob && (
        <EditJobDialog
          open={!!editingJob}
          onOpenChange={(open) => !open && setEditingJob(null)}
          onSuccess={() => {
            setEditingJob(null);
            invalidate();
            refetch();
          }}
          job={editingJob}
        />
      )}
    </MainLayout>
  );
};

export default MyOffers;
