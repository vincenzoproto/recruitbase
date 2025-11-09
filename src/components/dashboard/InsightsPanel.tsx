import { Card } from "@/components/ui/card";
import { Eye, Send, TrendingUp, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Insights {
  profileViews: number;
  applicationsSent: number;
  responseRate: number;
}

export const InsightsPanel = ({ userId, role }: { userId: string; role: "recruiter" | "candidate" }) => {
  const [insights, setInsights] = useState<Insights>({ profileViews: 0, applicationsSent: 0, responseRate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [userId]);

  const loadInsights = async () => {
    try {
      const { data: insightsData } = await supabase
        .from("user_insights")
        .select("*")
        .eq("user_id", userId);

      const profileViews = insightsData?.find(i => i.metric_type === "profile_views")?.metric_value || 0;
      const applicationsSent = insightsData?.find(i => i.metric_type === "applications_sent")?.metric_value || 0;

      // Calculate response rate (mock for now)
      const responseRate = applicationsSent > 0 ? Math.round((applicationsSent * 0.65) / applicationsSent * 100) : 0;

      setInsights({ profileViews, applicationsSent, responseRate });
    } catch (error) {
      console.error("Error loading insights:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-muted rounded-lg" />;
  }

  const stats = role === "candidate" ? [
    { icon: Eye, label: "Visualizzazioni Profilo", value: insights.profileViews, color: "text-blue-500" },
    { icon: Send, label: "Candidature Inviate", value: insights.applicationsSent, color: "text-green-500" },
    { icon: TrendingUp, label: "Tasso di Risposta", value: `${insights.responseRate}%`, color: "text-primary" }
  ] : [
    { icon: Eye, label: "Profili Visualizzati", value: insights.profileViews, color: "text-blue-500" },
    { icon: MessageCircle, label: "Candidature Ricevute", value: insights.applicationsSent, color: "text-green-500" },
    { icon: TrendingUp, label: "Match Score Medio", value: "85%", color: "text-primary" }
  ];

  return (
    <Card className="p-6 glass-card border-primary/20">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        I Tuoi Insights
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-3 p-4 rounded-lg bg-background/50">
              <Icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
