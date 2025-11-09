import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users, Target, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent to-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Recruit Base</h1>
          </div>
          <Button onClick={() => navigate("/auth")}>Accedi / Registrati</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-5xl font-bold text-foreground leading-tight">
            Connetti Talenti e Opportunità
          </h2>
          <p className="text-xl text-muted-foreground">
            La piattaforma moderna per recruiter e candidati. Semplice, veloce, professionale.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Inizia Subito
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Scopri di Più
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-lg">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Per Candidati</h3>
              <p className="text-sm text-muted-foreground">
                Crea il tuo profilo e candidati alle migliori offerte in pochi clic
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Per Recruiter</h3>
              <p className="text-sm text-muted-foreground">
                Pubblica offerte e trova i candidati perfetti per la tua azienda
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Matching Preciso</h3>
              <p className="text-sm text-muted-foreground">
                Sistema di ricerca avanzato per trovare il match perfetto
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Veloce & Intuitivo</h3>
              <p className="text-sm text-muted-foreground">
                Interfaccia moderna e facile da usare, anche da smartphone
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="border-none shadow-xl bg-primary text-primary-foreground">
          <CardContent className="py-12 text-center space-y-4">
            <h3 className="text-3xl font-bold">Pronto a iniziare?</h3>
            <p className="text-lg opacity-90">Unisciti a Recruit Base e trova il tuo prossimo successo</p>
            <Button size="lg" variant="secondary" onClick={() => navigate("/auth")}>
              Registrati Gratis
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Recruit Base. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
