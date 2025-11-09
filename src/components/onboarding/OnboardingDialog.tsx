import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, MapPin, Camera, Briefcase, UserCheck } from "lucide-react";
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
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right');
  const [formData, setFormData] = useState({
    full_name: "",
    city: "",
    job_title: "",
    avatar_url: "",
  });

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
      <DialogContent className="sm:max-w-[540px] glass-card border-border/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold flex items-center gap-3">
            Benvenuto su Recruit Base
            <span className="text-2xl animate-bounce-soft">✨</span>
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Step {step} di 3 · Completa il tuo profilo per iniziare
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= step 
                  ? 'bg-primary shadow-[0_0_8px_rgba(0,122,255,0.4)]' 
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

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

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 gap-3">
          {step > 1 ? (
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={loading}
              className="h-11 px-6 apple-button border-border/50"
            >
              Indietro
            </Button>
          ) : (
            <div />
          )}
          
          {step < 3 ? (
            <Button 
              onClick={handleNext} 
              size="lg" 
              className="h-11 px-8 ml-auto apple-button bg-primary hover:bg-primary/90 shadow-[0_4px_16px_rgba(0,122,255,0.3)]"
            >
              Avanti
            </Button>
          ) : (
            <Button 
              onClick={handleComplete} 
              disabled={loading} 
              size="lg" 
              className="h-11 px-8 ml-auto apple-button bg-primary hover:bg-primary/90 shadow-[0_4px_16px_rgba(0,122,255,0.3)]"
            >
              {loading ? "Completamento..." : "Completa ✨"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingDialog;
