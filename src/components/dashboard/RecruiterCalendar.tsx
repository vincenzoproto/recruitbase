import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Plus, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Interview {
  id: string;
  candidate_id: string;
  candidate_name: string;
  date: Date;
  time: string;
  type: "phone" | "video" | "in_person";
  notes?: string;
}

interface RecruiterCalendarProps {
  userId: string;
}

export const RecruiterCalendar = ({ userId }: RecruiterCalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newInterview, setNewInterview] = useState({
    candidate_id: "",
    time: "",
    type: "video" as Interview["type"],
    notes: "",
  });

  useEffect(() => {
    loadInterviews();
    loadCandidates();
  }, [userId]);

  const loadInterviews = async () => {
    // Mock interviews (in production, load from a real table)
    const mockInterviews: Interview[] = [
      {
        id: "1",
        candidate_id: "candidate-1",
        candidate_name: "Marco Rossi",
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        time: "10:00",
        type: "video",
        notes: "Colloquio tecnico frontend",
      },
      {
        id: "2",
        candidate_id: "candidate-2",
        candidate_name: "Sara Bianchi",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        time: "14:30",
        type: "phone",
        notes: "Primo contatto telefonico",
      },
    ];
    setInterviews(mockInterviews);
  };

  const loadCandidates = async () => {
    try {
      const { data: interactions } = await supabase
        .from("interactions")
        .select("candidate_id")
        .eq("recruiter_id", userId);

      if (!interactions) return;

      const candidateIds = [...new Set(interactions.map((i) => i.candidate_id))];

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", candidateIds);

      setCandidates(data || []);
    } catch (error) {
      console.error("Error loading candidates:", error);
    }
  };

  const handleAddInterview = () => {
    if (!newInterview.candidate_id || !date || !newInterview.time) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    const candidateName = candidates.find((c) => c.id === newInterview.candidate_id)?.full_name || "Candidato";

    const interview: Interview = {
      id: `interview-${Date.now()}`,
      candidate_id: newInterview.candidate_id,
      candidate_name: candidateName,
      date,
      time: newInterview.time,
      type: newInterview.type,
      notes: newInterview.notes,
    };

    setInterviews([...interviews, interview]);
    setShowAddDialog(false);
    setNewInterview({ candidate_id: "", time: "", type: "video", notes: "" });
    toast.success("Colloquio pianificato con successo!");
  };

  const getInterviewsForDate = (selectedDate: Date) => {
    return interviews.filter(
      (i) => i.date.toDateString() === selectedDate.toDateString()
    );
  };

  const upcomingInterviews = interviews.filter((i) => i.date >= new Date()).sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Calendario Colloqui</h2>
          <p className="text-sm text-muted-foreground">
            Gestisci i tuoi appuntamenti con i candidati
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Aggiungi Colloquio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pianifica Colloquio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Candidato</Label>
                <Select
                  value={newInterview.candidate_id}
                  onValueChange={(v) => setNewInterview({ ...newInterview, candidate_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona candidato" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={it}
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-2">
                <Label>Ora</Label>
                <Input
                  type="time"
                  value={newInterview.time}
                  onChange={(e) => setNewInterview({ ...newInterview, time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={newInterview.type}
                  onValueChange={(v: any) => setNewInterview({ ...newInterview, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Telefonico</SelectItem>
                    <SelectItem value="video">Video call</SelectItem>
                    <SelectItem value="in_person">Di persona</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Note (opzionale)</Label>
                <Input
                  value={newInterview.notes}
                  onChange={(e) => setNewInterview({ ...newInterview, notes: e.target.value })}
                  placeholder="Es. Colloquio tecnico..."
                />
              </div>

              <Button onClick={handleAddInterview} className="w-full">
                Conferma
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Calendario</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={it}
              className="rounded-md border w-full"
            />

            {date && getInterviewsForDate(date).length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold text-sm">
                  Colloqui per {format(date, "d MMMM yyyy", { locale: it })}
                </h3>
                {getInterviewsForDate(date).map((interview) => (
                  <Card key={interview.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{interview.candidate_name}</span>
                      </div>
                      <Badge variant="outline">{interview.time}</Badge>
                    </div>
                    {interview.notes && (
                      <p className="text-xs text-muted-foreground mt-2">{interview.notes}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Prossimi Colloqui
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingInterviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nessun colloquio pianificato
              </p>
            ) : (
              upcomingInterviews.slice(0, 5).map((interview) => (
                <Card key={interview.id} className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{interview.candidate_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {interview.type === "phone" ? "📞" : interview.type === "video" ? "💻" : "🏢"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3" />
                      {format(interview.date, "d MMM", { locale: it })} · {interview.time}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
