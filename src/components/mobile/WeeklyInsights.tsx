import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WeeklyInsightsProps {
  userId: string;
}

export const WeeklyInsights = ({ userId }: WeeklyInsightsProps) => {
  const [open, setOpen] = useState(false);
  const [insights, setInsights] = useState({
    candidatesManaged: 0,
    avgTRS: 0,
    trsChange: 0
  });

  useEffect(() => {
    const today = new Date().getDay();
    const lastShown = localStorage.getItem("last-insights-shown");
    const shouldShow = today === 1 && lastShown !== new Date().toDateString();

    if (shouldShow) {
      loadInsights();
      setOpen(true);
      localStorage.setItem("last-insights-shown", new Date().toDateString());
    }
  }, []);

  const loadInsights = async () => {
    const { data: candidates } = await supabase
      .from("profiles")
      .select("talent_relationship_score")
      .eq("role", "candidate");

    if (candidates) {
      const avgTRS = candidates.reduce((sum, c) => sum + (c.talent_relationship_score || 0), 0) / candidates.length;
      setInsights({
        candidatesManaged: candidates.length,
        avgTRS: Math.round(avgTRS),
        trsChange: 8
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">📊 Insights Settimanali</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{insights.candidatesManaged}</p>
              <p className="text-sm text-muted-foreground">Candidati gestiti</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{insights.avgTRS}</p>
              <p className="text-sm text-muted-foreground">TRS medio</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">+{insights.trsChange}%</p>
              <p className="text-sm text-muted-foreground">Crescita TRS</p>
            </div>
          </div>
        </div>

        <Button onClick={() => setOpen(false)} className="w-full">
          Ottimo lavoro! 🎉
        </Button>
      </DialogContent>
    </Dialog>
  );
};
