import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/MainLayout";

const Copilot = () => {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState<"professional" | "friendly" | "direct">("professional");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Inserisci una richiesta");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-message-suggest", {
        body: { prompt, tone },
      });

      if (error) throw error;
      if (data?.suggestion) {
        setOutput(data.suggestion);
      } else {
        toast.error("Nessuna risposta dall'AI");
      }
    } catch (error: any) {
      console.error("AI error:", error);
      toast.error("Errore durante la generazione");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success("Copiato negli appunti");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Copilot AI</h1>
            <p className="text-muted-foreground">Genera testi personalizzati con l'intelligenza artificiale</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Genera contenuto</CardTitle>
            <CardDescription>
              Descrivi cosa vuoi generare e scegli il tono di voce
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">La tua richiesta</label>
              <Textarea
                placeholder="Es: Scrivi un messaggio per un candidato interessante..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tono</label>
              <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professionale</SelectItem>
                  <SelectItem value="friendly">Amichevole</SelectItem>
                  <SelectItem value="direct">Diretto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generazione in corso...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Genera con AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {output && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Risultato
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Copiato
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copia
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                {output}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">💡 Suggerimenti:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Sii specifico nella richiesta per risultati migliori</li>
              <li>• Scegli il tono adatto al contesto</li>
              <li>• Puoi rigenare più volte fino al risultato perfetto</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Copilot;
