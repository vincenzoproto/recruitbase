import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";

interface Meeting {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  recruiter_id: string;
  candidate_id: string;
  recruiter?: {
    full_name: string;
    job_title?: string;
  };
  candidate?: {
    full_name: string;
  };
}

interface MeetingConfirmationBannerProps {
  userId: string;
  userRole: 'candidate' | 'recruiter';
}

export const MeetingConfirmationBanner = ({ userId, userRole }: MeetingConfirmationBannerProps) => {
  const [pendingMeetings, setPendingMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingMeetings();

    // Real-time subscription
    const channel = supabase
      .channel('meetings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meetings',
          filter: userRole === 'candidate' 
            ? `candidate_id=eq.${userId}` 
            : `recruiter_id=eq.${userId}`
        },
        () => {
          loadPendingMeetings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userRole]);

  const loadPendingMeetings = async () => {
    try {
      const query = supabase
        .from('meetings')
        .select(`
          *,
          recruiter:profiles!meetings_recruiter_id_fkey(full_name, job_title),
          candidate:profiles!meetings_candidate_id_fkey(full_name)
        `)
        .eq('status', 'pending');

      if (userRole === 'candidate') {
        query.eq('candidate_id', userId);
      } else {
        query.eq('recruiter_id', userId);
      }

      const { data, error } = await query.order('scheduled_date', { ascending: true });

      if (error) throw error;
      setPendingMeetings(data || []);
    } catch (error) {
      console.error('Error loading meetings:', error);
    }
  };

  const handleConfirm = async (meetingId: string, meeting: Meeting) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('meetings')
        .update({ status: 'confirmed' })
        .eq('id', meetingId);

      if (error) throw error;

      // Send notification to recruiter
      if (userRole === 'candidate') {
        await supabase.from('notifications').insert({
          user_id: meeting.recruiter_id,
          type: 'meeting',
          title: '✅ Colloquio confermato!',
          message: `${meeting.candidate?.full_name} ha confermato il colloquio del ${new Date(meeting.scheduled_date).toLocaleDateString('it-IT')} alle ${meeting.scheduled_time}`,
          link: '/dashboard',
          read: false
        });
      }

      toast.success("✅ Colloquio confermato!");
      loadPendingMeetings();
    } catch (error) {
      console.error('Error confirming meeting:', error);
      toast.error("Errore nella conferma");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (meetingId: string, meeting: Meeting) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('meetings')
        .update({ status: 'rejected' })
        .eq('id', meetingId);

      if (error) throw error;

      // Send notification to recruiter
      if (userRole === 'candidate') {
        await supabase.from('notifications').insert({
          user_id: meeting.recruiter_id,
          type: 'meeting',
          title: '❌ Colloquio rifiutato',
          message: `${meeting.candidate?.full_name} ha rifiutato il colloquio del ${new Date(meeting.scheduled_date).toLocaleDateString('it-IT')}`,
          link: '/dashboard',
          read: false
        });
      }

      toast.info("Colloquio rifiutato");
      loadPendingMeetings();
    } catch (error) {
      console.error('Error rejecting meeting:', error);
      toast.error("Errore nel rifiuto");
    } finally {
      setLoading(false);
    }
  };

  if (pendingMeetings.length === 0) return null;

  return (
    <div className="space-y-3">
      {pendingMeetings.map((meeting) => (
        <Card key={meeting.id} className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {userRole === 'candidate' 
                    ? `Colloquio con ${meeting.recruiter?.full_name}` 
                    : `Colloquio con ${meeting.candidate?.full_name}`}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  {new Date(meeting.scheduled_date).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                  })} alle {meeting.scheduled_time}
                </div>
                {meeting.recruiter?.job_title && userRole === 'candidate' && (
                  <p className="text-xs text-muted-foreground">{meeting.recruiter.job_title}</p>
                )}
              </div>
            </div>
            {userRole === 'candidate' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleConfirm(meeting.id, meeting)}
                  disabled={loading}
                  className="h-8"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Conferma
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(meeting.id, meeting)}
                  disabled={loading}
                  className="h-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {userRole === 'recruiter' && (
              <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                In attesa di conferma
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
