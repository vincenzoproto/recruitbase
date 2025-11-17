import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Education {
  id?: string;
  degree_title: string;
  institution: string;
  graduation_year: number | null;
  additional_courses: string[];
}

interface EducationFormProps {
  candidateId: string;
  education: Education[];
  onUpdate: () => void;
}

export const EducationForm = ({ candidateId, education: initialEducation, onUpdate }: EducationFormProps) => {
  const [education, setEducation] = useState<Education[]>(initialEducation);
  const [saving, setSaving] = useState(false);

  const addEducation = () => {
    setEducation([...education, {
      degree_title: "",
      institution: "",
      graduation_year: null,
      additional_courses: []
    }]);
  };

  const removeEducation = async (index: number) => {
    const edu = education[index];
    if (edu.id) {
      const { error } = await supabase
        .from("education_records")
        .delete()
        .eq("id", edu.id);
      
      if (error) {
        toast.error("Errore durante l'eliminazione");
        return;
      }
    }
    setEducation(education.filter((_, i) => i !== index));
    onUpdate();
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const addCourse = (eduIndex: number, course: string) => {
    if (!course.trim()) return;
    const updated = [...education];
    updated[eduIndex].additional_courses.push(course);
    setEducation(updated);
  };

  const removeCourse = (eduIndex: number, courseIndex: number) => {
    const updated = [...education];
    updated[eduIndex].additional_courses.splice(courseIndex, 1);
    setEducation(updated);
  };

  const saveEducation = async () => {
    setSaving(true);
    try {
      for (const edu of education) {
        if (!edu.degree_title || !edu.institution) continue;

        const data = {
          candidate_id: candidateId,
          degree_title: edu.degree_title,
          institution: edu.institution,
          graduation_year: edu.graduation_year,
          additional_courses: edu.additional_courses
        };

        if (edu.id) {
          await supabase.from("education_records").update(data).eq("id", edu.id);
        } else {
          await supabase.from("education_records").insert(data);
        }
      }
      toast.success("Formazione salvata con successo");
      onUpdate();
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {education.map((edu, eduIndex) => (
        <Card key={eduIndex}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Formazione {eduIndex + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeEducation(eduIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Titolo di studio / Certificazione *</Label>
                <Input
                  value={edu.degree_title}
                  onChange={(e) => updateEducation(eduIndex, "degree_title", e.target.value)}
                  placeholder="es. Laurea in Informatica"
                />
              </div>
              <div>
                <Label>Istituto *</Label>
                <Input
                  value={edu.institution}
                  onChange={(e) => updateEducation(eduIndex, "institution", e.target.value)}
                  placeholder="es. Università di Milano"
                />
              </div>
            </div>

            <div>
              <Label>Anno</Label>
              <Input
                type="number"
                min="1950"
                max={new Date().getFullYear()}
                value={edu.graduation_year || ""}
                onChange={(e) => updateEducation(eduIndex, "graduation_year", parseInt(e.target.value))}
                placeholder="2023"
              />
            </div>

            <div>
              <Label>Corsi aggiuntivi / Certificazioni</Label>
              {edu.additional_courses.map((course, courseIndex) => (
                <div key={courseIndex} className="flex gap-2 mt-2">
                  <Input value={course} disabled />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCourse(eduIndex, courseIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Aggiungi corso o certificazione"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addCourse(eduIndex, e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-2">
        <Button variant="outline" onClick={addEducation}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi formazione
        </Button>
        <Button onClick={saveEducation} disabled={saving}>
          {saving ? "Salvataggio..." : "Salva formazione"}
        </Button>
      </div>
    </div>
  );
};
