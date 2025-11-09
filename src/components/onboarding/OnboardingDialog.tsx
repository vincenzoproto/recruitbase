import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Briefcase, User, MapPin, Camera, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface OnboardingDialogProps {
  open: boolean;
  userId: string;
  initialRole: string;
  onComplete: (data: any) => void;
}

const OnboardingDialog = ({ open, userId, initialRole, onComplete }: OnboardingDialogProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    city: "",
    job_title: "",
    avatar_url: "",
  });

  const handleNext = () => {
    if (step === 1 && !formData.full_name) {
      toast.error("Inserisci il tuo nome");
      return;
    }
    if (step === 2 && !formData.city) {
      toast.error("Inserisci la tua città");
      return;
    }
    setStep(step + 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...formData,
          onboarding_completed: true,
        })
        .eq("id", userId);

      if (error) throw error;

      // Inserisci il ruolo nella tabella user_roles
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: initialRole as any,
      });

      if (roleError) console.error("Error inserting role:", roleError);

      toast.success("Profilo completato! 🎉");
      onComplete({ ...formData, onboarding_completed: true });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Errore nel completamento del profilo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            Benvenuto su Recruit Base! 🎉
          </DialogTitle>
          <DialogDescription>
            Completa il tuo profilo per iniziare (Step {step} di 3)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <Card className="border-none bg-gradient-to-br from-primary/5 to-accent/10">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Il tuo nome</h3>
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
                    autoFocus
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-none bg-gradient-to-br from-primary/5 to-accent/10">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Dove ti trovi?</h3>
                    <p className="text-sm text-muted-foreground">
                      {initialRole === "recruiter" ? "In quale città operi?" : "In quale città cerchi lavoro?"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Città *</Label>
                  <Input
                    id="city"
                    placeholder="Milano"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    autoFocus
                  />
                </div>
                {initialRole === "candidate" && (
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Ruolo desiderato</Label>
                    <Input
                      id="job_title"
                      placeholder="Full Stack Developer"
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-none bg-gradient-to-br from-primary/5 to-accent/10">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Foto profilo (opzionale)</h3>
                    <p className="text-sm text-muted-foreground">Aggiungi una foto o salta questo passaggio</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar_url">URL immagine (opzionale)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="avatar_url"
                      placeholder="https://..."
                      value={formData.avatar_url}
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    />
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Puoi aggiungere la foto anche in seguito dal tuo profilo
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-between pt-4">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={loading}>
              Indietro
            </Button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <Button onClick={handleNext} size="lg" className="px-8">
              Avanti
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={loading} size="lg" className="px-8">
              {loading ? "Completamento..." : "Completa 🎉"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingDialog;
