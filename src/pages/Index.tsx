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
        <div className="max-w-3xl mx-auto space-y-8 animate-slide-up">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Connetti Talenti e <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Opportunità</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground">
            La piattaforma moderna per recruiter e candidati.<br />
            <span className="font-semibold text-foreground">Semplice, veloce, professionale.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button 
              size="lg" 
              className="h-12 px-8 text-lg font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={() => navigate("/auth")}
            >
              Inizia Gratis
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-12 px-8 text-lg font-semibold transition-all hover:scale-105"
              onClick={() => navigate("/auth")}
            >
              Scopri di Più
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in">
            <CardContent className="pt-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Per Candidati</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Crea il tuo profilo e candidati alle migliori offerte in pochi clic
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardContent className="pt-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto">
                <Briefcase className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Per Recruiter</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pubblica offerte e trova i candidati perfetti per la tua azienda
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardContent className="pt-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Matching Preciso</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sistema di ricerca avanzato per trovare il match perfetto
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardContent className="pt-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Veloce & Intuitivo</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
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
