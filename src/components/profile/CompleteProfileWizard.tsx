import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WorkExperienceForm } from "./WorkExperienceForm";
import { EducationForm } from "./EducationForm";
import { LanguageSelector } from "./LanguageSelector";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface CompleteProfileWizardProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onComplete: () => void;
}

const SENIORITY_LEVELS = ["Junior", "Middle", "Senior", "Lead"];
const CONTRACT_TYPES = ["Full-time", "Part-time", "Stage", "Freelance"];
const AVAILABILITY_OPTIONS = [
  { value: "0", label: "Immediata" },
  { value: "30", label: "30 giorni" },
  { value: "60", label: "60 giorni" },
  { value: "90", label: "90 giorni" }
];

export const CompleteProfileWizard = ({ open, onClose, userId, onComplete }: CompleteProfileWizardProps) => {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);

  const steps = [
    "Informazioni Personali",
    "Riepilogo Professionale",
    "Preferenze di Lavoro",
    "Competenze",
    "Esperienze",
    "Formazione",
    "Lingue"
  ];

  const progress = ((step + 1) / steps.length) * 100;

  useEffect(() => {
    if (open && userId) {
      loadProfileData();
    }
  }, [open, userId]);

  const loadProfileData = async () => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: expData } = await supabase
      .from("work_experiences")
      .select("*")
      .eq("candidate_id", userId);

    const { data: eduData } = await supabase
      .from("education_records")
      .select("*")
      .eq("candidate_id", userId);

    const { data: langData } = await supabase
      .from("candidate_languages")
      .select("*")
      .eq("candidate_id", userId);

    setProfile(profileData || {});
    setExperiences(expData || []);
    setEducation(eduData || []);
    setLanguages(langData || []);
  };

  const updateProfile = (field: string, value: any) => {
    setProfile({ ...profile, [field]: value });
  };

  const saveCurrentStep = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", userId);

      if (error) throw error;
    } catch (error) {
      toast.error("Errore durante il salvataggio");
      return false;
    } finally {
      setSaving(false);
    }
    return true;
  };

  const handleNext = async () => {
    const success = await saveCurrentStep();
    if (success && step < steps.length - 1) {
      setStep(step + 1);
    } else if (success && step === steps.length - 1) {
      toast.success("Profilo completato con successo!");
      onComplete();
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Completa il tuo Profilo</DialogTitle>
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">
              Step {step + 1} di {steps.length}: {steps[step]}
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Informazioni Personali</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome completo *</Label>
                  <Input
                    value={profile.full_name || ""}
                    onChange={(e) => updateProfile("full_name", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Età</Label>
                  <Input
                    type="number"
                    value={profile.age || ""}
                    onChange={(e) => updateProfile("age", parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Città / Paese *</Label>
                  <Input
                    value={profile.city || ""}
                    onChange={(e) => updateProfile("city", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Disponibilità a trasferirsi</Label>
                  <Select
                    value={profile.relocation_available ? "yes" : "no"}
                    onValueChange={(v) => updateProfile("relocation_available", v === "yes")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Sì</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Disponibilità al lavoro remoto</Label>
                  <Select
                    value={String(profile.remote_preference || 0)}
                    onValueChange={(v) => updateProfile("remote_preference", parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0% - Solo in sede</SelectItem>
                      <SelectItem value="50">50% - Ibrido</SelectItem>
                      <SelectItem value="100">100% - Completamente remoto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Riepilogo Professionale</h3>
              <div>
                <Label>Ruolo attuale *</Label>
                <Input
                  value={profile.job_title || ""}
                  onChange={(e) => updateProfile("job_title", e.target.value)}
                  placeholder="es. Full Stack Developer"
                />
              </div>
              <div>
                <Label>Livello di seniority *</Label>
                <Select
                  value={profile.seniority_level || ""}
                  onValueChange={(v) => updateProfile("seniority_level", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona livello" />
                  </SelectTrigger>
                  <SelectContent>
                    {SENIORITY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Anni di esperienza</Label>
                <Input
                  type="number"
                  value={profile.years_experience || ""}
                  onChange={(e) => updateProfile("years_experience", parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label>Breve bio professionale (max 300 caratteri)</Label>
                <Textarea
                  value={profile.professional_summary || ""}
                  onChange={(e) => updateProfile("professional_summary", e.target.value)}
                  maxLength={300}
                  rows={4}
                  placeholder="Descrivi brevemente la tua esperienza e le tue competenze principali..."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Preferenze di Lavoro</h3>
              <div>
                <Label>Ruoli desiderati (separati da virgola)</Label>
                <Input
                  value={(profile.desired_roles || []).join(", ")}
                  onChange={(e) => updateProfile("desired_roles", e.target.value.split(",").map(s => s.trim()))}
                  placeholder="es. Frontend Developer, Full Stack Developer"
                />
              </div>
              <div>
                <Label>Tipo di contratto preferito</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CONTRACT_TYPES.map((type) => (
                    <Button
                      key={type}
                      variant={(profile.contract_type_preference || []).includes(type) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const current = profile.contract_type_preference || [];
                        const updated = current.includes(type)
                          ? current.filter((t: string) => t !== type)
                          : [...current, type];
                        updateProfile("contract_type_preference", updated);
                      }}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>RAL minima desiderata (€)</Label>
                  <Input
                    type="number"
                    value={profile.salary_min || ""}
                    onChange={(e) => updateProfile("salary_min", parseInt(e.target.value))}
                    placeholder="25000"
                  />
                </div>
                <div>
                  <Label>RAL massima desiderata (€)</Label>
                  <Input
                    type="number"
                    value={profile.salary_max || ""}
                    onChange={(e) => updateProfile("salary_max", parseInt(e.target.value))}
                    placeholder="40000"
                  />
                </div>
              </div>
              <div>
                <Label>Disponibilità</Label>
                <Select
                  value={String(profile.availability_days || 0)}
                  onValueChange={(v) => updateProfile("availability_days", parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Competenze</h3>
              <div>
                <Label>Hard Skills (separati da virgola)</Label>
                <Input
                  value={(profile.skills || []).join(", ")}
                  onChange={(e) => updateProfile("skills", e.target.value.split(",").map(s => s.trim()))}
                  placeholder="es. React, TypeScript, Node.js, PostgreSQL"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Aggiungi almeno 3 competenze tecniche per migliorare il matching
                </p>
              </div>
              <div>
                <Label>Soft Skills (separati da virgola)</Label>
                <Input
                  value={(profile.core_values || []).join(", ")}
                  onChange={(e) => updateProfile("core_values", e.target.value.split(",").map(s => s.trim()))}
                  placeholder="es. Lavoro di squadra, Problem solving, Leadership"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Esperienze Lavorative</h3>
              <WorkExperienceForm
                candidateId={userId}
                experiences={experiences}
                onUpdate={loadProfileData}
              />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Formazione</h3>
              <EducationForm
                candidateId={userId}
                education={education}
                onUpdate={loadProfileData}
              />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Lingue</h3>
              <LanguageSelector
                candidateId={userId}
                languages={languages}
                onUpdate={loadProfileData}
              />
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
          <Button onClick={handleNext} disabled={saving}>
            {step === steps.length - 1 ? "Completa" : "Avanti"}
            {step < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
