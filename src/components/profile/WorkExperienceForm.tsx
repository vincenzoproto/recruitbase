import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkExperience {
  id?: string;
  job_title: string;
  company_name: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  responsibilities: string;
  achievements: string[];
}

interface WorkExperienceFormProps {
  candidateId: string;
  experiences: WorkExperience[];
  onUpdate: () => void;
}

export const WorkExperienceForm = ({ candidateId, experiences: initialExperiences, onUpdate }: WorkExperienceFormProps) => {
  const [experiences, setExperiences] = useState<WorkExperience[]>(initialExperiences);
  const [saving, setSaving] = useState(false);

  const addExperience = () => {
    setExperiences([...experiences, {
      job_title: "",
      company_name: "",
      start_date: "",
      end_date: null,
      is_current: false,
      responsibilities: "",
      achievements: [""]
    }]);
  };

  const removeExperience = async (index: number) => {
    const exp = experiences[index];
    if (exp.id) {
      const { error } = await supabase
        .from("work_experiences")
        .delete()
        .eq("id", exp.id);
      
      if (error) {
        toast.error("Errore durante l'eliminazione");
        return;
      }
    }
    setExperiences(experiences.filter((_, i) => i !== index));
    onUpdate();
  };

  const updateExperience = (index: number, field: keyof WorkExperience, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const updateAchievement = (expIndex: number, achIndex: number, value: string) => {
    const updated = [...experiences];
    updated[expIndex].achievements[achIndex] = value;
    setExperiences(updated);
  };

  const addAchievement = (expIndex: number) => {
    const updated = [...experiences];
    if (updated[expIndex].achievements.length < 3) {
      updated[expIndex].achievements.push("");
      setExperiences(updated);
    }
  };

  const saveExperiences = async () => {
    setSaving(true);
    try {
      for (const exp of experiences) {
        if (!exp.job_title || !exp.company_name) continue;

        const data = {
          candidate_id: candidateId,
          job_title: exp.job_title,
          company_name: exp.company_name,
          start_date: exp.start_date,
          end_date: exp.is_current ? null : exp.end_date,
          is_current: exp.is_current,
          responsibilities: exp.responsibilities,
          achievements: exp.achievements.filter(a => a.trim() !== "")
        };

        if (exp.id) {
          await supabase.from("work_experiences").update(data).eq("id", exp.id);
        } else {
          await supabase.from("work_experiences").insert(data);
        }
      }
      toast.success("Esperienze salvate con successo");
      onUpdate();
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {experiences.map((exp, expIndex) => (
        <Card key={expIndex}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Esperienza {expIndex + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeExperience(expIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ruolo *</Label>
                <Input
                  value={exp.job_title}
                  onChange={(e) => updateExperience(expIndex, "job_title", e.target.value)}
                  placeholder="es. Full Stack Developer"
                />
              </div>
              <div>
                <Label>Azienda *</Label>
                <Input
                  value={exp.company_name}
                  onChange={(e) => updateExperience(expIndex, "company_name", e.target.value)}
                  placeholder="es. Tech Company SRL"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data inizio</Label>
                <Input
                  type="month"
                  value={exp.start_date}
                  onChange={(e) => updateExperience(expIndex, "start_date", e.target.value)}
                />
              </div>
              <div>
                <Label>Data fine</Label>
                <Input
                  type="month"
                  value={exp.end_date || ""}
                  onChange={(e) => updateExperience(expIndex, "end_date", e.target.value)}
                  disabled={exp.is_current}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={exp.is_current}
                onCheckedChange={(checked) => updateExperience(expIndex, "is_current", checked)}
              />
              <Label>Posizione attuale</Label>
            </div>

            <div>
              <Label>Responsabilità</Label>
              <Textarea
                value={exp.responsibilities}
                onChange={(e) => updateExperience(expIndex, "responsibilities", e.target.value)}
                placeholder="Descrivi le tue responsabilità principali..."
                rows={3}
              />
            </div>

            <div>
              <Label>Risultati / Traguardi (max 3)</Label>
              {exp.achievements.map((achievement, achIndex) => (
                <Input
                  key={achIndex}
                  value={achievement}
                  onChange={(e) => updateAchievement(expIndex, achIndex, e.target.value)}
                  placeholder={`Traguardo ${achIndex + 1}`}
                  className="mt-2"
                />
              ))}
              {exp.achievements.length < 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addAchievement(expIndex)}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi traguardo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-2">
        <Button variant="outline" onClick={addExperience}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi esperienza
        </Button>
        <Button onClick={saveExperiences} disabled={saving}>
          {saving ? "Salvataggio..." : "Salva esperienze"}
        </Button>
      </div>
    </div>
  );
};
