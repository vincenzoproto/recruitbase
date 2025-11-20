import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Zap, Brain, ArrowRight, CheckCircle, Sparkles, Target, TrendingUp, Users, Award, Star } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-violet/5 to-fuchsia/10 overflow-hidden">
      {/* Geometric Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-violet/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-fuchsia/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header - Modern Sticky */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-background/80 border-b border-violet/20 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-violet to-fuchsia rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
              <span className="text-white font-bold text-xl">RB</span>
            </div>
            <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-violet to-fuchsia bg-clip-text text-transparent">
              Recruit Base
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/auth")} 
              className="font-semibold hidden sm:inline-flex rounded-2xl hover:bg-violet/10 transition-all duration-300 hover:scale-105"
            >
              Accedi
            </Button>
            <Button 
              onClick={() => navigate("/auth")} 
              className="font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-violet to-fuchsia hover:scale-105 animate-glow-pulse"
            >
              Inizia Gratis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Ultra Impact */}
      <section className="container mx-auto px-4 sm:px-6 py-20 md:py-32 relative">
        <div className="max-w-5xl mx-auto text-center space-y-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-6 py-3 glass-card animate-scale-in">
            <Sparkles className="h-5 w-5 text-neon-purple animate-pulse" />
            <span className="text-sm font-bold bg-gradient-to-r from-violet to-fuchsia bg-clip-text text-transparent">
              🚀 Il TRM che semplifica la vita ai Recruiter
            </span>
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight">
            Candidature, Match e Follow-up
            <br />
            <span className="bg-gradient-to-r from-violet via-fuchsia to-neon-pink bg-clip-text text-transparent animate-glow">
              Gestiti in modo intelligente
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
            Velocità di selezione <span className="font-bold text-violet">10×</span>, AI che scrive messaggi, match basati su valori
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-lg px-12 h-16 rounded-3xl shadow-2xl transition-all duration-300 font-bold group bg-gradient-to-r from-violet via-fuchsia to-violet animate-glow-pulse"
            >
              Inizia ora (gratis 30 giorni)
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/demo")}
              className="text-lg px-12 h-16 rounded-3xl font-bold border-2 border-violet/40 hover:border-violet hover:bg-violet/10 transition-all duration-300 hover:scale-105"
            >
              Prova la Demo Live
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 pt-12 text-sm">
            {[
              { icon: CheckCircle, text: "30 giorni gratis" },
              { icon: CheckCircle, text: "Nessuna carta richiesta" },
              { icon: CheckCircle, text: "Setup in 2 minuti" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet to-fuchsia/50 flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { value: "500+", label: "Recruiter attivi" },
            { value: "10K+", label: "Candidature gestite" },
            { value: "98%", label: "Soddisfazione utenti" }
          ].map((stat, idx) => (
            <div key={idx} className="neon-card p-8 text-center space-y-3 hover:scale-105 transition-all duration-500 animate-fade-in group" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="text-5xl md:text-6xl font-black bg-gradient-to-br from-violet via-fuchsia to-neon-pink bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-base font-semibold text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Value Props */}
      <section className="container mx-auto px-4 sm:px-6 py-20 md:py-32 relative">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-violet to-fuchsia bg-clip-text text-transparent">Perché scegliere</span>
            <br />Recruit Base
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { icon: Zap, title: "Velocità 10×", description: "Gestisci candidature con swipe, aggiorna stati in 1 tap, pianifica colloqui istantaneamente", gradient: "from-violet to-fuchsia" },
            { icon: Brain, title: "AI che scrive per te", description: "Follow-up automatici, messaggi ottimizzati, insight su chi contattare per primo", gradient: "from-fuchsia to-neon-pink" },
            { icon: Heart, title: "Match su valori reali", description: "Algoritmo TRS™ che valuta relazioni autentiche, non solo competenze tecniche", gradient: "from-neon-pink to-violet" }
          ].map((prop, idx) => (
            <div key={idx} className="glass-card p-8 space-y-6 hover:scale-105 hover:shadow-2xl transition-all duration-500 group animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className={`w-16 h-16 bg-gradient-to-br ${prop.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                <prop.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">{prop.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-base">{prop.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 sm:px-6 py-20 md:py-32 bg-gradient-to-b from-violet/5 to-transparent">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight">
            Come <span className="bg-gradient-to-r from-violet to-fuchsia bg-clip-text text-transparent">funziona</span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {[
            { step: "01", title: "Crea il tuo account", desc: "Setup in 2 minuti, senza carta di credito", icon: Target },
            { step: "02", title: "Carica le candidature", desc: "Import automatico o manuale, AI che analizza i CV", icon: TrendingUp },
            { step: "03", title: "Match intelligenti", desc: "L'AI trova i candidati perfetti per le tue posizioni", icon: Award }
          ].map((step, idx) => (
            <div key={idx} className="neon-card p-8 flex items-center gap-8 hover:scale-[1.02] transition-all duration-500 animate-fade-in group" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-violet to-fuchsia rounded-2xl flex items-center justify-center font-black text-3xl text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                {step.step}
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-2xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground text-lg">{step.desc}</p>
              </div>
              <step.icon className="h-12 w-12 text-violet group-hover:scale-110 transition-transform duration-300" />
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center space-y-10 p-12 md:p-16 rounded-[3rem] relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-violet via-fuchsia to-neon-purple opacity-90" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black leading-tight text-white">
              Pronto a gestire candidature<br />in modo intelligente?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light">
              30 giorni gratis · Nessuna carta · Setup in 2 minuti
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-lg px-12 h-16 rounded-3xl shadow-2xl transition-all duration-300 font-bold group bg-white text-violet hover:scale-110"
            >
              Inizia ora gratis
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-violet/20 bg-gradient-to-b from-background to-violet/5 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet to-fuchsia rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">RB</span>
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-violet to-fuchsia bg-clip-text text-transparent">Recruit Base</span>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-foreground">Prodotto</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <button className="block hover:text-violet transition-colors">Funzionalità</button>
                <button className="block hover:text-violet transition-colors">Demo</button>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-foreground">Azienda</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <button className="block hover:text-violet transition-colors">Chi siamo</button>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-foreground">Legale</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <button className="block hover:text-violet transition-colors">Privacy</button>
                <button className="block hover:text-violet transition-colors">Termini</button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-violet/20 text-center">
            <p className="text-sm text-muted-foreground">© 2024 Recruit Base. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
