import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Zap, Brain, ArrowRight, CheckCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header - iOS Style */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/95 border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-lg">RB</span>
            </div>
            <span className="font-semibold text-xl tracking-tight text-foreground">
              Recruit Base
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/auth")} 
              className="font-medium hidden sm:inline-flex rounded-xl hover:bg-accent/50 transition-all duration-200"
            >
              Accedi
            </Button>
            <Button 
              onClick={() => navigate("/auth")} 
              className="font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-primary hover:bg-primary/90"
            >
              Inizia Gratis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - iOS Minimal Style */}
      <section className="container mx-auto px-4 sm:px-6 py-16 md:py-28">
        <div className="max-w-4xl mx-auto text-center space-y-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/8 rounded-full border border-primary/15">
            <span className="text-sm font-medium text-primary">🚀 Il TRM che semplifica la vita ai Recruiter</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
            Candidature, Match e Follow-up
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
              Gestiti in modo intelligente
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            Velocità di selezione 10×, AI che scrive messaggi, match basati su valori reali
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-8">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-base px-10 h-14 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 font-semibold group bg-primary hover:bg-primary/90"
            >
              Inizia ora (gratis 30 giorni)
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/demo")}
              className="text-base px-10 h-14 rounded-2xl font-semibold border-border/60 hover:border-border hover:bg-accent/50 transition-all duration-200"
            >
              Prova la Demo Live
            </Button>
          </div>
          
          {/* Trust Indicators - iOS Minimal */}
          <div className="flex flex-wrap justify-center gap-8 pt-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-3.5 w-3.5 text-success" />
              </div>
              <span className="font-medium">30 giorni gratis</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-3.5 w-3.5 text-success" />
              </div>
              <span className="font-medium">Nessuna carta richiesta</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-3.5 w-3.5 text-success" />
              </div>
              <span className="font-medium">Setup in 2 minuti</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props - iOS Card Style */}
      <section className="container mx-auto px-4 sm:px-6 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Velocità */}
          <div className="minimal-card text-center space-y-5 p-8 bg-card hover:shadow-md transition-all duration-300 group">
            <div className="mx-auto w-14 h-14 bg-primary/8 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight">Velocità 10×</h3>
            <p className="text-muted-foreground leading-relaxed text-[15px]">
              Gestisci candidature con swipe, aggiorna stati in 1 tap, pianifica colloqui istantaneamente
            </p>
          </div>

          {/* AI */}
          <div className="minimal-card text-center space-y-5 p-8 bg-card hover:shadow-md transition-all duration-300 group">
            <div className="mx-auto w-14 h-14 bg-primary/8 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
              <Brain className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight">AI che scrive per te</h3>
            <p className="text-muted-foreground leading-relaxed text-[15px]">
              Follow-up automatici, messaggi ottimizzati, insight su chi contattare per primo
            </p>
          </div>

          {/* Values */}
          <div className="minimal-card text-center space-y-5 p-8 bg-card hover:shadow-md transition-all duration-300 group">
            <div className="mx-auto w-14 h-14 bg-primary/8 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
              <Heart className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight">Match su valori reali</h3>
            <p className="text-muted-foreground leading-relaxed text-[15px]">
              Algoritmo TRS™ che valuta relazioni autentiche, non solo competenze tecniche
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8 p-8 md:p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl border border-primary/20 shadow-xl animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            Pronto a gestire candidature
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              in modo intelligente?
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            30 giorni gratis · Nessuna carta · Setup in 2 minuti
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="text-base px-10 h-14 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold group"
          >
            Inizia ora gratis
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <span className="text-sm text-muted-foreground">© 2024 Recruit Base</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">Privacy</button>
              <button className="hover:text-foreground transition-colors">Termini</button>
              <button className="hover:text-foreground transition-colors">Contatti</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
