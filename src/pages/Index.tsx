import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, CheckCircle, Sparkles, Target, TrendingUp, Award, Rocket, Shield, Clock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header - Fast & Sleek */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/90 border-b border-primary/10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Pausilio
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/auth")} 
              className="font-semibold hidden sm:inline-flex rounded-xl hover:bg-primary/10 transition-all duration-200"
            >
              Accedi
            </Button>
            <Button 
              onClick={() => navigate("/auth")} 
              className="font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:scale-105"
            >
              Inizia Gratis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Ultra Fast */}
      <section className="container mx-auto px-4 sm:px-6 py-16 md:py-24 relative">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-5 py-2 glass-card animate-scale-in">
            <Rocket className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              🚀 Il TRM che semplifica la vita ai Recruiter
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight">
            Candidature, Match e Follow-up
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Gestiti in modo intelligente
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Velocità di selezione <span className="font-bold text-primary">10×</span>, AI che scrive messaggi, match basati su valori
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-base px-10 h-14 rounded-xl shadow-lg transition-all duration-200 font-bold group bg-gradient-to-r from-primary to-primary/90 hover:shadow-xl hover:scale-105"
            >
              Inizia ora (gratis 30 giorni)
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/demo")}
              className="text-base px-10 h-14 rounded-xl font-bold border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-200"
            >
              Prova la Demo Live
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm">
            {[
              { icon: CheckCircle, text: "30 giorni gratis" },
              { icon: CheckCircle, text: "Nessuna carta richiesta" },
              { icon: CheckCircle, text: "Setup in 2 minuti" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
                  <item.icon className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-semibold text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { value: "500+", label: "Recruiter attivi" },
            { value: "10K+", label: "Candidature gestite" },
            { value: "98%", label: "Soddisfazione utenti" }
          ].map((stat, idx) => (
            <div key={idx} className="neon-card p-6 text-center space-y-2 hover:scale-105 transition-all duration-300 animate-fade-in group" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Value Props - Fast & Modern */}
      <section className="container mx-auto px-4 sm:px-6 py-16 md:py-24 relative">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Perché scegliere</span>
            <br />Pausilio
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Velocità, intelligenza e attenzione ai dettagli in ogni funzionalità
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { icon: Zap, title: "Velocità 10×", description: "Gestisci candidature con swipe, aggiorna stati in 1 tap, pianifica colloqui istantaneamente", gradient: "from-primary to-primary/80" },
            { icon: Sparkles, title: "AI che scrive per te", description: "Follow-up automatici, messaggi ottimizzati, insight su chi contattare per primo", gradient: "from-primary/90 to-primary/70" },
            { icon: Shield, title: "Match su valori reali", description: "Algoritmo TRS™ che valuta relazioni autentiche, non solo competenze tecniche", gradient: "from-primary/80 to-primary" }
          ].map((prop, idx) => (
            <div key={idx} className="glass-card p-6 space-y-4 hover:scale-105 hover:shadow-xl transition-all duration-300 group animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className={`w-14 h-14 bg-gradient-to-br ${prop.gradient} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-200`}>
                <prop.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">{prop.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{prop.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works - Sleek */}
      <section className="container mx-auto px-4 sm:px-6 py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            Come <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">funziona</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tre semplici step per rivoluzionare il tuo recruiting
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {[
            { step: "01", title: "Crea il tuo account", desc: "Setup in 2 minuti, senza carta di credito", icon: Target },
            { step: "02", title: "Carica le candidature", desc: "Import automatico o manuale, AI che analizza i CV", icon: TrendingUp },
            { step: "03", title: "Match intelligenti", desc: "L'AI trova i candidati perfetti per le tue posizioni", icon: Award }
          ].map((step, idx) => (
            <div key={idx} className="neon-card p-6 flex items-center gap-6 hover:scale-[1.02] transition-all duration-300 animate-fade-in group" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-md group-hover:scale-110 transition-all duration-200">
                {step.step}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
              <step.icon className="h-10 w-10 text-primary group-hover:scale-110 transition-transform duration-200" />
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-black">
              Usato da <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">500+ Recruiter</span>
            </h2>
            <p className="text-muted-foreground">
              che hanno risparmiato migliaia di ore e migliorato la qualità dei loro match
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Clock, text: "10 ore risparmiate/settimana" },
              { icon: TrendingUp, text: "+45% tasso di risposta" },
              { icon: Award, text: "4.9/5 rating medio" }
            ].map((item, idx) => (
              <div key={idx} className="glass-card p-4 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200">
                <item.icon className="h-8 w-8 text-primary" />
                <p className="font-semibold text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-center space-y-8 p-10 md:p-14 rounded-3xl relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-white">
              Pronto a gestire candidature<br />in modo intelligente?
            </h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              30 giorni gratis · Nessuna carta · Setup in 2 minuti
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-base px-10 h-14 rounded-xl shadow-xl transition-all duration-200 font-bold group bg-white text-primary hover:scale-110 hover:shadow-2xl"
            >
              Inizia ora gratis
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 bg-gradient-to-b from-background to-primary/5 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Pausilio</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Il TRM che semplifica il recruiting
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-foreground">Prodotto</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <button className="block hover:text-primary transition-colors">Funzionalità</button>
                <button className="block hover:text-primary transition-colors">Demo</button>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-foreground">Azienda</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <button className="block hover:text-primary transition-colors">Chi siamo</button>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-foreground">Legale</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <button className="block hover:text-primary transition-colors">Privacy</button>
                <button className="block hover:text-primary transition-colors">Termini</button>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-primary/10 text-center">
            <p className="text-xs text-muted-foreground">© 2024 Pausilio. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
