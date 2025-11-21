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

      {/* Header - Premium & Fast */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-background/95 border-b border-primary/20 shadow-lg shadow-primary/5">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-xl blur-md group-hover:blur-lg transition-all duration-300 group-hover:bg-primary/40" />
              <div className="relative w-11 h-11 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <Zap className="w-6 h-6 text-white drop-shadow-lg" strokeWidth={2.5} />
              </div>
            </div>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              Pausilio
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/auth")} 
              className="font-semibold hidden sm:inline-flex rounded-xl hover:bg-primary/10 hover:scale-105 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">Accedi</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Button>
            <Button 
              onClick={() => navigate("/auth")} 
              className="font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:scale-110 hover:from-primary/90 hover:via-primary hover:to-primary relative overflow-hidden group"
            >
              <span className="relative z-10">Inizia Gratis</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
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
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-base px-12 h-16 rounded-2xl shadow-2xl transition-all duration-300 font-black group bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)] hover:scale-110 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Inizia ora (gratis 30 giorni)
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/demo")}
              className="text-base px-12 h-16 rounded-2xl font-bold border-2 border-primary/40 hover:border-primary hover:bg-primary/10 hover:scale-105 transition-all duration-300 backdrop-blur-sm relative overflow-hidden group"
            >
              <span className="relative z-10">Prova la Demo Live</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { icon: Zap, title: "Velocità 10×", description: "Gestisci candidature con swipe, aggiorna stati in 1 tap, pianifica colloqui istantaneamente", gradient: "from-primary to-primary/80" },
            { icon: Sparkles, title: "AI che scrive per te", description: "Follow-up automatici, messaggi ottimizzati, insight su chi contattare per primo", gradient: "from-primary/90 to-primary/70" },
            { icon: Shield, title: "Match su valori reali", description: "Algoritmo TRS™ che valuta relazioni autentiche, non solo competenze tecniche", gradient: "from-primary/80 to-primary" }
          ].map((prop, idx) => (
            <div key={idx} className="relative group animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
              <div className="relative glass-card p-8 space-y-5 hover:scale-105 hover:shadow-2xl transition-all duration-500 border border-primary/10 group-hover:border-primary/30">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${prop.gradient} rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300`} />
                  <div className={`relative w-16 h-16 bg-gradient-to-br ${prop.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <prop.icon className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                </div>
                <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors duration-300">{prop.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{prop.description}</p>
              </div>
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

      {/* Footer - Premium */}
      <footer className="relative border-t border-primary/20 bg-gradient-to-b from-background via-primary/5 to-primary/10 backdrop-blur-2xl overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="container mx-auto px-4 py-12 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-xl blur-md group-hover:blur-lg transition-all duration-300" />
                  <div className="relative w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                    <Zap className="w-5 h-5 text-white drop-shadow-lg" strokeWidth={2.5} />
                  </div>
                </div>
                <span className="font-black text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Pausilio</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Il TRM veloce e intelligente che semplifica il recruiting con attenzione ai dettagli
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Prodotto
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <button className="block hover:text-primary hover:translate-x-1 transition-all duration-200">Funzionalità</button>
                <button className="block hover:text-primary hover:translate-x-1 transition-all duration-200">Demo</button>
                <button className="block hover:text-primary hover:translate-x-1 transition-all duration-200">Prezzi</button>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Azienda
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <button className="block hover:text-primary hover:translate-x-1 transition-all duration-200">Chi siamo</button>
                <button className="block hover:text-primary hover:translate-x-1 transition-all duration-200">Contatti</button>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Legale
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <button onClick={() => navigate("/privacy")} className="block hover:text-primary hover:translate-x-1 transition-all duration-200">Privacy</button>
                <button onClick={() => navigate("/terms")} className="block hover:text-primary hover:translate-x-1 transition-all duration-200">Termini</button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2024 Pausilio. Tutti i diritti riservati.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Made with</span>
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">for Recruiters</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
