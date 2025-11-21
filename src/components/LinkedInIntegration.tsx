import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ExternalLink, Zap } from "lucide-react";

const LinkedInIntegration = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTriggerWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Inserisci l'URL del webhook Zapier/Make");
      return;
    }

    setLoading(true);
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: "Pausilio",
          action: "linkedin_search",
        }),
      });

      toast.success("Automazione LinkedIn attivata! Controlla Zapier/Make per i risultati.");
    } catch (error) {
      toast.error("Errore nell'attivazione dell'automazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Automazione LinkedIn
        </CardTitle>
        <CardDescription>
          Integra Zapier o Make per automatizzare la ricerca candidati su LinkedIn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhook">Webhook URL (Zapier/Make)</Label>
          <Input
            id="webhook"
            type="url"
            placeholder="https://hooks.zapier.com/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Crea un webhook su Zapier o Make, poi incolla qui l'URL
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleTriggerWebhook} disabled={loading || !webhookUrl} className="flex-1">
            {loading ? "Attivazione..." : "Attiva Ricerca LinkedIn"}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open("https://zapier.com/apps/webhook/integrations", "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 bg-accent rounded-lg space-y-2 text-sm">
          <p className="font-medium">Come configurare:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Crea un Zap su Zapier (o scenario su Make)</li>
            <li>Usa "Webhooks by Zapier" come trigger</li>
            <li>Aggiungi azione "LinkedIn" per cercare candidati</li>
            <li>Copia il webhook URL e incollalo qui sopra</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkedInIntegration;
