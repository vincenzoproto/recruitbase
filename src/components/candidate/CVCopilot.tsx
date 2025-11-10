import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Copy, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CVCopilotProps {
  profile: any;
}

export const CVCopilot = ({ profile }: CVCopilotProps) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"analyze" | "letter" | "suggestions">("analyze");
  const [tone, setTone] = useState("professional");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyzeProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-insights", {
        body: {
          type: "profile_analysis",
          profile: {
            full_name: profile.full_name,
            job_title: profile.job_title,
            skills: profile.skills,
            bio: profile.bio,
            trs: profile.talent_relationship_score,
            core_values: profile.core_values
          }
        }
      });

      if (error) throw error;
      setResult(data.insights || "Nessun suggerimento disponibile.");
      toast.success("✅ Analisi completata!");
    } catch (error: any) {
      console.error("Error analyzing profile:", error);
      if (error.status === 429) {
        toast.error("Troppi suggerimenti richiesti, riprova tra poco.");
      } else if (error.status === 402) {
        toast.error("Crediti AI esauriti, contatta il supporto.");
      } else {
        toast.error("Errore nell'analisi del profilo");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateLetter = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-insights", {
        body: {
          type: "cover_letter",
          profile: {
            full_name: profile.full_name,
            job_title: profile.job_title,
            skills: profile.skills,
            bio: profile.bio
          },
          tone
        }
      });

      if (error) throw error;
      setResult(data.insights || "Errore nella generazione.");
      toast.success("✅ Lettera generata!");
    } catch (error: any) {
      console.error("Error generating letter:", error);
      if (error.status === 429) {
        toast.error("Troppi suggerimenti richiesti, riprova tra poco.");
      } else if (error.status === 402) {
        toast.error("Crediti AI esauriti, contatta il supporto.");
      } else {
        toast.error("Errore nella generazione");
      }
    } finally {
      setLoading(false);
    }
  };

  const suggestOffers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-insights", {
        body: {
          type: "job_suggestions",
          profile: {
            job_title: profile.job_title,
            skills: profile.skills,
            city: profile.city,
            core_values: profile.core_values
          }
        }
      });

      if (error) throw error;
      setResult(data.insights || "Nessuna offerta compatibile trovata.");
      toast.success("✅ Suggerimenti pronti!");
    } catch (error: any) {
      console.error("Error suggesting offers:", error);
      if (error.status === 429) {
        toast.error("Troppi suggerimenti richiesti, riprova tra poco.");
      } else if (error.status === 402) {
        toast.error("Crediti AI esauriti, contatta il supporto.");
      } else {
        toast.error("Errore nel caricamento suggerimenti");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    setResult("");
    switch (mode) {
      case "analyze":
        analyzeProfile();
        break;
      case "letter":
        generateLetter();
        break;
      case "suggestions":
        suggestOffers();
        break;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast.success("📋 Copiato negli appunti!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full sm:w-auto">
          <Sparkles className="mr-2 h-4 w-4" />
          🤖 Copilot AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Copilot Candidato
          </DialogTitle>
          <DialogDescription>
            Suggerimenti intelligenti per migliorare la tua candidatura
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={mode === "analyze" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("analyze")}
              className="text-xs"
            >
              📊 Analizza
            </Button>
            <Button
              variant={mode === "letter" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("letter")}
              className="text-xs"
            >
              ✍️ Lettera
            </Button>
            <Button
              variant={mode === "suggestions" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("suggestions")}
              className="text-xs"
            >
              💼 Offerte
            </Button>
          </div>

          {mode === "letter" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Tono</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">🎩 Professionale</SelectItem>
                  <SelectItem value="empathetic">💙 Empatico</SelectItem>
                  <SelectItem value="creative">🎨 Creativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={handleAction} disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Elaborazione...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {mode === "analyze" && "Analizza"}
                {mode === "letter" && "Genera"}
                {mode === "suggestions" && "Suggerisci"}
              </>
            )}
          </Button>

          {result && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Risultato</span>
                  <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea value={result} readOnly className="min-h-[200px] text-sm" />
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="bg-white">
                  TRS {profile.talent_relationship_score || 0}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">💡 Suggerimento rapido</p>
                  <p className="text-xs text-muted-foreground">
                    Il tuo punteggio cresce se rispondi ai recruiter entro 24 ore.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
