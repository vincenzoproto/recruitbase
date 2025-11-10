import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TrendingUp, Users, Clock, Award } from "lucide-react";

interface KPIData {
  totalActive: number;
  inInterview: number;
  avgResponseTime: number;
  avgTRS: number;
}

export const KanbanKPIs = ({ recruiterId }: { recruiterId: string }) => {
  const [kpis, setKpis] = useState<KPIData>({
    totalActive: 0,
    inInterview: 0,
    avgResponseTime: 0,
    avgTRS: 0,
  });

  useEffect(() => {
    loadKPIs();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('kanban-kpis')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => loadKPIs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [recruiterId]);

  const loadKPIs = async () => {
    try {
      // Get candidate IDs from interactions
      const { data: interactionsData } = await supabase
        .from('interactions')
        .select('candidate_id')
        .eq('recruiter_id', recruiterId);

      const candidateIds = [...new Set(interactionsData?.map(i => i.candidate_id) || [])];

      if (candidateIds.length === 0) return;

      // Get profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('talent_relationship_score, pipeline_stage_id, last_contact_date')
        .in('id', candidateIds)
        .eq('role', 'candidate');

      // Get pipeline stages
      const { data: stages } = await supabase
        .from('pipeline_stages')
        .select('id, name')
        .eq('recruiter_id', recruiterId);

      const interviewStageId = stages?.find(s => 
        s.name.toLowerCase().includes('colloquio')
      )?.id;

      const totalActive = profiles?.filter(p => p.pipeline_stage_id !== null).length || 0;
      const inInterview = profiles?.filter(p => p.pipeline_stage_id === interviewStageId).length || 0;
      
      // Calculate avg TRS
      const trsScores = profiles?.map(p => p.talent_relationship_score || 0) || [];
      const avgTRS = trsScores.length > 0 
        ? Math.round(trsScores.reduce((a, b) => a + b, 0) / trsScores.length)
        : 0;

      // Mock avg response time (hours) - in real implementation, calculate from messages
      const avgResponseTime = 4;

      setKpis({
        totalActive,
        inInterview,
        avgResponseTime,
        avgTRS,
      });
    } catch (error) {
      console.error('Error loading KPIs:', error);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{kpis.totalActive}</p>
            <p className="text-xs text-muted-foreground">Candidature Attive</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {kpis.totalActive > 0 ? Math.round((kpis.inInterview / kpis.totalActive) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">In Colloquio</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{kpis.avgResponseTime}h</p>
            <p className="text-xs text-muted-foreground">Tempo Risposta</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            <Award className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{kpis.avgTRS}</p>
            <p className="text-xs text-muted-foreground">TRS Medio</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
