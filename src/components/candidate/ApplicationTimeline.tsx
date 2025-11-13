import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertCircle, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Application {
  id: string;
  status: string;
  applied_at: string;
  job_offers: {
    title: string;
    city: string;
    sector: string;
  };
}

interface ApplicationTimelineProps {
  candidateId: string;
}

const statusConfig = {
  in_valutazione: {
    label: "In Valutazione",
    color: "bg-yellow-500",
    icon: Clock,
    textColor: "text-yellow-600",
  },
  colloquio: {
    label: "Colloquio",
    color: "bg-blue-500",
    icon: AlertCircle,
    textColor: "text-blue-600",
  },
  accettato: {
    label: "Accettato",
    color: "bg-green-500",
    icon: CheckCircle,
    textColor: "text-green-600",
  },
  rifiutato: {
    label: "Rifiutato",
    color: "bg-red-500",
    icon: XCircle,
    textColor: "text-red-600",
  },
};

export const ApplicationTimeline = ({ candidateId }: ApplicationTimelineProps) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, [candidateId]);

  const loadApplications = async () => {
    const { data, error } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        applied_at,
        job_offers (title, city, sector)
      `)
      .eq("candidate_id", candidateId)
      .order("applied_at", { ascending: false });

    if (!error && data) {
      setApplications(data as any);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center text-sm text-muted-foreground">Caricamento...</div>;
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nessuna candidatura ancora</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline Candidature
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          {/* Applications */}
          <div className="space-y-6">
            {applications.map((app, index) => {
              const config = statusConfig[app.status as keyof typeof statusConfig] || statusConfig.in_valutazione;
              const Icon = config.icon;

              return (
                <div key={app.id} className="relative flex gap-4 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex items-center justify-center h-12 w-12 rounded-full ${config.color} text-white flex-shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold">{app.job_offers.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {app.job_offers.sector} • {app.job_offers.city}
                        </p>
                      </div>
                      <Badge className={config.textColor} variant="outline">
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(app.applied_at), "d MMMM yyyy 'alle' HH:mm", { locale: it })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
