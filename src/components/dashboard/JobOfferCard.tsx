import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, TrendingUp, Calendar, CheckCircle2, Edit, Trash2, Power } from "lucide-react";
import { CVCopilot } from "@/components/candidate/CVCopilot";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EditJobDialog from "./EditJobDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface JobOfferCardProps {
  job: any;
  onUpdate?: () => void;
  onApply?: () => void;
  hasApplied?: boolean;
  isCandidate?: boolean;
  isRecruiter?: boolean;
}

const experienceLevelLabels: Record<string, string> = {
  entry: "Entry Level",
  junior: "Junior",
  mid: "Mid Level",
  senior: "Senior",
  lead: "Lead/Manager",
};

const JobOfferCard = ({ job, onApply, hasApplied, isCandidate, isRecruiter, onUpdate }: JobOfferCardProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const toggleActive = async () => {
    try {
      const { error } = await supabase
        .from('job_offers')
        .update({ is_active: !job.is_active })
        .eq('id', job.id);

      if (error) throw error;

      toast.success(job.is_active ? "Offerta disattivata" : "Offerta attivata");
      onUpdate?.();
    } catch (error) {
      console.error('Error toggling active:', error);
      toast.error("Errore nell'aggiornamento");
    }
  };

  const deleteOffer = async () => {
    try {
      const { error } = await supabase
        .from('job_offers')
        .delete()
        .eq('id', job.id);

      if (error) throw error;

      toast.success("Offerta eliminata");
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error("Errore nell'eliminazione");
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.city}
            </CardDescription>
          </div>
          {job.is_active && <Badge variant="default">Attiva</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {job.sector}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {experienceLevelLabels[job.experience_level] || job.experience_level}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>

        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Pubblicata il {formatDate(job.created_at)}
          </div>

          {isCandidate && onApply && (
            <div className="flex gap-2">
              <Button onClick={onApply} disabled={hasApplied} size="sm" className="flex-1">
                {hasApplied ? (
                  <>
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Candidato
                  </>
                ) : (
                  "Candidati Ora"
                )}
              </Button>
              <CVCopilot
                jobTitle={job.title}
                jobDescription={job.description}
              />
            </div>
          )}

          {isRecruiter && (
            <div className="flex gap-2 pt-2">
              <Button onClick={() => setEditOpen(true)} size="sm" variant="outline" className="flex-1">
                <Edit className="h-4 w-4 mr-1" />
                Modifica
              </Button>
              <Button
                onClick={toggleActive}
                size="sm"
                variant={job.is_active ? "secondary" : "default"}
              >
                <Power className="h-4 w-4 mr-1" />
                {job.is_active ? 'Disattiva' : 'Attiva'}
              </Button>
              <Button onClick={() => setDeleteOpen(true)} size="sm" variant="destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <EditJobDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        job={job}
        onSuccess={() => onUpdate?.()}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione eliminerà permanentemente l'offerta di lavoro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={deleteOffer}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default JobOfferCard;
