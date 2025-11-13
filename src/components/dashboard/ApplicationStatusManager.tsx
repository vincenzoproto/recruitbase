import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ThumbsUp, ThumbsDown, Minus, Clock, Calendar, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ApplicationStatusManagerProps {
  applicationId: string;
  currentStatus: string;
  candidateName: string;
  onStatusUpdated: () => void;
}

type ApplicationStatus = 'in_valutazione' | 'colloquio_programmato' | 'assunto' | 'non_idoneo';
type FeedbackType = 'positivo' | 'neutro' | 'negativo';

const STATUS_STEPS: Array<{
  key: ApplicationStatus;
  label: string;
  icon: any;
  color: string;
}> = [
  { key: 'in_valutazione', label: 'In valutazione', icon: Clock, color: 'text-blue-500' },
  { key: 'colloquio_programmato', label: 'Colloquio programmato', icon: Calendar, color: 'text-purple-500' },
  { key: 'assunto', label: 'Assunto', icon: CheckCircle, color: 'text-green-500' },
  { key: 'non_idoneo', label: 'Non idoneo', icon: XCircle, color: 'text-red-500' },
];

export const ApplicationStatusManager = ({
  applicationId,
  currentStatus,
  candidateName,
  onStatusUpdated,
}: ApplicationStatusManagerProps) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const currentIndex = STATUS_STEPS.findIndex(s => s.key === currentStatus);

  const updateStatus = async (newStatus: ApplicationStatus, feedback?: { type: FeedbackType; notes: string }) => {
    setUpdating(true);
    try {
      const updateData: any = { status: newStatus };
      
      if (feedback) {
        updateData.feedback_type = feedback.type;
        updateData.feedback_notes = feedback.notes;
      }

      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', applicationId);

      if (error) throw error;

      toast.success(`Stato aggiornato a "${STATUS_STEPS.find(s => s.key === newStatus)?.label}"`);
      setShowFeedback(false);
      setFeedbackType(null);
      setFeedbackNotes("");
      onStatusUpdated();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error("Errore nell'aggiornamento dello stato");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusClick = (status: ApplicationStatus) => {
    if (status === 'colloquio_programmato' || status === 'assunto' || status === 'non_idoneo') {
      setShowFeedback(true);
      setFeedbackType(
        status === 'assunto' ? 'positivo' : 
        status === 'non_idoneo' ? 'negativo' : 
        'neutro'
      );
    } else {
      updateStatus(status);
    }
  };

  const handleFeedbackSubmit = () => {
    let newStatus: ApplicationStatus | undefined;
    
    if (feedbackType === 'positivo') {
      newStatus = 'assunto';
    } else if (feedbackType === 'negativo') {
      newStatus = 'non_idoneo';
    } else if (feedbackType === 'neutro') {
      newStatus = 'colloquio_programmato';
    }

    if (newStatus && feedbackType) {
      updateStatus(newStatus, {
        type: feedbackType,
        notes: feedbackNotes
      });
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          {STATUS_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentIndex;
            const isPast = idx < currentIndex;
            const isFuture = idx > currentIndex;

            return (
              <div key={step.key} className="flex-1 relative">
                <button
                  onClick={() => handleStatusClick(step.key)}
                  disabled={updating}
                  className={`w-full flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                      : isPast
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? '' : step.color}`} />
                  <span className="text-xs font-medium text-center line-clamp-2">
                    {step.label}
                  </span>
                </button>
                {idx < STATUS_STEPS.length - 1 && (
                  <div className={`absolute top-1/2 -right-2 w-4 h-0.5 ${
                    isPast ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Aggiungi Feedback</DialogTitle>
            <DialogDescription>
              Lascia un feedback rapido per {candidateName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={feedbackType === 'positivo' ? 'default' : 'outline'}
                onClick={() => setFeedbackType('positivo')}
                className="flex-1"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Positivo
              </Button>
              <Button
                variant={feedbackType === 'neutro' ? 'default' : 'outline'}
                onClick={() => setFeedbackType('neutro')}
                className="flex-1"
              >
                <Minus className="h-4 w-4 mr-2" />
                Neutro
              </Button>
              <Button
                variant={feedbackType === 'negativo' ? 'default' : 'outline'}
                onClick={() => setFeedbackType('negativo')}
                className="flex-1"
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Negativo
              </Button>
            </div>

            <Textarea
              placeholder="Note (max 140 caratteri, opzionale)"
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value.slice(0, 140))}
              maxLength={140}
              rows={3}
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFeedback(false)}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                onClick={handleFeedbackSubmit}
                disabled={!feedbackType || updating}
                className="flex-1"
              >
                {updating ? 'Salvataggio...' : 'Conferma'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
