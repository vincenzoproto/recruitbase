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
    <Card className={`border-none bg-gradient-to-br ${gradient} hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden relative group cursor-pointer`}>
      <CardContent className="pt-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-4xl font-bold text-foreground transition-transform duration-300 group-hover:scale-110 origin-left">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1.5 transition-opacity group-hover:opacity-80">{subtitle}</p>}
          </div>
          <div className="w-14 h-14 rounded-2xl bg-primary/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-125 group-hover:rotate-6 shadow-lg">
            <Icon className="h-7 w-7 text-primary transition-transform group-hover:scale-110" strokeWidth={2} />
          </div>
        </div>
      </CardContent>
      {/* Animated gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
    </Card>
  );
};

export default StatsCard;
