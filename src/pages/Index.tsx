import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users, Target, Zap, Activity, ArrowRight } from "lucide-react";
import { TRSInfoPopup } from "@/components/premium/TRSInfoPopup";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation, Language } from "@/lib/i18n";

const Index = () => {
  const navigate = useNavigate();
  const [showTRSDialog, setShowTRSDialog] = useState(false);
  const [language, setLanguage] = useState<Language>("it");
  const { t } = useTranslation(language);

  useEffect(() => {
    let mounted = true;
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        navigate(session ? "/dashboard" : "/auth", { replace: true });
      })
      .catch(() => {
        if (!mounted) return;
        navigate("/auth", { replace: true });
      });
    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 border-b relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Recruit Base</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector currentLang={language} onLanguageChange={setLanguage} />
            <Button onClick={() => navigate("/auth")} variant="outline">
              {language === "it" ? "Accedi / Registrati" : "Sign In / Sign Up"}
            </Button>
          </div>
        </div>
      </header>

      {/* TRS Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Algoritmo Proprietario</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tight">
              Recruit Base TRM
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-primary font-semibold">
              {t("hero.title")}
            </p>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
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
                {language === "it" ? "Inizia Gratis" : "Start Free"}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full h-12 gap-2"
                onClick={() => setShowTRSDialog(true)}
              >
                {t("hero.cta")}
                <ArrowRight className="h-4 w-4" />
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
        <div className="container mx-auto px-4 py-8 text-center space-y-2">
          <p className="text-sm text-muted-foreground">© 2025 Recruit Base. {language === "it" ? "Tutti i diritti riservati" : "All rights reserved"}.</p>
          <p className="text-xs text-muted-foreground/60 italic font-light">
            {t("footer")}
          </p>
        </div>
      </footer>

      {/* TRS Info Popup */}
      <TRSInfoPopup open={showTRSDialog} onOpenChange={setShowTRSDialog} />
    </div>
  );
};

export default Index;
