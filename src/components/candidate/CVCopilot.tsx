import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

interface CVCopilotProps {
  jobTitle: string;
  jobDescription: string;
  currentCV?: string;
}

export const CVCopilot = ({ jobTitle, jobDescription, currentCV }: CVCopilotProps) => {
  const [open, setOpen] = useState(false);
  const [cvText, setCvText] = useState(currentCV || "");
  const [improving, setImproving] = useState(false);
  const [suggestions, setSuggestions] = useState("");

  const handleImprove = async () => {
    if (!cvText.trim()) {
      toast.error("Inserisci il testo del tuo CV");
      return;
    }

    setImproving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          prompt: `Analizza questo CV e suggerisci miglioramenti per questa posizione:
          
Posizione: ${jobTitle}
Descrizione: ${jobDescription}

CV attuale:
${cvText}

Fornisci 3-5 suggerimenti concreti per migliorare il CV per questa specifica posizione.`
        })
      });

      const data = await response.json();
      setSuggestions(data.insight || data.error);
    } catch (error) {
      console.error("Error improving CV:", error);
      toast.error("Errore nel miglioramento CV");
    } finally {
      setImproving(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Migliora CV
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Migliora il tuo CV per: {jobTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Incolla il testo del tuo CV attuale
              </label>
              <Textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Inserisci qui il contenuto del tuo CV..."
                className="min-h-[200px]"
              />
            </div>

            <Button
              onClick={handleImprove}
              disabled={improving || !cvText.trim()}
              className="w-full"
            >
              {improving ? "Analisi in corso..." : "Analizza e Suggerisci"}
            </Button>

            {suggestions && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="font-medium">Suggerimenti:</p>
                <div className="text-sm whitespace-pre-wrap">{suggestions}</div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
