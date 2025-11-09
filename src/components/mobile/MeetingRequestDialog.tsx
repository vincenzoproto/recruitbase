import { useState, useEffect } from "react";
import { Calendar, Clock, User, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Meeting {
  id: string;
  recruiter_id: string;
  candidate_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  notes?: string;
  recruiter_name?: string;
}

interface MeetingRequestDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MeetingRequestDialog = ({
  userId,
  open,
  onOpenChange,
}: MeetingRequestDialogProps) => {
  const [pendingMeetings, setPendingMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadPendingMeetings();
    }
  }, [open, userId]);

  const loadPendingMeetings = async () => {
    const { data, error } = await supabase
      .from("meetings")
      .select(`
        *,
        profiles!meetings_recruiter_id_fkey(full_name)
      `)
      .eq("candidate_id", userId)
      .eq("status", "pending")
      .order("scheduled_date", { ascending: true });

    if (error) {
      console.error("Error loading pending meetings:", error);
      return;
    }

    const meetingsWithNames = data?.map((meeting: any) => ({
      ...meeting,
      recruiter_name: meeting.profiles?.full_name || "Recruiter",
    }));

    setPendingMeetings(meetingsWithNames || []);
  };

  const handleResponse = async (meetingId: string, status: "confirmed" | "rejected") => {
    setLoading(true);

    const { error } = await supabase
      .from("meetings")
      .update({ status })
      .eq("id", meetingId);

    if (error) {
      toast.error("Errore nell'aggiornamento della richiesta");
      setLoading(false);
      return;
    }

    toast.success(
      status === "confirmed"
        ? "Call confermata!"
        : "Richiesta rifiutata"
    );

    // Reload pending meetings
    await loadPendingMeetings();
    setLoading(false);

    // Close dialog if no more pending meetings
    if (pendingMeetings.length === 1) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Richieste di Call</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {pendingMeetings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nessuna richiesta di call in sospeso
            </p>
          ) : (
            pendingMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="p-4 border border-border rounded-lg space-y-3"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{meeting.recruiter_name}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(meeting.scheduled_date).toLocaleDateString("it-IT")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {meeting.scheduled_time}
                  </div>
                </div>

                {meeting.notes && (
                  <p className="text-sm text-muted-foreground">{meeting.notes}</p>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleResponse(meeting.id, "confirmed")}
                    disabled={loading}
                    className="flex-1"
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Conferma
                  </Button>
                  <Button
                    onClick={() => handleResponse(meeting.id, "rejected")}
                    disabled={loading}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rifiuta
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
