import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Language {
  id?: string;
  language: string;
  proficiency_level: string;
}

interface LanguageSelectorProps {
  candidateId: string;
  languages: Language[];
  onUpdate: () => void;
}

const COMMON_LANGUAGES = [
  "Italiano", "Inglese", "Francese", "Tedesco", "Spagnolo", 
  "Portoghese", "Russo", "Cinese", "Giapponese", "Arabo"
];

const PROFICIENCY_LEVELS = [
  { value: "A1", label: "A1 - Base" },
  { value: "A2", label: "A2 - Elementare" },
  { value: "B1", label: "B1 - Intermedio" },
  { value: "B2", label: "B2 - Intermedio superiore" },
  { value: "C1", label: "C1 - Avanzato" },
  { value: "C2", label: "C2 - Madrelingua/Bilingue" }
];

export const LanguageSelector = ({ candidateId, languages: initialLanguages, onUpdate }: LanguageSelectorProps) => {
  const [languages, setLanguages] = useState<Language[]>(initialLanguages);
  const [saving, setSaving] = useState(false);

  const addLanguage = () => {
    setLanguages([...languages, { language: "", proficiency_level: "A1" }]);
  };

  const removeLanguage = async (index: number) => {
    const lang = languages[index];
    if (lang.id) {
      const { error } = await supabase
        .from("candidate_languages")
        .delete()
        .eq("id", lang.id);
      
      if (error) {
        toast.error("Errore durante l'eliminazione");
        return;
      }
    }
    setLanguages(languages.filter((_, i) => i !== index));
    onUpdate();
  };

  const updateLanguage = (index: number, field: keyof Language, value: string) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    setLanguages(updated);
  };

  const saveLanguages = async () => {
    setSaving(true);
    try {
      for (const lang of languages) {
        if (!lang.language) continue;

        const data = {
          candidate_id: candidateId,
          language: lang.language,
          proficiency_level: lang.proficiency_level
        };

        if (lang.id) {
          await supabase.from("candidate_languages").update(data).eq("id", lang.id);
        } else {
          await supabase.from("candidate_languages").insert(data);
        }
      }
      toast.success("Lingue salvate con successo");
      onUpdate();
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {languages.map((lang, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <Label>Lingua</Label>
                  <Select
                    value={lang.language}
                    onValueChange={(value) => updateLanguage(index, "language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona lingua" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_LANGUAGES.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Livello</Label>
                  <Select
                    value={lang.proficiency_level}
                    onValueChange={(value) => updateLanguage(index, "proficiency_level", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFICIENCY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeLanguage(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-2">
        <Button variant="outline" onClick={addLanguage}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi lingua
        </Button>
        <Button onClick={saveLanguages} disabled={saving}>
          {saving ? "Salvataggio..." : "Salva lingue"}
        </Button>
      </div>
    </div>
  );
};
