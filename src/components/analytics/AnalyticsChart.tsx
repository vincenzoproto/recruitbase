import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Users, Briefcase, Eye } from "lucide-react";

interface AnalyticsData {
  date: string;
  applications: number;
  views: number;
  candidates?: number;
  jobs?: number;
}

interface AnalyticsChartProps {
  data: AnalyticsData[];
  userRole: 'recruiter' | 'candidate';
}

export const AnalyticsChart = ({ data, userRole }: AnalyticsChartProps) => {
  if (!data || data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nessun dato disponibile</p>
      </Card>
    );
  }

  const stats = [
    {
      label: userRole === 'recruiter' ? 'Candidature Ricevute' : 'Candidature Inviate',
      value: data.reduce((sum, d) => sum + (d.applications || 0), 0),
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Visualizzazioni Profilo',
      value: data.reduce((sum, d) => sum + (d.views || 0), 0),
      icon: Eye,
      color: 'text-green-500',
    },
    ...(userRole === 'recruiter' && data.length > 0 ? [{
      label: 'Offerte Attive',
      value: data[data.length - 1]?.jobs || 0,
      icon: Briefcase,
      color: 'text-purple-500',
    }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <stat.icon className={`h-12 w-12 ${stat.color} opacity-20`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Line Chart - Trend */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Andamento nel Tempo</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="applications" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Candidature"
            />
            <Line 
              type="monotone" 
              dataKey="views" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              name="Visualizzazioni"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Bar Chart - Comparison */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Confronto Attività</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="applications" fill="hsl(var(--primary))" name="Candidature" />
            <Bar dataKey="views" fill="hsl(var(--chart-2))" name="Visualizzazioni" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
