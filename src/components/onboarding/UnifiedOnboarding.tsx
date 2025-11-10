import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Briefcase, Heart, CheckCircle, Loader2 } from "lucide-react";
import { CoreValuesSelector } from "@/components/ui/core-values-selector";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface UnifiedOnboardingProps {
  open: boolean;
  userId: string;
  onComplete: () => void;
}

const UnifiedOnboarding = ({ open, userId, onComplete }: UnifiedOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    role: "" as "recruiter" | "candidate" | "",
    linkedin_url: "",
    phone_number: "",
    city: "",
    job_title: "",
    company_size: "",
    core_values: [] as string[],
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    // Step 1 validation
    if (step === 1 && !formData.full_name.trim()) {
      toast.error("Inserisci il tuo nome");
      return;
    }

    // Step 2 validation
    if (step === 2 && !formData.role) {
      toast.error("Scegli il tipo di account");
      return;
    }

    // Step 4 validation
    if (step === 4 && formData.core_values.length < 3) {
      toast.error("Scegli almeno 3 valori");
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    if (!formData.full_name || !formData.role || formData.core_values.length < 3) {
      toast.error("Completa i campi obbligatori");
      return;
    }

    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          role: formData.role,
          linkedin_url: formData.linkedin_url || null,
          phone_number: formData.phone_number || null,
          city: formData.city || null,
          job_title: formData.job_title || null,
          company_size: formData.company_size || null,
          core_values: formData.core_values,
          onboarding_completed: true,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Insert role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: formData.role,
        });

      if (roleError && !roleError.message.includes("duplicate")) {
        console.error("Role error:", roleError);
      }

      setSaved(true);
      toast.success("Profilo pronto! ✨");

      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      console.error("Error saving onboarding:", error);
      toast.error("Errore nel salvataggio. Riprova");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-lg border-none shadow-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <div className="space-y-6 py-2">
          {saved ? (
            <div className="text-center py-12 space-y-6 animate-scale-in">
              <div className="w-24 h-24 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-success animate-scale-in" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-success">Profilo pronto! ✨</h3>
                <p className="text-muted-foreground">Reindirizzamento alla dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="font-medium">Completa il profilo</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Step 1: Nome */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <User className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Nome completo</h3>
                      <p className="text-sm text-muted-foreground">Come vuoi essere chiamato?</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome completo *</Label>
                    <Input
                      id="full_name"
                      placeholder="Mario Rossi"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="h-12"
                      autoFocus
                    />
                    {!formData.full_name && (
                      <p className="text-xs text-destructive">⚠️ Campo obbligatorio</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Ruolo */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Briefcase className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Tipo di account</h3>
                      <p className="text-sm text-muted-foreground">Sei recruiter o candidato?</p>
                    </div>
                  </div>
                  <RadioGroup
                    value={formData.role}
                    onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                  >
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer">
                      <RadioGroupItem value="candidate" id="candidate" />
                      <Label htmlFor="candidate" className="cursor-pointer flex-1">
                        <div className="font-semibold">Candidato</div>
                        <div className="text-xs text-muted-foreground">Cerca opportunità di lavoro</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer">
                      <RadioGroupItem value="recruiter" id="recruiter" />
                      <Label htmlFor="recruiter" className="cursor-pointer flex-1">
                        <div className="font-semibold">Recruiter</div>
                        <div className="text-xs text-muted-foreground">Pubblica offerte e trova talenti</div>
                      </Label>
                    </div>
                  </RadioGroup>
                  {!formData.role && (
                    <p className="text-xs text-destructive text-center">⚠️ Scegli un tipo di account</p>
                  )}
                </div>
              )}

              {/* Step 3: Dati opzionali */}
              {step === 3 && (
                <div className="space-y-4 animate-fade-in max-h-[400px] overflow-y-auto pr-2">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Dati aggiuntivi</h3>
                    <p className="text-sm text-muted-foreground">Tutti i campi sono opzionali</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      placeholder="https://linkedin.com/in/..."
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefono</Label>
                    <Input
                      id="phone"
                      placeholder="+39 123 456 7890"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Città</Label>
                    <Input
                      id="city"
                      placeholder="Milano"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_title">
                      {formData.role === "recruiter" ? "Posizione attuale" : "Ruolo desiderato"}
                    </Label>
                    <Input
                      id="job_title"
                      placeholder="Software Engineer"
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    />
                  </div>
                  {formData.role === "recruiter" && (
                    <div className="space-y-2">
                      <Label htmlFor="company_size">Dimensione Azienda</Label>
                      <Input
                        id="company_size"
                        placeholder="1-10, 11-50, 51-200, ..."
                        value={formData.company_size}
                        onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Valori */}
              {step === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Heart className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">I tuoi valori</h3>
                      <p className="text-sm text-muted-foreground">
                        Seleziona almeno 3 valori (max 5)
                      </p>
                    </div>
                  </div>
                  <CoreValuesSelector
                    selectedValues={formData.core_values}
                    onChange={(values) => setFormData({ ...formData, core_values: values })}
                  />
                  {formData.core_values.length < 3 && (
                    <p className="text-xs text-destructive text-center">
                      ⚠️ Scegli almeno 3 valori per continuare
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <Button variant="outline" onClick={handleBack} className="flex-1" disabled={saving}>
                    Indietro
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  className="flex-1"
                  disabled={
                    saving ||
                    (step === 1 && !formData.full_name) ||
                    (step === 2 && !formData.role) ||
                    (step === 4 && formData.core_values.length < 3)
                  }
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {step === totalSteps ? (saving ? "Salvataggio..." : "Completa") : "Avanti"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedOnboarding;
