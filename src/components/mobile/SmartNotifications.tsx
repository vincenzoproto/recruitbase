import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingDown, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SmartNotificationsProps {
  userId: string;
}

export const SmartNotifications = ({ userId }: SmartNotificationsProps) => {
  const [show, setShow] = useState(false);
  const [lowTRSCount, setLowTRSCount] = useState(0);

  useEffect(() => {
    if (userId) {
      loadLowTRSCandidates();
    }
  }, [userId]);

  const loadLowTRSCandidates = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, talent_relationship_score")
      .eq("role", "candidate")
      .lt("talent_relationship_score", 50);

    if (data && data.length > 0) {
      setLowTRSCount(data.length);
      setShow(true);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-4 md:max-w-md animate-slide-in-right">
      <Card className="p-4 shadow-lg border-primary/20 bg-card">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm">
              {lowTRSCount} candidati con TRS in calo 🔻
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Vuoi contattarli ora?
            </p>
            <Button size="sm" className="mt-2 h-8" variant="default">
              Contatta ora
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-6 w-6"
            onClick={() => setShow(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
