import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Briefcase, UserCircle } from "lucide-react";
import { toast } from "sonner";

interface RoleSetupProps {
  userId: string;
  onComplete: (role: string) => void;
}

const RoleSetup = ({ userId, onComplete }: RoleSetupProps) => {
  const [selectedRole, setSelectedRole] = useState<"recruiter" | "candidate">("candidate");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: selectedRole })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Ruolo configurato con successo!");
      onComplete(selectedRole);
    } catch (error: any) {
      toast.error(error.message || "Errore durante la configurazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent via-background to-accent/50 p-4">
      <Card className="w-full max-w-md shadow-xl animate-scale-in border-border/50">
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Configura il tuo account
          </CardTitle>
          <CardDescription className="text-base">Scegli come vuoi utilizzare Pausilio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
            <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer group">
              <RadioGroupItem value="candidate" id="candidate-setup" />
              <Label htmlFor="candidate-setup" className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <UserCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Candidato</div>
                  <div className="text-xs text-muted-foreground">Cerca opportunità di lavoro</div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer group">
              <RadioGroupItem value="recruiter" id="recruiter-setup" />
              <Label htmlFor="recruiter-setup" className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Recruiter</div>
                  <div className="text-xs text-muted-foreground">Pubblica offerte e trova talenti</div>
                </div>
              </Label>
            </div>
          </RadioGroup>
          <Button 
            onClick={handleSubmit} 
            className="w-full h-11 font-semibold transition-all hover:scale-[1.02]" 
            disabled={loading}
          >
            {loading ? "Configurazione..." : "Continua"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSetup;
