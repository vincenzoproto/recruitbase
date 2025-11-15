import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Award } from "lucide-react";

interface Question {
  id: number;
  section: string;
  text: string;
  options: string[];
  correct: number; // index
}

const questions: Question[] = [
  // Sezione 1 – Etica, Integrità e Professionalità (6)
  { id: 1, section: "Etica, Integrità e Professionalità", text: "Un collega altera leggermente un dato per far apparire migliore un risultato, sostenendo che “non cambia la sostanza”. Cosa fai?", options: ["Ignori perché il dato è minimo","Lo segnali al responsabile solo se il progetto è importante","Parli con il collega e, se non corregge, lo segnali","Aspetti la revisione finale"], correct: 2 },
  { id: 2, section: "Etica, Integrità e Professionalità", text: "Quale tra questi è un segnale tipico di comportamento non etico?", options: ["Uso di metriche alternative inizialmente discusse","Mancata documentazione intenzionale su decisioni chiave","Revisione frequente dei processi","Richiesta di maggiore autonomia"], correct: 1 },
  { id: 3, section: "Etica, Integrità e Professionalità", text: "Qual è il principio etico più rilevante quando si gestiscono informazioni sensibili?", options: ["Convenienza","Trasparenza totale","Minimizzazione dei dati e riservatezza","Rapidità di condivisione"], correct: 2 },
  { id: 4, section: "Etica, Integrità e Professionalità", text: "L'etica professionale si basa principalmente su:", options: ["Regole aziendali","Percezioni personali della moralità","Principi universali di comportamento corretto","Norme non scritte del team"], correct: 2 },
  { id: 5, section: "Etica, Integrità e Professionalità", text: "Un comportamento “etico situazionale” indica:", options: ["Adattare l’etica al contesto","Compromessi legittimi","Giustificare condotte scorrette se utili","La capacità di valutare ogni caso"], correct: 0 },
  { id: 6, section: "Etica, Integrità e Professionalità", text: "La responsabilità etica nelle decisioni include:", options: ["Risultati + intenzioni + impatto sugli stakeholder","Solo i risultati","Solo il rispetto delle regole","Evitare rischi personali"], correct: 0 },
  // Sezione 2 – Decision Making Etico (5)
  { id: 7, section: "Decision Making Etico", text: "Quando due valori entrano in conflitto, la decisione migliore è quella che:", options: ["Minimizza il rischio personale","Massimizza il valore economico","Tiene in equilibrio equità, trasparenza e impatto","Segue la gerarchia aziendale"], correct: 2 },
  { id: 8, section: "Decision Making Etico", text: "Un decision making etico richiede come primo passo:", options: ["Valutare l’opinione del capo","Identificare gli stakeholder impattati","Considerare il tempo disponibile","Scegliere la soluzione più semplice"], correct: 1 },
  { id: 9, section: "Decision Making Etico", text: "Per evitare bias etici, la tecnica migliore è:", options: ["Agire rapidamente","Consultare persone con visioni diverse","Basarsi sull’intuito","Usare l’opzione più popolare"], correct: 1 },
  { id: 10, section: "Decision Making Etico", text: "Se una scelta porta benefici al team ma danneggia un cliente, cosa va fatto?", options: ["Scegliere ciò che avvantaggia l’azienda","Massimizzare il vantaggio interno","Cercare una soluzione che riduca il danno","Delegare la decisione"], correct: 2 },
  { id: 11, section: "Decision Making Etico", text: "Il principale errore nel giudizio etico è:", options: ["Essere troppo cauti","Ignorare le conseguenze non intenzionali","Consultare troppi esperti","Comunicare troppo presto"], correct: 1 },
  // Sezione 3 – Scenari Reali & Situazionali (5)
  { id: 12, section: "Scenari Reali & Situazionali", text: "Sei responsabile di selezionare un fornitore. Tra i candidati c'è l’azienda di un tuo amico stretto. Cosa fai?", options: ["Non dici nulla, ma valuti tutti in modo equo","Informi il tuo responsabile e ti astieni dalla decisione","Voti comunque per l’azienda migliore","Applichi criteri più severi al tuo amico"], correct: 1 },
  { id: 13, section: "Scenari Reali & Situazionali", text: "Il tuo capo ti chiede di presentare i risultati in modo “più positivo” per ottenere budget.", options: ["Accetti: non è una vera bugia","Accetti ma scrivi note private","Rifiuti e proponi una presentazione oggettiva con piani migliorativi","Rifiuti senza alternative"], correct: 2 },
  { id: 14, section: "Scenari Reali & Situazionali", text: "Ricevi un file con informazioni personali di clienti non autorizzate al tuo ruolo.", options: ["Usi comunque il file se utile","Lo segnali e chiedi la procedura corretta","Lo condividi col team","Lo cancelli senza dire nulla"], correct: 1 },
  { id: 15, section: "Scenari Reali & Situazionali", text: "In un processo di selezione un collega esclude una candidata per motivi non professionali.", options: ["Ignori","Documenti e segnali","Chiedi di riconsiderare poi lasci perdere","Cambi la valutazione senza dire nulla"], correct: 1 },
  { id: 16, section: "Scenari Reali & Situazionali", text: "La policy aziendale richiede una procedura che ritieni ingiusta verso i clienti.", options: ["Applichi senza dire nulla","Disobbedisci","Applichi e segnali formalmente per revisione","Cerchi un workaround non ufficiale"], correct: 2 },
  // Sezione 4 – Leadership Etica (4)
  { id: 17, section: "Leadership Etica", text: "La leadership etica richiede come base:", options: ["Autorità","Influenza","Visione + coerenza + responsabilità","Rigidità nelle regole"], correct: 2 },
  { id: 18, section: "Leadership Etica", text: "Il più grande rischio del leader etico è:", options: ["Essere troppo trasparente","Fallire nel dare l’esempio","Delegare troppo","Essere conforme alle policy"], correct: 1 },
  { id: 19, section: "Leadership Etica", text: "Per costruire fiducia etica nel team serve:", options: ["Evitare errori","Ammettere errori e imparare","Invocare la gerarchia","Proteggersi sempre"], correct: 1 },
  { id: 20, section: "Leadership Etica", text: "La credibilità etica si basa su:", options: ["Comunicazione","Coerenza tra parole e azioni","Popolarità","Risultati a breve termine"], correct: 1 },
];

function resultLevel(score: number) {
  if (score >= 90) return { label: "Ethical Excellence – Gold", color: "text-yellow-500" };
  if (score >= 75) return { label: "Ethical Professional – Silver", color: "text-gray-400" };
  if (score >= 60) return { label: "Ethical Foundation – Bronze", color: "text-orange-500" };
  return { label: "Ripetere test (materiali consigliati)", color: "text-destructive" };
}

export default function ELearning() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();
        setFullName(profile?.full_name || "");
      }
    })();
  }, []);

  const total = questions.length;
  const correct = useMemo(() =>
    Object.entries(answers).filter(([qid, ans]) => {
      const q = questions.find(q => q.id === Number(qid));
      return q && q.correct === Number(ans);
    }).length
  , [answers]);
  const score = Math.round((correct / total) * 100);
  const level = resultLevel(score);

  const handleSelect = (qid: number, idx: number) => {
    setAnswers(prev => ({ ...prev, [qid]: idx }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length !== total) return;
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownloadCertificate = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const html = `<!doctype html><html><head><meta charset='utf-8'><title>Certificato</title>
      <style>
        body{font-family: ui-sans-serif, system-ui; padding:40px;}
        .cert{border:6px solid #e5e7eb; padding:32px; border-radius:16px; max-width:800px; margin:0 auto; text-align:center}
        .logo{font-weight:800; font-size:20px; letter-spacing:.5px}
        .title{font-size:28px; font-weight:700; margin-top:8px}
        .name{font-size:24px; margin-top:8px}
        .badge{margin-top:12px}
        .muted{color:#6b7280}
      </style></head><body>
      <div class='cert'>
        <div class='logo'>Rebase</div>
        <div class='title'>Certificato di Completamento</div>
        <div class='name'>${fullName || "Partecipante"}</div>
        <p class='muted'>ha completato il TEST PROFESSIONALE DI ETICA & VALORI (Livello Avanzato)</p>
        <p>Punteggio: <strong>${score}%</strong> — Livello: <strong>${level.label}</strong></p>
        <div class='badge'>Firma: _____________________</div>
        <p class='muted' style='margin-top:24px'>Data: ${new Date().toLocaleDateString()}</p>
      </div>
      <script>window.print();</script>
    </body></html>`;
    w.document.write(html);
    w.document.close();
  };

  return (
    <MainLayout>
      <div className="container max-w-3xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">E-learning • Test Etica & Valori</h1>
                <p className="text-muted-foreground">Durata: 20–25 minuti • 20 domande</p>
              </div>
              {submitted && (
                <Badge variant="outline" className="font-semibold">{level.label}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {submitted && (
              <div className="space-y-3">
                <Progress value={score} />
                <p>Risposte corrette: <strong>{correct}/{total}</strong> • Punteggio: <strong>{score}%</strong></p>
                <div className="flex gap-2">
                  <Button onClick={handleDownloadCertificate}>Scarica certificato PDF</Button>
                  <Button variant="outline" onClick={() => { setSubmitted(false); setAnswers({}); }}>Rifai il test</Button>
                </div>
                <Separator />
              </div>
            )}

            {!submitted && (
              <>
                {questions.map((q, i) => (
                  <div key={q.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{i + 1}. {q.text}</h3>
                      <Badge variant="secondary" className="shrink-0">{q.section}</Badge>
                    </div>
                    <div className="grid gap-2">
                      {q.options.map((op, idx) => (
                        <label key={idx} className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${answers[q.id] === idx ? "bg-accent border-primary" : "hover:bg-accent"}`}>
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            checked={answers[q.id] === idx}
                            onChange={() => handleSelect(q.id, idx)}
                          />
                          <span>{op}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="pt-2">
                  <Button className="w-full" disabled={Object.keys(answers).length !== total} onClick={handleSubmit}>
                    Consegna Test
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Materiali consigliati</h2>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Libri:</strong> Ethics 101 (J. Maxwell), Blind Spots (M. Bazerman), Principles (R. Dalio), The Speed of Trust (S. Covey)</p>
            <p><strong>Corsi:</strong> Harvard – Ethical Leadership, MIT – Moral Decision Making, Coursera – Ethical Leadership in Business</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
