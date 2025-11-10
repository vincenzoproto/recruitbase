import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { toast } from "sonner";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  aiCredits: string;
  icon: any;
  recommended?: boolean;
}

export const PricingPlans = () => {
  const plans: Plan[] = [
    {
      name: "Starter",
      price: "€29",
      period: "/mese",
      description: "1-2 recruiter",
      features: [
        "Dashboard completa",
        "TRM & Pipeline",
        "Chat con candidati",
        "Analytics base",
        "1-2 membri team",
      ],
      aiCredits: "+100 richieste AI/mese",
      icon: Zap,
    },
    {
      name: "Growth",
      price: "€59",
      period: "/mese",
      description: "3-5 recruiter",
      features: [
        "Tutto di Starter +",
        "Calendario colloqui",
        "Gestione team avanzata",
        "Analytics avanzati",
        "3-5 membri team",
        "Report PDF export",
      ],
      aiCredits: "+300 richieste AI/mese",
      icon: Crown,
      recommended: true,
    },
    {
      name: "Pro",
      price: "€99",
      period: "/mese",
      description: "Illimitato",
      features: [
        "Tutto di Growth +",
        "Membri team illimitati",
        "API access",
        "White label",
        "Supporto prioritario",
        "Custom integrations",
      ],
      aiCredits: "+1000 richieste AI/mese",
      icon: Sparkles,
    },
  ];

  const handleSelectPlan = (planName: string) => {
    toast.info(`Piano ${planName} selezionato. Redirect a Stripe...`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Piani Aziendali</h2>
        <p className="text-muted-foreground">
          Scegli il piano perfetto per il tuo team di recruiting
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.name}
              className={`relative ${
                plan.recommended
                  ? "border-primary shadow-lg ring-2 ring-primary/20"
                  : "border-border"
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Consigliato
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      plan.recommended ? "bg-primary" : "bg-primary/10"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${
                        plan.recommended ? "text-primary-foreground" : "text-primary"
                      }`}
                    />
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium">{plan.aiCredits}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleSelectPlan(plan.name)}
                  className="w-full"
                  variant={plan.recommended ? "default" : "outline"}
                >
                  Inizia Subito
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg mb-1">
                🚀 Prova gratis per 30 giorni
              </h3>
              <p className="text-sm text-muted-foreground">
                Poi €19/mese per singoli recruiter · Cancella quando vuoi
              </p>
            </div>
            <Button onClick={() => toast.info("Redirect a Stripe...")}>
              Attiva Prova Gratuita
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
