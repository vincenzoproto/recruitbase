import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, Lock } from "lucide-react";
import type { Reward } from "@/hooks/useRewards";

interface RewardCardProps {
  reward: Reward;
  userXP: number;
  onClaim: (rewardId: string) => void;
  claiming: boolean;
}

export function RewardCard({ reward, userXP, onClaim, claiming }: RewardCardProps) {
  const canAfford = userXP >= reward.cost_xp;
  const isOutOfStock = reward.stock !== null && reward.stock <= 0;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      visibility: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      ai_tools: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      social: "bg-pink-500/10 text-pink-600 border-pink-500/20",
      recruiter: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      bonus: "bg-green-500/10 text-green-600 border-green-500/20",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      visibility: "Visibilità",
      ai_tools: "AI Tools",
      social: "Social",
      recruiter: "Recruiter",
      bonus: "Bonus",
    };
    return labels[category] || category;
  };

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${
      !canAfford ? "opacity-60" : ""
    }`}>
      {/* Category Badge */}
      <div className="absolute top-3 right-3 z-10">
        <Badge 
          variant="outline" 
          className={`text-xs font-medium ${getCategoryColor(reward.category)}`}
        >
          {getCategoryLabel(reward.category)}
        </Badge>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="text-4xl">{reward.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight mb-1">
              {reward.name}
            </h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {reward.description}
        </p>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-sm font-bold">{reward.cost_xp} XP</span>
          </div>
          
          {reward.stock !== null && (
            <Badge variant="secondary" className="text-xs">
              {reward.stock > 0 ? `${reward.stock} disponibili` : "Esaurito"}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        {isOutOfStock ? (
          <Button variant="outline" disabled className="w-full">
            <Lock className="h-4 w-4 mr-2" />
            Esaurito
          </Button>
        ) : !canAfford ? (
          <Button variant="outline" disabled className="w-full">
            <Lock className="h-4 w-4 mr-2" />
            XP insufficienti
          </Button>
        ) : (
          <Button
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            onClick={() => onClaim(reward.id)}
            disabled={claiming}
          >
            <Gift className="h-4 w-4 mr-2" />
            Riscatta Premio
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
