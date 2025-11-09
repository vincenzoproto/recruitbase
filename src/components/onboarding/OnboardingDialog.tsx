import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, MapPin, Camera, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface OnboardingDialogProps {
  open: boolean;
  userId: string;
  initialRole: string;
  onComplete: (data: any) => void;
}

const OnboardingDialog = ({ open, userId, initialRole, onComplete }: OnboardingDialogProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right');
  const [formData, setFormData] = useState({
    full_name: "",
    city: "",
    job_title: "",
    avatar_url: "",
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;
  const motivationalMessages = ["Iniziamo! ✨", "Ottimo lavoro! 🚀", "Quasi finito! 🎯"];

  const handleNext = () => {
    if (step === 1 && !formData.full_name.trim()) {
      toast.error("Inserisci il tuo nome");
      return;
    }
    if (step === 2 && !formData.city.trim()) {
      toast.error("Inserisci la tua città");
      return;
    }
    setSlideDirection('right');
    setStep(step + 1);
  };

  const handleBack = () => {
    setSlideDirection('left');
    setStep(step - 1);
  };

  const handleSkip = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name || "Utente",
        city: formData.city || "Italia",
        onboarding_completed: true,
      })
      .eq("id", userId);

    if (error) {
      toast.error("Errore nel salvataggio");
      return;
    }

    toast.success("Benvenuto! Completa il tuo profilo quando vuoi");
    onComplete({ full_name: formData.full_name || "Utente", city: formData.city || "Italia", onboarding_completed: true });
  };

  const handleComplete = async () => {
    if (!formData.full_name || !formData.city) {
      toast.error("Completa i campi obbligatori");
      return;
    }

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

      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: initialRole as any,
      });

      if (roleError) console.error("Error inserting role:", roleError);

      toast.success("🎉 Profilo completato con successo!");
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
      <DialogContent className="sm:max-w-[500px] glass-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {motivationalMessages[step - 1]}
          </DialogTitle>
          <p className="text-center text-muted-foreground text-sm mt-2">
            Step {step} di {totalSteps}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Progress value={progress} className="h-2" />

          <div className="py-6 min-h-[280px] relative overflow-hidden">
          {/* Step 1: Nome */}
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              step === 1
                ? `opacity-100 translate-x-0`
                : step > 1
                ? 'opacity-0 -translate-x-full'
                : 'opacity-0 translate-x-full'
            }`}
          >
            <Card className="border-none bg-gradient-to-br from-primary/5 via-accent/5 to-background shadow-none">
              <CardContent className="pt-6 space-y-5">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center backdrop-blur-sm">
                    <User className="h-7 w-7 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Il tuo nome</h3>
                    <p className="text-sm text-muted-foreground">Come vuoi essere chiamato?</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="full_name" className="text-sm font-medium">Nome completo</Label>
                  <Input
                    id="full_name"
                    placeholder="Mario Rossi"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="h-12 text-base border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 smooth-transition"
                    autoFocus
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 2: Città e Ruolo */}
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              step === 2
                ? 'opacity-100 translate-x-0'
                : step > 2
                ? 'opacity-0 -translate-x-full'
                : 'opacity-0 translate-x-full'
            }`}
          >
            <Card className="border-none bg-gradient-to-br from-primary/5 via-accent/5 to-background shadow-none">
              <CardContent className="pt-6 space-y-5">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center backdrop-blur-sm">
                    <MapPin className="h-7 w-7 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Dove ti trovi?</h3>
                    <p className="text-sm text-muted-foreground">
                      {initialRole === "recruiter" ? "In quale città operi?" : "In quale città cerchi lavoro?"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="city" className="text-sm font-medium">Città</Label>
                  <Input
                    id="city"
                    placeholder="Milano"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="h-12 text-base border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 smooth-transition"
                    autoFocus
                  />
                </div>
                {initialRole === "candidate" && (
                  <div className="space-y-2.5">
                    <Label htmlFor="job_title" className="text-sm font-medium">Ruolo desiderato</Label>
                    <Input
                      id="job_title"
                      placeholder="Full Stack Developer"
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      className="h-12 text-base border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 smooth-transition"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Step 3: Foto profilo */}
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              step === 3
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-full'
            }`}
          >
            <Card className="border-none bg-gradient-to-br from-primary/5 via-accent/5 to-background shadow-none">
              <CardContent className="pt-6 space-y-5">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center backdrop-blur-sm">
                    <Camera className="h-7 w-7 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Foto profilo</h3>
                    <p className="text-sm text-muted-foreground">Opzionale · Puoi saltare questo passaggio</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="avatar_url" className="text-sm font-medium">URL immagine</Label>
                  <Input
                    id="avatar_url"
                    placeholder="https://..."
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    className="h-12 text-base border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 smooth-transition"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Puoi aggiungere la foto anche in seguito dal tuo profilo
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-2 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Salta
          </Button>
          
          <div className="flex gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                Indietro
              </Button>
            )}
            
            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                className="apple-button"
              >
                Avanti
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="apple-button bg-gradient-to-r from-primary to-primary/80"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  "Completa"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingDialog;
