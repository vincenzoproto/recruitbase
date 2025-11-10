import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, TrendingUp, Users, MessageCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RecruiterAnalyticsProps {
  userId: string;
}

export const RecruiterAnalytics = ({ userId }: RecruiterAnalyticsProps) => {
  const [period, setPeriod] = useState<"7" | "30" | "90">("7");
  const [loading, setLoading] = useState(true);
  const [trsData, setTrsData] = useState<any[]>([]);
  const [matchData, setMatchData] = useState<any[]>([]);
  const [responseTime, setResponseTime] = useState(0);
  const [insights, setInsights] = useState<string>("");

  useEffect(() => {
    loadAnalytics();
  }, [userId, period]);

  const loadAnalytics = async () => {
    try {
      const days = parseInt(period);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      // Load TRS trend data
      const { data: interactions } = await supabase
        .from("interactions")
        .select("created_at, candidate_id")
        .eq("recruiter_id", userId)
        .gte("created_at", startDate)
        .order("created_at");

      // Load matches data
      const { data: matches } = await supabase
        .from("matches")
        .select("created_at")
        .or(`recruiter_id.eq.${userId},candidate_id.eq.${userId}`)
        .gte("created_at", startDate);

      // Generate TRS trend (mock aggregation by day)
      const trsTrend = generateDailyTrend(interactions || [], days, "TRS");
      setTrsData(trsTrend);

      // Generate match trend
      const matchTrend = generateDailyTrend(matches || [], days, "Match");
      setMatchData(matchTrend);

      // Calculate average response time (mock)
      const avgResponse = Math.floor(Math.random() * 12) + 4;
      setResponseTime(avgResponse);

      // Generate AI insight
      const avgResponseBenchmark = 10;
      const diff = ((avgResponse - avgResponseBenchmark) / avgResponseBenchmark) * 100;
      if (diff < 0) {
        setInsights(`Il tuo tempo di risposta è ${Math.abs(Math.round(diff))}% più veloce della media 🚀`);
      } else {
        setInsights(`Migliora il tuo tempo di risposta per ottenere più match (+${Math.round(diff)}% rispetto alla media)`);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Errore nel caricamento analytics");
    } finally {
      setLoading(false);
    }
  };

  const generateDailyTrend = (data: any[], days: number, label: string) => {
    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000);
      const count = data.filter((item) => {
        const itemDate = new Date(item.created_at);
        return itemDate.toDateString() === date.toDateString();
      }).length;

      result.push({
        date: date.toLocaleDateString("it-IT", { day: "2-digit", month: "short" }),
        value: label === "TRS" ? 60 + Math.floor(Math.random() * 20) : count,
      });
    }
    return result;
  };

  const handleDownloadPDF = () => {
    toast.info("Download report PDF in sviluppo 📄");
  };

  if (loading) {
    return <div className="text-center p-8">Caricamento analytics...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics & Report</h2>
          <p className="text-sm text-muted-foreground">
            Monitora le tue performance
          </p>
        </div>
        <Button onClick={handleDownloadPDF} className="gap-2">
          <Download className="h-4 w-4" />
          Scarica Report PDF
        </Button>
      </div>

      {/* Period Filter */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="7">7 giorni</TabsTrigger>
          <TabsTrigger value="30">30 giorni</TabsTrigger>
          <TabsTrigger value="90">90 giorni</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* AI Insight Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Insight AI</p>
              <p className="text-sm text-muted-foreground">{insights}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              Tempo Risposta Medio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{responseTime}h</p>
              <Badge variant="outline" className="text-xs">
                {responseTime < 10 ? "Ottimo" : "Nella media"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Match Settimanali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">
                {matchData.reduce((sum, d) => sum + d.value, 0)}
              </p>
              <Badge variant="outline" className="text-xs">
                Ultimi 7 giorni
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              Fit Medio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">78%</p>
              <Badge variant="default" className="text-xs">
                Eccellente
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TRS Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">TRS Medio nel Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis domain={[0, 100]} className="text-xs" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Match Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Match per Giorno</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={matchData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
