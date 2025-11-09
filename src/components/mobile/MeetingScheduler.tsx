import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";

interface MeetingSchedulerProps {
  candidateId: string;
  candidateName: string;
}

export const MeetingScheduler = ({ candidateId, candidateName }: MeetingSchedulerProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00",
    "14:00", "15:00", "16:00", "17:00"
  ];

  const handleSchedule = () => {
    if (!date || !selectedTime) {
      toast.error("Seleziona data e ora");
      return;
    }

    toast.success(`Call programmata con ${candidateName} per ${date.toLocaleDateString()} alle ${selectedTime}`);
    setOpen(false);
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
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
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
