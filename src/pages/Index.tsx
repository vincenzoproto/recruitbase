import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Zap, Brain, ArrowRight, CheckCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">RB</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Recruit Base
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/auth")} 
              className="font-semibold hidden sm:inline-flex"
            >
              Accedi
            </Button>
            <Button 
              onClick={() => navigate("/auth")} 
              className="font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Inizia Gratis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-4">
            <span className="text-sm font-semibold text-primary">🚀 Il TRM che semplifica la vita ai Recruiter</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Candidature, Match e Follow-up
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Gestiti in modo intelligente
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Velocità di selezione 10×, AI che scrive messaggi, match basati su valori reali
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-base px-8 h-14 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold group"
            >
              Inizia ora (gratis 30 giorni)
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>30 giorni gratis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Nessuna carta richiesta</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Setup in 2 minuti</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Speed */}
          <div className="text-center space-y-4 p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 hover:border-primary/30 transition-all animate-fade-in">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Velocità 10×</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Gestisci candidature con swipe, aggiorna stati in 1 tap, pianifica colloqui istantaneamente
            </p>
          </div>

          {/* AI */}
          <div className="text-center space-y-4 p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 hover:border-primary/30 transition-all animate-fade-in animation-delay-100">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">AI che scrive per te</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Follow-up automatici, messaggi ottimizzati, insight su chi contattare per primo
            </p>
          </div>

          {/* Values */}
          <div className="text-center space-y-4 p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 hover:border-primary/30 transition-all animate-fade-in animation-delay-200">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Match su valori reali</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
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
