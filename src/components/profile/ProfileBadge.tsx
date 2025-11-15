import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Award, Trophy, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const LEVEL_CONFIG = {
  bronze: { name: "Bronze", min: 0, color: "text-orange-600 border-orange-600", icon: Award },
  silver: { name: "Silver", min: 100, color: "text-gray-400 border-gray-400", icon: Trophy },
  gold: { name: "Gold", min: 500, color: "text-yellow-500 border-yellow-500", icon: Star },
  platinum: { name: "Platinum", min: 1000, color: "text-purple-500 border-purple-500", icon: Crown },
};

interface ProfileBadgeProps {
  userId: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const ProfileBadge = ({ userId, size = "md", showIcon = true }: ProfileBadgeProps) => {
  const [level, setLevel] = useState<keyof typeof LEVEL_CONFIG>("bronze");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserLevel();
  }, [userId]);

  const loadUserLevel = async () => {
    try {
      const { data } = await supabase
        .from("recruiter_stats")
        .select("badge_type")
        .eq("user_id", userId)
        .maybeSingle();

      if (data?.badge_type) {
        const key = (data.badge_type.toLowerCase() as keyof typeof LEVEL_CONFIG);
        setLevel(LEVEL_CONFIG[key] ? key : "bronze");
      } else {
        setLevel("bronze");
      }
    } catch (error) {
      console.error("Error loading user level:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  const config = LEVEL_CONFIG[level];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const badgeSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  if (!showIcon) {
    // Return just a colored border ring
    return (
      <div className={cn(
        "absolute -inset-1 rounded-full border-2",
        config.color.split(' ')[1]
      )} />
    );
  }

  return (
    <div
      className={cn(
        "absolute -bottom-1 -right-1 rounded-full bg-background border-2 flex items-center justify-center shadow-lg",
        config.color,
        badgeSizes[size]
      )}
      title={`Livello ${config.name}`}
    >
      <Icon className={sizeClasses[size]} />
    </div>
  );
};
