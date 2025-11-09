import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, User, Mail } from "lucide-react";
import { toast } from "sonner";
import CandidateDetailDialog from "./CandidateDetailDialog";

interface PipelineStage {
  id: string;
  name: string;
  position: number;
  color: string;
}

interface Candidate {
  id: string;
  full_name: string;
  job_title: string;
  city: string;
  skills: string[];
  engagement_score: number;
  is_favorite: boolean;
  last_contact_date: string;
  pipeline_stage_id: string;
}

const KanbanBoard = () => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [draggedCandidate, setDraggedCandidate] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load pipeline stages
      const { data: stagesData } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('recruiter_id', user.id)
        .order('position');

      if (stagesData) setStages(stagesData);

      // Load candidates with interactions
      const { data: interactionsData } = await supabase
        .from('interactions')
        .select('candidate_id')
        .eq('recruiter_id', user.id);

      const candidateIds = [...new Set(interactionsData?.map(i => i.candidate_id) || [])];

      if (candidateIds.length > 0) {
        const { data: candidatesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', candidateIds)
          .eq('role', 'candidate');

        if (candidatesData) setCandidates(candidatesData);
      }
    } catch (error) {
      console.error('Error loading kanban data:', error);
      toast.error("Errore nel caricamento dei dati");
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (candidateId: string) => {
    setDraggedCandidate(candidateId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (stageId: string) => {
    if (!draggedCandidate) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ pipeline_stage_id: stageId })
        .eq('id', draggedCandidate);

      if (error) throw error;

      // Log interaction
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('interactions').insert({
          candidate_id: draggedCandidate,
          recruiter_id: user.id,
          type: 'status_change',
          content: `Spostato in ${stages.find(s => s.id === stageId)?.name}`
        });
      }

      setCandidates(prev =>
        prev.map(c => c.id === draggedCandidate ? { ...c, pipeline_stage_id: stageId } : c)
      );

      toast.success("Candidato spostato con successo");
    } catch (error) {
      console.error('Error updating stage:', error);
      toast.error("Errore nello spostamento");
    }

    setDraggedCandidate(null);
  };

  const toggleFavorite = async (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_favorite: !candidate.is_favorite })
        .eq('id', candidateId);

      if (error) throw error;

      setCandidates(prev =>
        prev.map(c => c.id === candidateId ? { ...c, is_favorite: !c.is_favorite } : c)
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getCandidatesForStage = (stageId: string) => {
    return candidates.filter(c => c.pipeline_stage_id === stageId);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Caricamento...</div>;
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(stage => (
          <div
            key={stage.id}
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(stage.id)}
          >
            <div className="mb-3 flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: stage.color }}
              />
              <h3 className="font-semibold text-foreground">{stage.name}</h3>
              <Badge variant="secondary" className="ml-auto">
                {getCandidatesForStage(stage.id).length}
              </Badge>
            </div>

            <div className="space-y-2">
              {getCandidatesForStage(stage.id).map(candidate => (
                <Card
                  key={candidate.id}
                  draggable
                  onDragStart={() => handleDragStart(candidate.id)}
                  className="p-4 cursor-move hover:shadow-md transition-all"
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{candidate.full_name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(candidate.id);
                      }}
                    >
                      <Star className={`h-4 w-4 ${candidate.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                  </div>

                  {candidate.job_title && (
                    <p className="text-xs text-muted-foreground mb-2">{candidate.job_title}</p>
                  )}

                  {candidate.city && (
                    <p className="text-xs text-muted-foreground mb-2">📍 {candidate.city}</p>
                  )}

                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {candidate.skills.slice(0, 3).map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <span>Engagement: {candidate.engagement_score || 0}</span>
                    {candidate.last_contact_date && (
                      <span>{new Date(candidate.last_contact_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedCandidate && (
        <CandidateDetailDialog
          candidate={selectedCandidate}
          open={!!selectedCandidate}
          onOpenChange={(open) => !open && setSelectedCandidate(null)}
          onUpdate={loadData}
        />
      )}
    </>
  );
};

export default KanbanBoard;
