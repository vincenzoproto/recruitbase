import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles } from "lucide-react";

interface PremiumBadgeProps {
  isPremium: boolean;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  variant?: "default" | "outline";
}

const PremiumBadge = ({ isPremium, size = "md", showIcon = true, variant = "default" }: PremiumBadgeProps) => {
  if (!isPremium) {
    return (
      <Badge 
        variant={variant}
        className="bg-muted text-muted-foreground border-none"
      >
        Free
      </Badge>
    );
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Badge 
      className={`
        bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600
        text-white border-none
        shadow-lg hover:shadow-xl
        transition-all duration-300
        ${sizeClasses[size]}
        animate-pulse
      `}
    >
      {showIcon && <Crown className={`${iconSizes[size]} mr-1`} />}
      Premium
      {showIcon && size !== "sm" && <Sparkles className={`${iconSizes[size]} ml-1`} />}
    </Badge>
  );
};

export default PremiumBadge;
