import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
          <h1 className="text-xl font-bold">Termini e Condizioni</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Termini e Condizioni d'Uso</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">1. Accettazione dei Termini</h2>
            <p>
              Accedendo e utilizzando Recruit Base, accetti di essere vincolato dai presenti Termini e Condizioni. 
              Se non accetti questi termini, ti preghiamo di non utilizzare la piattaforma.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. Descrizione del Servizio</h2>
            <p>
              Recruit Base è una piattaforma di recruiting che facilita l'incontro tra candidati e recruiter 
              attraverso tecnologie di matching basate su AI e gestione delle relazioni.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. Registrazione e Account</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Devi fornire informazioni accurate e complete durante la registrazione</li>
              <li>Sei responsabile della sicurezza del tuo account e password</li>
              <li>Devi avere almeno 18 anni per utilizzare la piattaforma</li>
              <li>Non puoi creare account multipli o condividere il tuo account</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Obblighi degli Utenti</h2>
            <p>Gli utenti si impegnano a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornire informazioni veritiere e aggiornate</li>
              <li>Non utilizzare la piattaforma per scopi illeciti o non autorizzati</li>
              <li>Rispettare i diritti di proprietà intellettuale</li>
              <li>Non inviare spam o contenuti inappropriati</li>
              <li>Mantenere un comportamento professionale nelle comunicazioni</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. Piano di Abbonamento</h2>
            <p>
              Recruit Base offre diversi piani di abbonamento (Free, Business, Enterprise). 
              I dettagli sui prezzi e le funzionalità sono disponibili sulla pagina dei prezzi.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Gli abbonamenti si rinnovano automaticamente</li>
              <li>Puoi cancellare in qualsiasi momento dalle impostazioni</li>
              <li>Non sono previsti rimborsi per periodi già pagati</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Proprietà Intellettuale</h2>
            <p>
              Tutti i contenuti, il software e i materiali presenti sulla piattaforma sono di proprietà 
              di Recruit Base o dei suoi licenziatari e sono protetti da copyright e altre leggi sulla 
              proprietà intellettuale.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">7. Contenuti Utente</h2>
            <p>
              Mantenendo la proprietà dei tuoi contenuti (CV, portfolio, post), concedi a Recruit Base 
              una licenza per utilizzarli al fine di fornire e migliorare i servizi.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">8. Limitazione di Responsabilità</h2>
            <p>
              Recruit Base non è responsabile per:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La qualità o l'idoneità dei candidati o delle offerte di lavoro</li>
              <li>Eventuali contratti o accordi tra recruiter e candidati</li>
              <li>Perdite derivanti dall'uso della piattaforma</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">9. Modifiche ai Termini</h2>
            <p>
              Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. 
              Le modifiche sostanziali verranno comunicate via email.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">10. Risoluzione</h2>
            <p>
              Possiamo sospendere o terminare il tuo accesso in caso di violazione dei termini 
              o per qualsiasi altro motivo legittimo.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">11. Contatti</h2>
            <p>
              Per domande sui termini di servizio, contattaci a:{" "}
              <a href="mailto:support@recruitbase.com" className="text-primary hover:underline">
                support@recruitbase.com
              </a>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Terms;
