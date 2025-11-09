import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TRSBadgeProps {
  score: number;
  showTrend?: boolean;
  trend?: number;
  size?: "sm" | "md" | "lg";
}

const TRSBadge = ({ score, showTrend = false, trend = 0, size = "md" }: TRSBadgeProps) => {
  // Recruit Base TRS proprietary algorithm visualization
  const getColor = (score: number) => {
    if (score >= 70) return { bg: "bg-green-500", text: "text-green-700", light: "bg-green-50" };
    if (score >= 40) return { bg: "bg-yellow-500", text: "text-yellow-700", light: "bg-yellow-50" };
    return { bg: "bg-red-500", text: "text-red-700", light: "bg-red-50" };
  };

  const colors = getColor(score);
  const barWidth = `${Math.min(score, 100)}%`;

  const sizeClasses = {
    sm: { container: "text-xs", badge: "px-2 py-1", bar: "h-1" },
    md: { container: "text-sm", badge: "px-3 py-1.5", bar: "h-2" },
    lg: { container: "text-base", badge: "px-4 py-2", bar: "h-3" }
  };

  const classes = sizeClasses[size];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex flex-col gap-1 ${classes.container}`}>
            <div className={`flex items-center gap-2 ${colors.light} ${classes.badge} rounded-full`}>
              <span className="font-mono font-bold text-foreground">{score}</span>
              <span className={`font-semibold ${colors.text}`}>TRS™</span>
              {showTrend && trend !== 0 && (
                <span className={`flex items-center gap-0.5 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(trend)}%
                </span>
              )}
            </div>
            <div className="relative w-full bg-muted rounded-full overflow-hidden" style={{ height: classes.bar }}>
              <div
                className={`${colors.bg} h-full rounded-full transition-all duration-500 ease-out`}
                style={{ width: barWidth }}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">Talent Relationship Score™</p>
            <p className="text-xs text-muted-foreground">
              Misura proprietaria che valuta la qualità e la vitalità della relazione tra te e questo talento.
            </p>
            <p className="text-xs italic text-muted-foreground mt-2">
              Proprietary Metric by Recruit Base
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TRSBadge;
