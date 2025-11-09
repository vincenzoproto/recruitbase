import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const PremiumButton = () => {
  return (
    <Button
      onClick={() => window.open("https://buy.stripe.com/7sYfZh2br4aUfNW24GabK00", "_blank")}
      className="apple-button bg-gradient-to-r from-primary to-primary/80 hover:shadow-glow"
    >
      <Sparkles className="mr-2 h-4 w-4" />
      Inizia gratis - Paga dopo 30 giorni
    </Button>
  );
};
