import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Gift, TrendingUp, History, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRewards } from "@/hooks/useRewards";
import { RewardCard } from "@/components/rewards/RewardCard";
import { RewardSuccessDialog } from "@/components/rewards/RewardSuccessDialog";
import { useGamification } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const Rewards = () => {
  const navigate = useNavigate();
  const { rewards, claims, loading, userXP, claimReward } = useRewards();
  const [claiming, setClaiming] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [claimedReward, setClaimedReward] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || "");
    };
    loadUser();
  }, []);

  const { stats } = useGamification(userId);

  const handleClaim = async (rewardId: string) => {
    setClaiming(true);
    const reward = rewards.find(r => r.id === rewardId);
    const success = await claimReward(rewardId);
    
    if (success && reward) {
      setClaimedReward(reward);
      setShowSuccess(true);
    }
    
    setClaiming(false);
  };

  const filterRewardsByCategory = (category: string) => {
    return rewards.filter(r => r.category === category);
  };

  const recentClaims = claims.slice(0, 5);

  if (loading) {
    return (
      <MainLayout>
        <div className="container max-w-6xl mx-auto p-4 md:p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Caricamento premi...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Gift className="h-8 w-8 text-primary" />
              Marketplace Premi
            </h1>
            <p className="text-muted-foreground">
              Riscatta premi esclusivi con i tuoi XP
            </p>
          </div>

          {/* XP Balance Card */}
          <Card className="min-w-[200px]">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">I tuoi XP</div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{userXP}</span>
                <span className="text-sm text-muted-foreground">XP</span>
              </div>
              {stats && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Livello {stats.level}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Low XP Warning */}
        {userXP < 50 && (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">XP insufficienti</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Completa le missioni giornaliere per guadagnare XP e riscattare premi
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    className="border-amber-500/50 hover:bg-amber-500/10"
                  >
                    Guadagna XP
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">Tutti</TabsTrigger>
            <TabsTrigger value="visibility">Visibilità</TabsTrigger>
            <TabsTrigger value="ai_tools">AI Tools</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="recruiter">Recruiter</TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-1.5" />
              Storico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  userXP={userXP}
                  onClaim={handleClaim}
                  claiming={claiming}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="visibility" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterRewardsByCategory("visibility").map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  userXP={userXP}
                  onClaim={handleClaim}
                  claiming={claiming}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ai_tools" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterRewardsByCategory("ai_tools").map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  userXP={userXP}
                  onClaim={handleClaim}
                  claiming={claiming}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="social" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterRewardsByCategory("social").map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  userXP={userXP}
                  onClaim={handleClaim}
                  claiming={claiming}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recruiter" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterRewardsByCategory("recruiter").map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  userXP={userXP}
                  onClaim={handleClaim}
                  claiming={claiming}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="space-y-3">
              {recentClaims.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">
                      Non hai ancora riscattato premi
                    </p>
                  </CardContent>
                </Card>
              ) : (
                recentClaims.map((claim) => (
                  <Card key={claim.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{claim.reward_items?.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm">
                            {claim.reward_items?.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Riscattato {new Date(claim.claimed_at).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                        <Badge
                          variant={claim.status === "delivered" ? "default" : "secondary"}
                          className="shrink-0"
                        >
                          {claim.status === "delivered" ? "Attivo" : claim.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Success Dialog */}
      {claimedReward && (
        <RewardSuccessDialog
          open={showSuccess}
          onOpenChange={setShowSuccess}
          rewardName={claimedReward.name}
          rewardIcon={claimedReward.icon}
          rewardDescription={claimedReward.description}
          xpSpent={claimedReward.cost_xp}
        />
      )}
    </MainLayout>
  );
};

export default Rewards;
