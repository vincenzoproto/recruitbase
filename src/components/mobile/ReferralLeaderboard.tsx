import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  id: string;
  full_name: string;
  avatar_url: string;
  referral_count: number;
  earnings: number;
}

export const ReferralLeaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      // 1) Carica tutti i referral (solo ambassador_id) e raggruppa lato client
      const { data: refData, error: refErr } = await supabase
        .from("ambassador_referrals")
        .select("ambassador_id");
      if (refErr) throw refErr;

      const grouped = (refData || []).reduce((acc: any, curr: any) => {
        const id = curr.ambassador_id;
        if (!acc[id]) {
          acc[id] = { id, referral_count: 0, earnings: 0 };
        }
        acc[id].referral_count += 1;
        acc[id].earnings += 10;
        return acc;
      }, {} as Record<string, LeaderboardEntry>);

      const ids = Object.keys(grouped);
      if (ids.length === 0) {
        setLeaders([]);
        return;
      }

      // 2) Recupera i profili degli ambassador in un'unica query
      const { data: profilesData, error: profErr } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", ids);
      if (profErr) throw profErr;

      const withProfiles = ids.map((id) => {
        const prof = profilesData?.find((p) => p.id === id);
        return {
          id,
          full_name: prof?.full_name || "Utente",
          avatar_url: prof?.avatar_url || "",
          referral_count: (grouped as any)[id].referral_count,
          earnings: (grouped as any)[id].earnings,
        } as LeaderboardEntry;
      });

      const sorted = withProfiles
        .sort((a, b) => b.referral_count - a.referral_count)
        .slice(0, 10);

      setLeaders(sorted);
    } catch (e) {
      console.error("Error loading referral leaderboard:", e);
      setLeaders([]);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankBadge = (index: number) => {
    if (index < 3) {
      const colors = ["bg-yellow-500", "bg-gray-400", "bg-orange-600"];
      return <Badge className={`${colors[index]} text-white`}>Top {index + 1}</Badge>;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Classifica Ambassador
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {leaders.map((leader, index) => (
              <div
                key={leader.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  index < 3 ? "bg-gradient-to-r from-primary/5 to-primary/10" : "bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getRankIcon(index) || (
                      <span className="text-sm font-bold text-muted-foreground w-5 text-center">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={leader.avatar_url} />
                    <AvatarFallback>{leader.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{leader.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {leader.referral_count} referral • €{leader.earnings}
                    </p>
                  </div>
                </div>
                {getRankBadge(index)}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
