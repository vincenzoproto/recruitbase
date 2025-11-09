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
        bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500
        text-white border-none
        shadow-[0_4px_16px_rgba(251,191,36,0.4)] hover:shadow-[0_6px_24px_rgba(251,191,36,0.5)]
        smooth-transition
        ${sizeClasses[size]}
        animate-glow
        rounded-full
      `}
    >
      {showIcon && <Crown className={`${iconSizes[size]} mr-1`} />}
      Premium
      {showIcon && size !== "sm" && <Sparkles className={`${iconSizes[size]} ml-1`} />}
    </Badge>
  );
};

export default PremiumBadge;
