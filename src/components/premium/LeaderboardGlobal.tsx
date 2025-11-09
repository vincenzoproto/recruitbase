import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  country: string;
  avg_trs: number;
  total_referral_earnings: number;
  badge_type: 'gold' | 'silver' | 'bronze' | 'none';
  ranking_position: number;
}

export const LeaderboardGlobal = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data: stats } = await supabase
        .from('recruiter_stats')
        .select('user_id, country, avg_trs, total_referral_earnings, badge_type, ranking_position')
        .order('ranking_position', { ascending: true })
        .limit(10);

      if (stats) {
        // Get profile names
        const userIds = stats.map(s => s.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        const enriched = stats.map(stat => {
          const profile = profiles?.find(p => p.id === stat.user_id);
          return {
            ...stat,
            badge_type: stat.badge_type as 'gold' | 'silver' | 'bronze' | 'none',
            full_name: profile?.full_name || 'Recruiter',
          };
        });

        setLeaderboard(enriched);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badge: string, position: number) => {
    switch (badge) {
      case 'gold':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'silver':
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 'bronze':
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return <span className="text-muted-foreground">#{position}</span>;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Caricamento classifica...</h3>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Trophy className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Leaderboard TRM Globale</h3>
          <p className="text-sm text-muted-foreground">Top recruiter del mese</p>
        </div>
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry) => (
          <div
            key={entry.user_id}
            className={`p-4 rounded-lg border transition-all ${
              entry.ranking_position <= 3
                ? 'bg-gradient-to-r from-primary/5 to-primary/10 border-primary/30'
                : 'bg-card'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                  {getBadgeIcon(entry.badge_type, entry.ranking_position || 0)}
                </div>
                <div>
                  <h4 className="font-medium">{entry.full_name}</h4>
                  <p className="text-sm text-muted-foreground">{entry.country || 'Global'}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-lg text-primary">TRS {entry.avg_trs}</p>
                <p className="text-sm text-muted-foreground">
                  €{Number(entry.total_referral_earnings).toFixed(0)} guadagni
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
