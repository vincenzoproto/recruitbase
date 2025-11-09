import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Briefcase, Users, Target, Zap, Activity, MessageCircle, TrendingUp, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [showTRSDialog, setShowTRSDialog] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Recruit Base</h1>
          </div>
          <Button onClick={() => navigate("/auth")} variant="outline">
            Accedi / Registrati
          </Button>
        </div>
      </header>

      {/* TRS Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Algoritmo Proprietario</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tight">
              Recruit Base TRM
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Misura la qualità delle relazioni di talento.
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Algoritmo proprietario <span className="font-semibold text-foreground">Talent Relationship Score™</span> per costruire 
              <span className="font-semibold text-foreground"> relazioni durature</span> con i migliori candidati.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 justify-center pt-6 w-full max-w-md mx-auto">
              <Button 
                size="lg" 
                className="w-full h-12 font-bold"
                onClick={() => navigate("/auth")}
              >
                Inizia Gratis
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full h-12"
                onClick={() => setShowTRSDialog(true)}
              >
                Scopri come funziona
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 pt-6 text-sm text-muted-foreground">
              <span>✓ 30 giorni gratis</span>
              <span>✓ Algoritmo esclusivo</span>
              <span>✓ Nessuna carta</span>
            </div>

            {/* Visual Element */}
            <div className="pt-8 px-4">
              <Card className="max-w-md mx-auto border-primary/20">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl sm:text-3xl font-bold text-foreground font-mono">87</span>
                      <span className="font-semibold text-primary">TRS™</span>
                    </div>
                    <div className="flex-1 w-full">
                      <div className="relative w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-green-500 h-full rounded-full"
                          style={{ width: '87%' }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-12 scroll-mt-20">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">Per Candidati</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Crea il tuo profilo e candidati alle migliori offerte
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">Per Recruiter</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pubblica offerte e trova i candidati perfetti
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">Matching Preciso</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sistema di ricerca avanzato con TRS™
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">Veloce & Intuitivo</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Interfaccia moderna, anche da smartphone
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <Card className="border-none shadow-xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
          <CardContent className="py-8 text-center space-y-4 px-4">
            <h3 className="text-xl md:text-2xl font-bold">Pronto a iniziare?</h3>
            <p className="text-base opacity-90">
              Scopri il potere del tuo network di talenti
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="w-full max-w-xs h-12 font-bold"
              onClick={() => navigate("/auth")}
            >
              Inizia Gratis
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Recruit Base. Tutti i diritti riservati.</p>
          <p className="mt-2 text-xs italic">Talent Relationship Score™ – Proprietary Algorithm</p>
        </div>
      </footer>

      {/* TRS Explanation Dialog */}
      <Dialog open={showTRSDialog} onOpenChange={setShowTRSDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-bold text-center mb-4">
              Come funziona il Talent Relationship Score™
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-8 py-6">
            {/* Feature 1 */}
            <div className="flex gap-6 items-start animate-fade-in">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2">1️⃣ Interazione Reale</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Analizza la qualità dei tuoi messaggi e risposte. L'algoritmo valuta empatia, 
                  frequenza di contatto e la profondità delle conversazioni per determinare la 
                  forza della relazione.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-6 items-start animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center">
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2">2️⃣ Engagement Continuo</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Misura la costanza e la profondità dei contatti nel tempo. Il TRS™ tiene traccia 
                  di ogni interazione e nota le attività regolari che dimostrano un genuino interesse reciproco.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-6 items-start animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2">3️⃣ Predizione Relazionale</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Ti segnala i talenti più pronti a collaborare. Il sistema proprietario predice quali 
                  candidati hanno maggiore probabilità di rispondere positivamente e di essere interessati 
                  a nuove opportunità.
                </p>
              </div>
            </div>

            {/* Proprietary Badge */}
            <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
              <p className="text-center font-semibold text-foreground mb-2">
                🔒 Talent Relationship Score™ – Proprietary Metric
              </p>
              <p className="text-center text-sm text-muted-foreground italic">
                Algoritmo esclusivo di Recruit Base
              </p>
            </div>

            {/* CTA */}
            <div className="text-center pt-4 space-y-4">
              <p className="text-lg font-semibold text-foreground">
                Scopri il potere del tuo network di talenti.
              </p>
              <Button 
                size="lg" 
                className="h-12 px-8 font-bold"
                onClick={() => {
                  setShowTRSDialog(false);
                  navigate("/auth");
                }}
              >
                Accedi a Recruit Base TRM
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
