import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const AIInsightsChart = ({ userId }: { userId: string }) => {
  const [trendData, setTrendData] = useState<{ current: number; previous: number; trend: number }>({
    current: 0,
    previous: 0,
    trend: 0
  });

  useEffect(() => {
    loadTRSTrend();
  }, [userId]);

  const loadTRSTrend = async () => {
    try {
      // Get current TRS from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('talent_relationship_score')
        .eq('id', userId)
        .single();

      if (profile) {
        const current = profile.talent_relationship_score || 0;
        // Simulate previous week's score (in real app, store historical data)
        const previous = Math.max(0, current - Math.floor(Math.random() * 20 - 5));
        const trend = current - previous;
        
        setTrendData({ current, previous, trend });
      }
    } catch (error) {
      console.error('Error loading TRS trend:', error);
    }
  };

  const trendPercentage = trendData.previous > 0 
    ? Math.round((trendData.trend / trendData.previous) * 100)
    : 0;

  const isPositive = trendData.trend >= 0;

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">AI Insights™</h3>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">TRS Score Attuale</p>
          <p className="text-3xl font-bold">{trendData.current}</p>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
          isPositive ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
        }`}>
          {isPositive ? (
            <TrendingUp className="h-5 w-5" />
          ) : (
            <TrendingDown className="h-5 w-5" />
          )}
          <span className="font-semibold">{isPositive ? '+' : ''}{trendPercentage}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Questa settimana</span>
          <span className="font-medium">{trendData.current}</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${trendData.current}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-4">
        {isPositive ? (
          <>✨ Ottimo lavoro! Il tuo TRS è in crescita questa settimana</>
        ) : (
          <>💡 Suggerimento: Aumenta l'interazione con i candidati per migliorare il TRS</>
        )}
      </p>
    </Card>
  );
};
