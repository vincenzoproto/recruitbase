import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, MessageCircle, Mail, Phone, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const handleSendMessage = () => {
    if (!contactMessage.trim()) {
      toast.error("Errore", {
        description: "Inserisci un messaggio prima di inviare.",
      });
      return;
    }

    toast.success("Messaggio inviato", {
      description: "Ti risponderemo il prima possibile.",
    });
    setContactMessage("");
  };

  const faqItems = [
    {
      question: "Come posso modificare il mio profilo?",
      answer: "Vai nel menu hamburger, seleziona 'Profilo personale' e clicca su 'Modifica profilo'. Potrai aggiornare tutte le tue informazioni personali, caricare il CV e modificare le tue competenze."
    },
    {
      question: "Come funziona il sistema di punti XP?",
      answer: "Guadagni punti XP interagendo con l'app: pubblicando post (+5 XP), mettendo like (+1 XP), condividendo contenuti (+10 XP) e commentando (+3 XP). Accumulando XP puoi salire di livello e sbloccare badge."
    },
    {
      question: "Come posso candidarmi a un'offerta di lavoro?",
      answer: "Vai nella sezione 'Offerte' o 'Job Match', trova un'offerta che ti interessa e clicca su 'Candidati'. Assicurati di aver caricato il tuo CV nel profilo prima di candidarti."
    },
    {
      question: "Cosa sono i badge e come si ottengono?",
      answer: "I badge sono riconoscimenti che ottieni raggiungendo determinati traguardi nell'app. Puoi sbloccare badge Bronze, Silver, Gold e Platinum in base al tuo livello di attività e coinvolgimento."
    },
    {
      question: "Come posso contattare un recruiter?",
      answer: "Vai nella sezione 'Messaggi', cerca il recruiter che vuoi contattare e avvia una conversazione. Puoi anche rispondere direttamente alle offerte di lavoro per entrare in contatto."
    },
    {
      question: "Come funziona il feed sociale?",
      answer: "Il feed sociale è dove puoi vedere e condividere contenuti professionali, fare networking, e rimanere aggiornato sulle novità del settore. Interagisci con i post per guadagnare XP!"
    }
  ];

  return (
    <MainLayout>
      <div className="container max-w-4xl py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Centro Assistenza</h1>

        {/* Ricerca */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Cerca aiuto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Domande Frequenti
            </CardTitle>
            <CardDescription>
              Le risposte alle domande più comuni
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems
                .filter(item => 
                  searchQuery === "" || 
                  item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.answer.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contattaci */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Contattaci
            </CardTitle>
            <CardDescription>
              Non hai trovato quello che cercavi? Scrivici!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Descrivi il tuo problema o la tua domanda..."
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              rows={5}
            />
            <Button onClick={handleSendMessage} className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Invia messaggio
            </Button>
          </CardContent>
        </Card>

        {/* Altri contatti */}
        <Card>
          <CardHeader>
            <CardTitle>Altri modi per contattarci</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Mail className="w-4 h-4 mr-2" />
              support@recruitbase.com
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Phone className="w-4 h-4 mr-2" />
              +39 02 1234 5678
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Help;
