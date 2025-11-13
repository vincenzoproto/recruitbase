import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface EditJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: any;
  onSuccess: () => void;
}

type ExperienceLevel = "entry" | "junior" | "mid" | "senior" | "lead";

const EditJobDialog = ({ open, onOpenChange, job, onSuccess }: EditJobDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: job?.title || "",
    city: job?.city || "",
    sector: job?.sector || "",
    experience_level: (job?.experience_level || "mid") as ExperienceLevel,
    description: job?.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.city || !formData.sector || !formData.description) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("job_offers")
        .update({
          title: formData.title,
          city: formData.city,
          sector: formData.sector,
          experience_level: formData.experience_level,
          description: formData.description,
        })
        .eq("id", job.id);

      if (error) throw error;

      toast.success("Offerta aggiornata con successo!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Errore nell'aggiornamento dell'offerta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Modifica Offerta di Lavoro</DialogTitle>
          <DialogDescription>
            Aggiorna i dettagli dell'offerta di lavoro
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titolo Posizione *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="es. Frontend Developer"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">Città *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="es. Milano"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Settore *</Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                placeholder="es. IT, Marketing"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience_level">Livello di Esperienza *</Label>
            <Select
              value={formData.experience_level}
              onValueChange={(value) =>
                setFormData({ ...formData, experience_level: value as ExperienceLevel })
              }
            >
              <SelectTrigger id="experience_level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="lead">Lead/Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrivi la posizione, le responsabilità e i requisiti..."
              rows={5}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Aggiornamento..." : "Aggiorna Offerta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditJobDialog;
