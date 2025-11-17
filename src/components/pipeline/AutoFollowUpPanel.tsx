import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Zap, Send, Clock, Sparkles, AlertCircle, Mail, CheckCircle2 } from "lucide-react";
import { useAutoFollowUp, type CandidateForFollowUp } from "@/hooks/useAutoFollowUp";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface AutoFollowUpPanelProps {
  recruiterId: string;
  filterMinMatch?: number;
  filterUncontacted?: boolean;
}

export const AutoFollowUpPanel = ({ 
  recruiterId, 
  filterMinMatch = 0,
  filterUncontacted = false 
}: AutoFollowUpPanelProps) => {
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [generatedMessage, setGeneratedMessage] = useState<string>("");
  const [scheduleType, setScheduleType] = useState<"immediate" | "24h" | "48h" | "custom">("24h");
  const [customDateTime, setCustomDateTime] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const { 
    templates, 
    candidates, 
    loading, 
    scheduledCount, 
    generateMessage, 
    scheduleMessage, 
    refresh 
  } = useAutoFollowUp(recruiterId);

  // Filter candidates based on props
  const filteredCandidates = useMemo(() => {
    let result = candidates;
    
    if (filterUncontacted) {
      result = result.filter(c => !c.lastMessageDate);
    }
    
    return result;
  }, [candidates, filterUncontacted]);

  const handleSelectAll = () => {
    if (selectedCandidates.size === filteredCandidates.length) {
      setSelectedCandidates(new Set());
    } else {
      const validIds = filteredCandidates
        .filter(c => c.email)
        .map(c => c.id);
      setSelectedCandidates(new Set(validIds));
    }
  };

  const handleToggleCandidate = (candidateId: string) => {
    const candidate = filteredCandidates.find(c => c.id === candidateId);
    if (!candidate?.email) {
      toast.error("Questo candidato non ha un'email valida");
      return;
    }

    const newSet = new Set(selectedCandidates);
    if (newSet.has(candidateId)) {
      newSet.delete(candidateId);
    } else {
      newSet.add(candidateId);
    }
    setSelectedCandidates(newSet);
  };

  const handleGeneratePreview = async () => {
    if (!selectedTemplate) {
      toast.error('Seleziona un template');
      return;
    }
    
    if (selectedCandidates.size === 0) {
      toast.error('Seleziona almeno un candidato');
      return;
    }

    setIsGenerating(true);
    
    const firstCandidateId = Array.from(selectedCandidates)[0];
    const candidate = filteredCandidates.find(c => c.id === firstCandidateId);
    
    if (!candidate) {
      setIsGenerating(false);
      return;
    }

    try {
      const result = await generateMessage(selectedTemplate, firstCandidateId);
      
      if (result) {
        setGeneratedMessage(result.message);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error generating message:', error);
      toast.error('Errore nella generazione del messaggio');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScheduleFollowUp = async () => {
    if (!generatedMessage.trim()) {
      toast.error('Il messaggio non può essere vuoto');
      return;
    }

    if (selectedCandidates.size === 0) {
      toast.error('Seleziona almeno un candidato');
      return;
    }

    setIsScheduling(true);

    try {
      let scheduledDate: Date;

      switch (scheduleType) {
        case "immediate":
          scheduledDate = new Date();
          break;
        case "24h":
          scheduledDate = new Date();
          scheduledDate.setHours(scheduledDate.getHours() + 24);
          break;
        case "48h":
          scheduledDate = new Date();
          scheduledDate.setHours(scheduledDate.getHours() + 48);
          break;
        case "custom":
          if (!customDateTime) {
            toast.error('Seleziona una data e ora');
            setIsScheduling(false);
            return;
          }
          scheduledDate = new Date(customDateTime);
          if (scheduledDate < new Date()) {
            toast.error('La data deve essere nel futuro');
            setIsScheduling(false);
            return;
          }
          break;
        default:
          scheduledDate = new Date();
      }

      let successCount = 0;
      let errorCount = 0;

      for (const candidateId of Array.from(selectedCandidates)) {
        try {
          await scheduleMessage(candidateId, generatedMessage, scheduledDate, selectedTemplate);
          successCount++;
        } catch (error) {
          console.error(`Error scheduling for candidate ${candidateId}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Follow-up programmato per ${successCount} candidat${successCount > 1 ? 'i' : 'o'}!`);
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} follow-up non programmati (possibili duplicati)`);
      }

      setShowPreview(false);
      setSelectedCandidates(new Set());
      setSelectedTemplate("");
      setGeneratedMessage("");
      setScheduleType("24h");
      setCustomDateTime("");
      
      refresh();
    } catch (error) {
      console.error('Error scheduling follow-ups:', error);
      toast.error('Errore nella programmazione dei follow-up');
    } finally {
      setIsScheduling(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Follow-up Automatico 2.0
              </CardTitle>
              <CardDescription className="mt-1">
                Imposta messaggi automatici a 1 click. Non dimenticare più nessun candidato.
              </CardDescription>
            </div>
            {scheduledCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {scheduledCount} programmati
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Seleziona candidati */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                1️⃣ Seleziona i candidati
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredCandidates.length === 0}
              >
                {selectedCandidates.size === filteredCandidates.length ? "Deseleziona tutti" : "Seleziona tutti"}
              </Button>
            </div>

            {filteredCandidates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nessun candidato disponibile nella pipeline</p>
              </div>
            ) : (
              <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
                {filteredCandidates.map((candidate) => {
                  const hasEmail = !!candidate.email;
                  const isSelected = selectedCandidates.has(candidate.id);

                  return (
                    <div
                      key={candidate.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border'
                      } ${!hasEmail ? 'opacity-50' : 'cursor-pointer hover:border-primary/50'}`}
                      onClick={() => hasEmail && handleToggleCandidate(candidate.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={!hasEmail}
                        onCheckedChange={() => handleToggleCandidate(candidate.id)}
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={candidate.avatar_url} alt={candidate.full_name} />
                        <AvatarFallback>
                          {candidate.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{candidate.full_name}</p>
                          {!hasEmail && (
                            <Badge variant="destructive" className="text-xs">
                              No email
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{candidate.job_title || 'N/D'}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {candidate.pipelineStageName}
                          </Badge>
                        </div>
                        {candidate.lastMessageDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Ultimo contatto: {formatDistanceToNow(new Date(candidate.lastMessageDate), { 
                              addSuffix: true, 
                              locale: it 
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Seleziona template */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              2️⃣ Seleziona template
            </Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Scegli un template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      {template.category === 'ai_generated' && (
                        <Sparkles className="h-4 w-4 text-primary" />
                      )}
                      <span>{template.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <p className="text-sm text-muted-foreground">
                {templates.find(t => t.id === selectedTemplate)?.description}
              </p>
            )}
          </div>

          {/* Step 3: Scegli quando inviare */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              3️⃣ Scegli quando inviare
            </Label>
            <RadioGroup value={scheduleType} onValueChange={(value: any) => setScheduleType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="immediate" id="immediate" />
                <Label htmlFor="immediate" className="cursor-pointer">Invia ora</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="24h" id="24h" />
                <Label htmlFor="24h" className="cursor-pointer">Tra 24 ore</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="48h" id="48h" />
                <Label htmlFor="48h" className="cursor-pointer">Tra 48 ore</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer">Data personalizzata</Label>
              </div>
            </RadioGroup>
            
            {scheduleType === "custom" && (
              <input
                type="datetime-local"
                value={customDateTime}
                onChange={(e) => setCustomDateTime(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            )}
          </div>

          {/* Step 4: Pulsante principale */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleGeneratePreview}
              disabled={!selectedTemplate || selectedCandidates.size === 0 || isGenerating}
              className="w-full gap-2"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generazione in corso...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Programma follow-up per {selectedCandidates.size} candidat{selectedCandidates.size !== 1 ? 'i' : 'o'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Anteprima messaggio</DialogTitle>
            <DialogDescription>
              Questo messaggio sarà inviato a {selectedCandidates.size} candidat{selectedCandidates.size !== 1 ? 'i' : 'o'}.
              Puoi modificarlo prima di programmare l'invio.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Messaggio</Label>
              <Textarea
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                className="min-h-[200px] mt-2"
                placeholder="Scrivi il tuo messaggio..."
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>
                {scheduleType === "immediate" && "Invio immediato"}
                {scheduleType === "24h" && "Invio tra 24 ore"}
                {scheduleType === "48h" && "Invio tra 48 ore"}
                {scheduleType === "custom" && customDateTime && `Invio il ${new Date(customDateTime).toLocaleString('it-IT')}`}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Annulla
            </Button>
            <Button onClick={handleScheduleFollowUp} disabled={isScheduling} className="gap-2">
              {isScheduling ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Programmazione...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Conferma e programma
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};