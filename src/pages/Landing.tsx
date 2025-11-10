import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Briefcase, 
  Users, 
  Target, 
  Zap, 
  Check, 
  ArrowRight,
  TrendingUp,
  MessageCircle,
  Heart
} from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Landing = () => {
  const [isHovered, setIsHovered] = useState<number | null>(null);

  const openStripeCheckout = () => {
    window.open("https://buy.stripe.com/7sYfZh2br4aUfNW24GabK00", "_blank");
  };

  const goToAuth = () => {
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Match AI & TRS™</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Recruit Base TRM
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              La piattaforma HR che unisce <span className="font-semibold text-foreground">Match Intelligenti</span>, 
              <span className="font-semibold text-foreground"> TRM avanzato</span> e 
              <span className="font-semibold text-foreground"> Messaggi Smart</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button 
                size="lg" 
                className="h-12 px-8 font-bold shadow-apple-md hover:shadow-apple-lg smooth-transition"
                onClick={openStripeCheckout}
              >
                Provalo gratis 30 giorni
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-12 px-8 font-semibold"
                onClick={goToAuth}
              >
                Accedi recruiter
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-success" />
                30 giorni gratis
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-success" />
                Cancella quando vuoi
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-success" />
                Solo 19€/mese dopo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Heart,
              title: "Match veloci",
              description: "Swipe tra candidati e trova il match perfetto in pochi secondi",
              color: "text-red-500"
            },
            {
              icon: Target,
              title: "TRM chiaro",
              description: "Monitora candidati, pipeline e TRS in un'unica dashboard",
              color: "text-blue-500"
            },
            {
              icon: MessageCircle,
              title: "Messaggi smart",
              description: "Chat dirette + AI Copilot per follow-up automatici",
              color: "text-green-500"
            }
          ].map((benefit, idx) => (
            <Card 
              key={idx}
              className="border-none shadow-apple-sm hover:shadow-apple-md smooth-transition hover:-translate-y-1"
              onMouseEnter={() => setIsHovered(idx)}
              onMouseLeave={() => setIsHovered(null)}
            >
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto">
                  <benefit.icon className={`h-7 w-7 ${benefit.color} smooth-transition ${isHovered === idx ? 'scale-110' : ''}`} />
                </div>
                <h3 className="font-bold text-lg">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Come funziona</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: "1", title: "Onboarding", desc: "Crea profilo in 2 minuti" },
              { step: "2", title: "Match", desc: "Swipe e trova candidati" },
              { step: "3", title: "Colloquio", desc: "Chat e pianifica meeting" }
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mx-auto">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Dicono di noi</h2>
          <div className="grid gap-4 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              { name: "Marco R.", role: "HR Manager", text: "Risparmio 5 ore a settimana grazie al TRM integrato" },
              { name: "Laura S.", role: "Recruiter", text: "Match più precisi e candidati di qualità superiore" },
              { name: "Paolo F.", role: "Talent Acquisition", text: "Il Copilot AI è un game changer per i follow-up" }
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-none shadow-apple-sm">
                <CardContent className="pt-6 space-y-3">
                  <p className="text-sm text-muted-foreground italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">FAQ</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>È davvero gratis per 30 giorni?</AccordionTrigger>
              <AccordionContent>
                Sì, nessuna carta richiesta. Dopo 30 giorni, solo 19€/mese. Cancella quando vuoi.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Cos'è il TRS™?</AccordionTrigger>
              <AccordionContent>
                Talent Relationship Score: il nostro algoritmo proprietario che misura la qualità delle relazioni con i candidati.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Funziona su mobile?</AccordionTrigger>
              <AccordionContent>
                Assolutamente sì! Interfaccia ottimizzata per smartphone e tablet.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Posso provarlo senza impegno?</AccordionTrigger>
              <AccordionContent>
                Sì, prova gratuita di 30 giorni. Nessun vincolo, cancelli quando vuoi.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Come funziona il Copilot AI?</AccordionTrigger>
              <AccordionContent>
                Suggerisce follow-up automatici, ottimizza messaggi e analizza profili candidati in tempo reale.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-12">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Pronto a iniziare?</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Unisciti a centinaia di recruiter che hanno già ottimizzato il loro workflow
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="h-12 px-8 font-bold"
              onClick={openStripeCheckout}
            >
              Provalo gratis 30 giorni
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="h-12 px-8 font-semibold bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              onClick={goToAuth}
            >
              Accedi ora
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Recruit Base TRM</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground smooth-transition">Termini</a>
              <a href="#" className="hover:text-foreground smooth-transition">Privacy</a>
              <a href="#" className="hover:text-foreground smooth-transition">Contatti</a>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 Recruit Base. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
