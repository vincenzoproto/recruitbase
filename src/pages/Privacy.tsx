import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
          <h1 className="text-xl font-bold">Privacy Policy</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Informativa sulla Privacy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">1. Raccolta dei Dati</h2>
            <p>
              Pausilio raccoglie i seguenti dati personali per fornire i servizi della piattaforma:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nome completo, email e informazioni di contatto</li>
              <li>CV, competenze professionali e storico lavorativo</li>
              <li>Preferenze di lavoro e valori professionali</li>
              <li>Dati di utilizzo e interazioni sulla piattaforma</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. Utilizzo dei Dati</h2>
            <p>I tuoi dati vengono utilizzati per:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Facilitare il matching tra candidati e recruiter</li>
              <li>Migliorare l'esperienza utente e personalizzare i suggerimenti</li>
              <li>Fornire analisi e statistiche aggregate</li>
              <li>Comunicazioni relative al servizio</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. Condivisione dei Dati</h2>
            <p>
              I tuoi dati non vengono venduti a terze parti. Possono essere condivisi solo:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Con recruiter verificati quando ti candidi per un'offerta</li>
              <li>Con fornitori di servizi necessari per il funzionamento della piattaforma</li>
              <li>Quando richiesto dalla legge</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Sicurezza</h2>
            <p>
              Implementiamo misure di sicurezza tecniche e organizzative per proteggere i tuoi dati 
              da accessi non autorizzati, perdita o alterazione.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. I Tuoi Diritti</h2>
            <p>Hai il diritto di:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accedere ai tuoi dati personali</li>
              <li>Richiedere la correzione di dati inesatti</li>
              <li>Richiedere la cancellazione dei tuoi dati</li>
              <li>Opporti al trattamento dei tuoi dati</li>
              <li>Richiedere la portabilità dei dati</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Cookie</h2>
            <p>
              Utilizziamo cookie tecnici necessari per il funzionamento del sito e cookie analitici 
              per migliorare l'esperienza utente. Puoi gestire le preferenze sui cookie dalle 
              impostazioni del tuo browser.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">7. Contatti</h2>
            <p>
              Per esercitare i tuoi diritti o per domande sulla privacy, contattaci a:{" "}
              <a href="mailto:privacy@pausilio.com" className="text-primary hover:underline">
                privacy@pausilio.com
              </a>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Privacy;
