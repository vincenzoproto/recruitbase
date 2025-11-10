import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Meeting {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  candidate: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    job_title: string | null;
  };
}

interface UpcomingMeetingsCardProps {
  userId: string;
  userRole: 'recruiter' | 'candidate';
}

export const UpcomingMeetingsCard = ({ userId, userRole }: UpcomingMeetingsCardProps) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpcomingMeetings();
  }, [userId]);

  const loadUpcomingMeetings = async () => {
    try {
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

      const column = userRole === 'recruiter' ? 'recruiter_id' : 'candidate_id';
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          id,
          scheduled_date,
          scheduled_time,
          status,
          ${userRole === 'recruiter' ? 'candidate_id' : 'recruiter_id'},
          profiles!meetings_${userRole === 'recruiter' ? 'candidate' : 'recruiter'}_id_fkey(
            id,
            full_name,
            avatar_url,
            job_title
          )
        `)
        .eq(column, userId)
        .eq('status', 'confirmed')
        .gte('scheduled_date', new Date().toISOString())
        .lte('scheduled_date', twoDaysFromNow.toISOString())
        .order('scheduled_date', { ascending: true })
        .limit(5);

      if (error) throw error;

      const formattedMeetings = (data || []).map((m: any) => ({
        id: m.id,
        scheduled_date: m.scheduled_date,
        scheduled_time: m.scheduled_time,
        status: m.status,
        candidate: m.profiles,
      }));

      setMeetings(formattedMeetings);
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Colloqui prossimi 48h
          </CardTitle>
          <CardDescription>I tuoi prossimi incontri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (meetings.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Colloqui prossimi 48h
          </CardTitle>
          <CardDescription>Nessun colloquio programmato</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Colloqui prossimi 48h
        </CardTitle>
        <CardDescription>{meetings.length} colloqui confermati</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={meeting.candidate.avatar_url || undefined} />
              <AvatarFallback>
                {meeting.candidate.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{meeting.candidate.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {meeting.candidate.job_title || 'Nessun ruolo'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {format(new Date(meeting.scheduled_date), 'dd MMM', { locale: it })}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {meeting.scheduled_time}
                </span>
              </div>
            </div>
            <Button size="sm" variant="outline">
              <Video className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
