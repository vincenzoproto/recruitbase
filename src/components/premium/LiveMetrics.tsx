import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Metrics {
  newContacts: number;
  weeklyConversion: number;
  avgResponseTime: number;
}

export const LiveMetrics = ({ userId }: { userId: string }) => {
  const [metrics, setMetrics] = useState<Metrics>({
    newContacts: 0,
    weeklyConversion: 0,
    avgResponseTime: 0
  });

  useEffect(() => {
    loadMetrics();
    // Refresh every 24 hours
    const interval = setInterval(loadMetrics, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadMetrics = async () => {
    try {
      const { data } = await supabase
        .from('daily_recruiter_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(7);

      if (data && data.length > 0) {
        const today = data[0];
        const weekData = data.slice(0, 7);
        
        const avgConversion = weekData.reduce((acc, d) => acc + (Number(d.weekly_conversion_rate) || 0), 0) / weekData.length;
        const avgResponse = weekData.reduce((acc, d) => acc + (Number(d.avg_response_time_hours) || 0), 0) / weekData.length;
        
        setMetrics({
          newContacts: today.new_contacts_count || 0,
          weeklyConversion: Math.round(avgConversion * 10) / 10,
          avgResponseTime: Math.round(avgResponse * 10) / 10
        });
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const metricCards = [
    {
      icon: Users,
      label: "Nuovi contatti oggi",
      value: metrics.newContacts,
      color: "text-blue-500"
    },
    {
      icon: TrendingUp,
      label: "Conversione settimanale",
      value: `${metrics.weeklyConversion}%`,
      color: "text-green-500"
    },
    {
      icon: Clock,
      label: "Tempo medio risposta",
      value: `${metrics.avgResponseTime}h`,
      color: "text-orange-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {metricCards.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <Card key={idx} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted ${metric.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
