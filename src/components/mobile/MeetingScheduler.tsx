import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MeetingSchedulerProps {
  candidateId: string;
  candidateName: string;
}

export const MeetingScheduler = ({ candidateId, candidateName }: MeetingSchedulerProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Generate all time slots from 09:00 to 18:00 with 30-minute intervals
  const timeSlots = Array.from({ length: 19 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minutes = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  });

  const handleSchedule = async () => {
    if (!date || !selectedTime) {
      toast.error("Seleziona data e ora");
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();

      const { error } = await supabase.from("meetings").insert({
        candidate_id: candidateId,
        recruiter_id: user.user?.id,
        scheduled_date: date.toISOString(),
        scheduled_time: selectedTime,
        status: "pending"
      });

      if (error) throw error;

      toast.success(`Richiesta di call inviata a ${candidateName}. In attesa di conferma.`);
      setOpen(false);
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      toast.error("Errore nell'invio della richiesta");
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <CalendarIcon className="h-4 w-4" />
        Programma call
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Programma una call</DialogTitle>
            <p className="text-sm text-muted-foreground">con {candidateName}</p>
          </DialogHeader>

          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              disabled={(date) => date < new Date()}
            />

            <div>
              <p className="text-sm font-medium mb-2">Seleziona l'orario</p>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Scegli un orario" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSchedule} className="w-full">
              Conferma appuntamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
