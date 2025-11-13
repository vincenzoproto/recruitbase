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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recruiterId: string;
  onSuccess: () => void;
}

type ExperienceLevel = "entry" | "junior" | "mid" | "senior" | "lead";

const CreateJobDialog = ({ open, onOpenChange, recruiterId, onSuccess }: CreateJobDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    city: "",
    sector: "",
    experience_level: "mid" as ExperienceLevel,
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.city || !formData.sector || !formData.description) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("job_offers").insert({
        recruiter_id: recruiterId,
        ...formData,
      });

      if (error) throw error;

      toast.success("Offerta creata con successo!");
      onSuccess();
      onOpenChange(false);
      setFormData({
        title: "",
        city: "",
        sector: "",
        experience_level: "mid",
        description: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Errore nella creazione dell'offerta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuova Offerta di Lavoro</DialogTitle>
          <DialogDescription>Crea una nuova posizione per trovare i candidati ideali</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titolo Posizione *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="es. Sviluppatore Full Stack"
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
                placeholder="es. IT, Marketing, Finanza"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Livello di Esperienza *</Label>
            <Select
              value={formData.experience_level}
              onValueChange={(value: ExperienceLevel) => setFormData({ ...formData, experience_level: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona livello" />
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
              placeholder="Descrivi la posizione, requisiti, responsabilità..."
              rows={6}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creazione..." : "Crea Offerta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobDialog;
