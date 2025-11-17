import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Zap, Send, Clock, Check, AlertCircle, Sparkles } from "lucide-react";
import { useAutoFollowUp, type CandidateForFollowUp } from "@/hooks/useAutoFollowUp";
import { toast } from "sonner";

export const AutoFollowUpPanel = ({ recruiterId }: { recruiterId: string }) => {
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [generatedMessage, setGeneratedMessage] = useState<string>("");
  const [scheduleType, setScheduleType] = useState<"immediate" | "hours" | "datetime">("immediate");
  const [hoursDelay, setHoursDelay] = useState<number>(24);
  const [scheduledDateTime, setScheduledDateTime] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<CandidateForFollowUp | null>(null);

  const { templates, candidates, loading, scheduledCount, generateMessage, scheduleMessage, refresh } = useAutoFollowUp(recruiterId);

  const handleSelectAll = () => {
    if (selectedCandidates.size === candidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(candidates.map(c => c.id)));
    }
  };

  const handleToggleCandidate = (candidateId: string) => {
    const newSet = new Set(selectedCandidates);
    if (newSet.has(candidateId)) {
      newSet.delete(candidateId);
    } else {
      newSet.add(candidateId);
    }
    setSelectedCandidates(newSet);
  };

  const handleGeneratePreview = async () => {
    if (!selectedTemplate || selectedCandidates.size === 0) {
      toast.error('Seleziona un template e almeno un candidato');
      return;
    }

    const candidatesWithoutEmail = candidates.filter(c => 
      selectedCandidates.has(c.id) && !c.email
    );

    if (candidatesWithoutEmail.length > 0) {
      toast.error(`${candidatesWithoutEmail.length} candidati senza email. Rimuovili dalla selezione.`);
      return;
    }

    setIsGenerating(true);
    
    const firstCandidateId = Array.from(selectedCandidates)[0];
    const candidate = candidates.find(c => c.id === firstCandidateId);
    
    if (!candidate) {
      setIsGenerating(false);
      return;
    }
    
    setCurrentCandidate(candidate);

    const result = await generateMessage(selectedTemplate, firstCandidateId);
    
    if (result) {
      setGeneratedMessage(result.message);
      setShowPreview(true);
    }
    
    setIsGenerating(false);
  };

  const handleScheduleFollowUp = async () => {
    if (!generatedMessage || selectedCandidates.size === 0) {
      toast.error('Genera prima il messaggio');
      return;
    }

    let scheduledDate: Date;

    switch (scheduleType) {
      case "immediate":
        scheduledDate = new Date();
        break;
      case "hours":
        scheduledDate = new Date();
        scheduledDate.setHours(scheduledDate.getHours() + hoursDelay);
        break;
      case "datetime":
        if (!scheduledDateTime) {
          toast.error('Seleziona una data e ora');
          return;
        }
        scheduledDate = new Date(scheduledDateTime);
        break;
    }

    let successCount = 0;
    
    for (const candidateId of selectedCandidates) {
      const success = await scheduleMessage(
        candidateId,
        generatedMessage,
        scheduledDate,
        selectedTemplate
      );
      
      if (success) successCount++;
    }

    if (successCount > 0) {
      toast.success(`${successCount} follow-up programmati!`);
      setShowPreview(false);
      setSelectedCandidates(new Set());
      setGeneratedMessage("");
      setSelectedTemplate("");
      refresh();
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Zap className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-1">Follow-up Automatico</h3>
            <p className="text-sm text-muted-foreground">
              Ricontatta i candidati con messaggi AI personalizzati
            </p>
          </div>
          {scheduledCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {scheduledCount} programmati
            </Badge>
          )}
        </div>

        {candidates.length === 0 ? (
          <div className="text-center py-12 px-6 bg-background/50 rounded-lg border-2 border-dashed">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">Nessun candidato in pipeline</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Sposta qualcuno nella pipeline per programmare follow-up automatici.
            </p>
            <Button variant="outline" onClick={refresh}>
              Aggiorna
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="mb-2">Seleziona Template AI</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Scegli un template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">{template.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Candidati ({selectedCandidates.size}/{candidates.length})</Label>
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {selectedCandidates.size === candidates.length ? 'Deseleziona tutti' : 'Seleziona tutti'}
                </Button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {candidates.map((candidate) => (
                  <Card
                    key={candidate.id}
                    className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                      selectedCandidates.has(candidate.id) ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleToggleCandidate(candidate.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedCandidates.has(candidate.id)}
                        onCheckedChange={() => handleToggleCandidate(candidate.id)}
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={candidate.avatar_url} />
                        <AvatarFallback>
                          {candidate.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{candidate.full_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{candidate.email || 'No email'}</span>
                          {!candidate.email && (
                            <Badge variant="destructive" className="h-4 text-xs px-1">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              No email
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1 text-xs">
                          {candidate.pipelineStageName}
                        </Badge>
                        {candidate.jobOfferTitle && (
                          <p className="text-xs text-muted-foreground truncate max-w-32">
                            {candidate.jobOfferTitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGeneratePreview}
              className="w-full"
              size="lg"
              disabled={!selectedTemplate || selectedCandidates.size === 0 || isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generazione in corso...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Genera e Programma Follow-up
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Anteprima e Programmazione
            </DialogTitle>
            <DialogDescription>
              Rivedi il messaggio generato dall'AI e scegli quando inviarlo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {currentCandidate && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Destinatario:</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentCandidate.avatar_url} />
                    <AvatarFallback>
                      {currentCandidate.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{currentCandidate.full_name}</span>
                  {selectedCandidates.size > 1 && (
                    <Badge variant="outline" className="ml-auto">
                      +{selectedCandidates.size - 1} altri
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div>
              <Label className="mb-2">Messaggio Generato (modificabile)</Label>
              <Textarea
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </div>

            <div>
              <Label className="mb-2">Quando inviare?</Label>
              <Select value={scheduleType} onValueChange={(value: any) => setScheduleType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Immediatamente
                    </div>
                  </SelectItem>
                  <SelectItem value="hours">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Dopo X ore
                    </div>
                  </SelectItem>
                  <SelectItem value="datetime">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Data e ora specifica
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {scheduleType === "hours" && (
                <div className="mt-2">
                  <Input
                    type="number"
                    min="1"
                    value={hoursDelay}
                    onChange={(e) => setHoursDelay(parseInt(e.target.value) || 1)}
                    placeholder="Ore di ritardo"
                  />
                </div>
              )}

              {scheduleType === "datetime" && (
                <div className="mt-2">
                  <Input
                    type="datetime-local"
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Annulla
            </Button>
            <Button onClick={handleScheduleFollowUp}>
              <Check className="h-4 w-4 mr-2" />
              Programma Follow-up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};