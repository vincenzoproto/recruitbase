import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Send, Zap, CheckCircle, X, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduledFollowUp {
  id: string;
  candidate_id: string;
  candidate_name: string;
  scheduled_date: string;
  template_name: string;
  status: string;
}

const TEMPLATES = {
  gentle_reminder: {
    name: "Promemoria Gentile",
    message: "Ciao {name}! Solo un veloce promemoria per la nostra ultima conversazione. Hai avuto modo di pensarci? Resto a disposizione per qualsiasi chiarimento.",
    delay_days: 3,
  },
  status_update: {
    name: "Aggiornamento Stato",
    message: "Buongiorno {name}, volevo aggiornarti sullo stato della tua candidatura. Ci sono novità interessanti. Quando possiamo fare una call?",
    delay_days: 7,
  },
  urgent_response: {
    name: "Risposta Urgente",
    message: "Ciao {name}, ho bisogno di una tua conferma entro domani per procedere. Puoi farmi sapere?",
    delay_days: 1,
  },
  friendly_checkin: {
    name: "Check-in Amichevole",
    message: "Ciao {name}! Come va? Volevo sapere se hai novità o domande sulla posizione. Sono qui per aiutarti!",
    delay_days: 5,
  },
  final_call: {
    name: "Ultimo Tentativo",
    message: "Ciao {name}, questa è l'ultima occasione per questa opportunità. Se sei ancora interessato, rispondimi entro 48h. Altrimenti procederò con altri candidati.",
    delay_days: 2,
  },
};

export const AutoFollowUpPanel = ({ recruiterId }: { recruiterId: string }) => {
  const [scheduled, setScheduled] = useState<ScheduledFollowUp[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCandidates();
    loadScheduled();
  }, [recruiterId]);

  const loadCandidates = async () => {
    try {
      // Load candidates from interactions
      const { data: interactions } = await supabase
        .from("interactions")
        .select(`
          candidate_id,
          profiles!interactions_candidate_id_fkey(id, full_name)
        `)
        .eq("recruiter_id", recruiterId);

      if (interactions) {
        const uniqueCandidates = Array.from(
          new Map(interactions.map((i: any) => [i.profiles.id, i.profiles])).values()
        );
        setCandidates(uniqueCandidates as any[]);
      }
    } catch (error) {
      console.error("Error loading candidates:", error);
    }
  };

  const loadScheduled = async () => {
    try {
      const { data } = await supabase
        .from("follow_ups")
        .select(`
          id,
          candidate_id,
          followup_due,
          followup_message,
          followup_sent,
          profiles!follow_ups_candidate_id_fkey(full_name)
        `)
        .eq("recruiter_id", recruiterId)
        .eq("followup_sent", false)
        .not("followup_due", "is", null)
        .order("followup_due");

      if (data) {
        setScheduled(
          data.map((f: any) => ({
            id: f.id,
            candidate_id: f.candidate_id,
            candidate_name: f.profiles.full_name,
            scheduled_date: f.followup_due,
            template_name: "Programmato",
            status: "pending",
          }))
        );
      }
    } catch (error) {
      console.error("Error loading scheduled:", error);
    }
  };

  const scheduleFollowUp = async () => {
    if (selectedCandidates.length === 0 || !selectedTemplate) {
      toast.error("Seleziona almeno un candidato e un template");
      return;
    }

    setLoading(true);
    try {
      const template = TEMPLATES[selectedTemplate as keyof typeof TEMPLATES];
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + template.delay_days);

      for (const candidateId of selectedCandidates) {
        const candidate = candidates.find((c) => c.id === candidateId);
        const message = template.message.replace("{name}", candidate?.full_name || "");

        // Check if follow-up already exists
        const { data: existing } = await supabase
          .from("follow_ups")
          .select("id")
          .eq("candidate_id", candidateId)
          .eq("recruiter_id", recruiterId)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("follow_ups")
            .update({
              followup_due: scheduledDate.toISOString(),
              followup_message: message,
              followup_sent: false,
            })
            .eq("id", existing.id);
        } else {
          await supabase.from("follow_ups").insert({
            candidate_id: candidateId,
            recruiter_id: recruiterId,
            followup_due: scheduledDate.toISOString(),
            followup_message: message,
            last_contact: new Date().toISOString(),
          });
        }
      }

      toast.success(`Follow-up programmato per ${selectedCandidates.length} candidati`);
      loadScheduled();
      setSelectedCandidates([]);
      setSelectedTemplate("");
    } catch (error) {
      console.error("Error scheduling follow-up:", error);
      toast.error("Errore nella programmazione");
    } finally {
      setLoading(false);
    }
  };

  const sendNow = async (followUpId: string, candidateId: string, candidateName: string) => {
    try {
      const { data: followUp } = await supabase
        .from("follow_ups")
        .select("followup_message")
        .eq("id", followUpId)
        .single();

      if (!followUp) return;

      // Send message
      await supabase.from("messages").insert({
        sender_id: recruiterId,
        receiver_id: candidateId,
        content: followUp.followup_message,
      });

      // Mark as sent
      await supabase
        .from("follow_ups")
        .update({ followup_sent: true })
        .eq("id", followUpId);

      toast.success(`Messaggio inviato a ${candidateName}`);
      loadScheduled();
    } catch (error) {
      console.error("Error sending follow-up:", error);
      toast.error("Errore nell'invio");
    }
  };

  const cancelFollowUp = async (followUpId: string) => {
    try {
      await supabase
        .from("follow_ups")
        .update({ followup_due: null, followup_message: null })
        .eq("id", followUpId);

      toast.success("Follow-up cancellato");
      loadScheduled();
    } catch (error) {
      console.error("Error canceling follow-up:", error);
      toast.error("Errore nella cancellazione");
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Follow-up Automatico ⚡
          </CardTitle>
          <CardDescription>
            Imposta messaggi automatici con 1 click. Niente più dimenticanze!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Seleziona Candidati</p>
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                {selectedCandidates.length} selezionati
              </Badge>
            </div>
            
            <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-lg p-2">
              {candidates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nessun candidato trovato</p>
              ) : (
                candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center gap-2 p-2 rounded hover:bg-accent/50 cursor-pointer"
                    onClick={() => {
                      setSelectedCandidates((prev) =>
                        prev.includes(candidate.id)
                          ? prev.filter((id) => id !== candidate.id)
                          : [...prev, candidate.id]
                      );
                    }}
                  >
                    <Checkbox
                      checked={selectedCandidates.includes(candidate.id)}
                      onCheckedChange={() => {
                        setSelectedCandidates((prev) =>
                          prev.includes(candidate.id)
                            ? prev.filter((id) => id !== candidate.id)
                            : [...prev, candidate.id]
                        );
                      }}
                    />
                    <span className="text-sm flex-1">{candidate.full_name}</span>
                  </div>
                ))
              )}
            </div>

            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona template" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TEMPLATES).map(([key, template]) => (
                  <SelectItem key={key} value={key}>
                    {template.name} • {template.delay_days} giorni
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && selectedCandidates.length > 0 && (
            <div className="p-3 rounded-lg bg-accent/50 text-sm">
              <p className="font-medium mb-1">Anteprima messaggio:</p>
              <p className="text-muted-foreground">
                {TEMPLATES[selectedTemplate as keyof typeof TEMPLATES].message.replace(
                  "{name}",
                  selectedCandidates.length === 1
                    ? candidates.find((c) => c.id === selectedCandidates[0])?.full_name || "Candidato"
                    : `${selectedCandidates.length} candidati`
                )}
              </p>
            </div>
          )}

          <Button
            className="w-full"
            onClick={scheduleFollowUp}
            disabled={selectedCandidates.length === 0 || !selectedTemplate || loading}
          >
            <Clock className="h-4 w-4 mr-2" />
            Programma per {selectedCandidates.length} candidat{selectedCandidates.length === 1 ? 'o' : 'i'}
          </Button>
        </CardContent>
      </Card>

      {/* Scheduled List */}
      {scheduled.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Follow-up Programmati</CardTitle>
            <CardDescription>{scheduled.length} messaggi in coda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {scheduled.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.candidate_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {new Date(item.scheduled_date).toLocaleString("it-IT", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendNow(item.id, item.candidate_id, item.candidate_name)}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => cancelFollowUp(item.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
