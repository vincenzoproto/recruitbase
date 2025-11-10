import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const ScoreInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Indietro
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold">Come Funzionano i Punteggi</h1>
          <p className="text-muted-foreground">
            Scopri come calcoliamo TRS e Culture Fit per aiutarti a trovare i match perfetti
          </p>
        </div>

        {/* TRS Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">TRS (Talent Relationship Score™)</CardTitle>
                <CardDescription>Punteggio di Relazione con i Talenti • 0-100</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-foreground leading-relaxed">
                Il TRS misura la qualità della relazione tra recruiter e candidato su una scala da 0 a 100.
                Un punteggio più alto indica un engagement migliore e relazioni più forti.
              </p>
            </div>

            <div className="bg-accent/50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Fattori di Calcolo:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Frequenza contatti:</strong> Numero e regolarità delle interazioni</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Tempo di risposta:</strong> Velocità nelle comunicazioni</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Interazioni positive:</strong> Like, risposte, follow-up completati</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Completezza profilo:</strong> Informazioni aggiornate e dettagliate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Note e tag:</strong> Personalizzazione della relazione</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Livelli di Score:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Progress value={90} className="flex-1 h-2" />
                  <span className="text-sm font-medium text-success w-24">80-100: Alto</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={65} className="flex-1 h-2" />
                  <span className="text-sm font-medium text-warning w-24">50-79: Medio</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={30} className="flex-1 h-2" />
                  <span className="text-sm font-medium text-destructive w-24">0-49: Basso</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm text-primary font-medium">
                💡 Consiglio: Mantieni contatti regolari e personalizzati per aumentare il TRS
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Culture Fit Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Culture Fit Score</CardTitle>
                <CardDescription>Affinità Culturale • 0-100%</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-foreground leading-relaxed">
                Il Culture Fit Score misura l'affinità culturale tra recruiter e candidato confrontando
                i valori aziendali/personali selezionati da entrambi.
              </p>
            </div>

            <div className="bg-accent/50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Formula di Calcolo:</h4>
              <div className="bg-background rounded p-3 font-mono text-sm">
                (Valori in comune ÷ Totale valori recruiter) × 100
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Esempio:</strong> Se un recruiter ha 5 valori e un candidato ne condivide 4,
                il Culture Fit sarà: (4 ÷ 5) × 100 = <strong className="text-success">80%</strong>
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Livelli di Affinità:</h4>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-success">Alta affinità</span>
                    <span className="text-sm text-success font-bold">&gt; 75%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Eccellente compatibilità culturale, valori molto allineati
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-warning">Media affinità</span>
                    <span className="text-sm text-warning font-bold">50-75%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Buona compatibilità, alcuni valori in comune
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-destructive">Bassa affinità</span>
                    <span className="text-sm text-destructive font-bold">&lt; 50%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pochi valori condivisi, potrebbe richiedere più attenzione
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm text-primary font-medium">
                💡 Consiglio: Seleziona i 5 valori che meglio rappresentano te o la tua azienda
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-muted-foreground">
              I punteggi vengono aggiornati automaticamente in base alle tue interazioni e preferenze.
              <br />
              Mantieni il tuo profilo aggiornato per risultati più accurati.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ScoreInfo;
