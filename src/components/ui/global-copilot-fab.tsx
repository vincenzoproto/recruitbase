import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { hapticFeedback } from "@/lib/haptics";

interface GlobalCopilotFABProps {
  userRole: "recruiter" | "candidate";
}

export const GlobalCopilotFAB = ({ userRole }: GlobalCopilotFABProps) => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState<"professional" | "friendly" | "direct">("professional");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Scrivi una richiesta");
      return;
    }

    setLoading(true);
    hapticFeedback.medium();

    try {
      const systemPrompt = userRole === "recruiter"
        ? "Sei un assistente AI per recruiter. Aiuta a scrivere follow-up, descrizioni offerte e messaggi professionali."
        : "Sei un assistente AI per candidati. Aiuta a ottimizzare CV, scrivere lettere motivazionali e rispondere ai recruiter.";

      const toneInstruction = {
        professional: "Usa un tono professionale e formale.",
        friendly: "Usa un tono empatico e amichevole.",
        direct: "Usa un tono diretto e conciso.",
      }[tone];

      const { data, error } = await supabase.functions.invoke("ai-message-suggest", {
        body: {
          message: `${systemPrompt} ${toneInstruction}\n\nRichiesta: ${prompt}`,
          tone,
        },
      });

      if (error) throw error;

      setOutput(data.suggestion || "Nessuna risposta generata.");
      hapticFeedback.success();
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast.error("Errore nella generazione AI");
      hapticFeedback.error();
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copiato negli appunti!");
    hapticFeedback.light();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
          hapticFeedback.light();
        }}
        className="fixed bottom-20 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
        size="icon"
      >
        <Sparkles className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Copilot AI Globale
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Cosa vuoi creare?</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  userRole === "recruiter"
                    ? "Es. Scrivi un follow-up per un candidato che non risponde da 5 giorni..."
                    : "Es. Scrivi una lettera motivazionale per una posizione di frontend developer..."
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Tono</Label>
              <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professionale</SelectItem>
                  <SelectItem value="friendly">Empatico</SelectItem>
                  <SelectItem value="direct">Diretto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Generazione...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Genera con AI
                </>
              )}
            </Button>

            {output && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Output</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copiato
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copia
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{output}</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
