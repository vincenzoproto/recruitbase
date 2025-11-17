import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Target, TrendingUp } from "lucide-react";
import { useCandidateRanking } from "@/hooks/useCandidateRanking";
import { TopCandidateCard } from "@/components/ranking/TopCandidateCard";
import { RankingFilters } from "@/components/ranking/RankingFilters";
import { useJobOffers } from "@/hooks/useJobOffers";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const CandidateRanking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId');
  
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || "");
  const [userId, setUserId] = useState<string | null>(null);

  const { jobOffers, loading: jobsLoading } = useJobOffers(userId || undefined);
  const { rankings, loading, filters, applyFilters, generateMatchReasons, refresh } = useCandidateRanking(selectedJobId);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!initialJobId && jobOffers.length > 0) {
      setSelectedJobId(jobOffers[0].id);
    }
  }, [jobOffers, initialJobId]);

  const selectedJob = jobOffers.find(j => j.id === selectedJobId);

  const handleGenerateReasons = async (candidateId: string) => {
    try {
      await generateMatchReasons(candidateId);
      toast.success('Motivazioni generate con AI!');
    } catch (error) {
      toast.error('Errore nella generazione delle motivazioni');
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="h-8 w-8 text-primary" />
              AI Candidate Ranking
            </h1>
            <p className="text-muted-foreground">
              Candidati classificati con match score intelligente
            </p>
          </div>
        </div>

        {/* Job Selector */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Seleziona Offerta di Lavoro
              </label>
              {jobsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Scegli un'offerta..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jobOffers.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title} - {job.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex items-end">
              <RankingFilters filters={filters} onFiltersChange={applyFilters} />
            </div>
          </div>

          {/* Job Info */}
          {selectedJob && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h3 className="font-semibold">{selectedJob.title}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedJob.sector} • {selectedJob.city} • {selectedJob.experience_level}
              </p>
            </div>
          )}
        </Card>

        {/* Stats */}
        {!loading && rankings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Totale Candidati</p>
                  <p className="text-2xl font-bold">{rankings.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Score Medio</p>
                <p className="text-2xl font-bold">
                  {Math.round(rankings.reduce((sum, r) => sum + r.smart_match_score, 0) / rankings.length)}
                </p>
              </div>
            </Card>
            <Card className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Top Match (≥80)</p>
                <p className="text-2xl font-bold text-green-600">
                  {rankings.filter(r => r.smart_match_score >= 80).length}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Rankings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : rankings.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nessun candidato trovato</h3>
            <p className="text-muted-foreground mb-4">
              {selectedJobId 
                ? "Non ci sono candidature per questa offerta o i filtri sono troppo restrittivi."
                : "Seleziona un'offerta di lavoro per vedere i candidati classificati."
              }
            </p>
            {filters && Object.keys(filters).length > 0 && (
              <Button onClick={() => applyFilters({})}>
                Rimuovi Filtri
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {rankings.map((ranking, index) => (
              <div key={ranking.id}>
                {index === 0 && (
                  <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    🏆 Top Candidates
                  </div>
                )}
                <TopCandidateCard 
                  ranking={ranking} 
                  onGenerateReasons={handleGenerateReasons}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CandidateRanking;