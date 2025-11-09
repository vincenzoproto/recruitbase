import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  gradient?: string;
}

const StatsCard = ({ title, value, icon: Icon, subtitle, gradient = "from-primary/10 to-primary/5" }: StatsCardProps) => {
  return (
    <Card className={`border-none bg-gradient-to-br ${gradient} hover:shadow-[0_4px_20px_rgba(0,122,255,0.15)] smooth-transition overflow-hidden relative group`}>
      <CardContent className="pt-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-4xl font-bold text-foreground smooth-transition group-hover:scale-105">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>}
          </div>
          <div className="w-14 h-14 rounded-2xl bg-primary/10 backdrop-blur-sm flex items-center justify-center smooth-transition group-hover:bg-primary/20 group-hover:scale-110">
            <Icon className="h-7 w-7 text-primary" strokeWidth={2} />
          </div>
        </div>
      </CardContent>
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-primary/5 opacity-0 group-hover:opacity-100 smooth-transition" />
    </Card>
  );
};

export default StatsCard;
