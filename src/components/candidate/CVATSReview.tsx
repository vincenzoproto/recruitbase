import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CVAnalysis {
  score: number;
  strengths: string[];
  improvements: string[];
  keywords: string[];
  atsCompatibility: "high" | "medium" | "low";
}

export const CVATSReview = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const analyzeCV = async (file: File) => {
    setIsAnalyzing(true);
    setFileName(file.name);

    try {
      // Upload to Supabase storage
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Simulate AI analysis (in production, call edge function)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockAnalysis: CVAnalysis = {
        score: 78,
        strengths: [
          "Esperienza lavorativa ben strutturata",
          "Competenze tecniche chiare",
          "Formazione ben presentata",
        ],
        improvements: [
          "Aggiungi più parole chiave specifiche per il settore",
          "Includi risultati quantificabili nelle esperienze",
          "Riduci l'uso di grafiche complesse per migliorare la lettura ATS",
        ],
        keywords: ["Project Management", "Team Leadership", "Agile", "JavaScript", "React"],
        atsCompatibility: "medium",
      };

      setAnalysis(mockAnalysis);
      toast.success("Analisi CV completata!");
    } catch (error) {
      console.error("Error analyzing CV:", error);
      toast.error("Errore nell'analisi del CV");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const cvFile = files.find((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));

    if (cvFile) {
      analyzeCV(cvFile);
    } else {
      toast.error("Carica solo file PDF");
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      analyzeCV(file);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getCompatibilityBadge = (compatibility: string) => {
    const config = {
      high: { label: "Alta", variant: "default" as const },
      medium: { label: "Media", variant: "secondary" as const },
      low: { label: "Bassa", variant: "destructive" as const },
    };
    return config[compatibility as keyof typeof config];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Revisione CV per ATS
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!analysis ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                Trascina qui il tuo CV
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                oppure clicca per selezionare un file PDF
              </p>
              <label htmlFor="cv-upload">
                <Button asChild disabled={isAnalyzing}>
                  <span>
                    {isAnalyzing ? "Analisi in corso..." : "Seleziona CV"}
                  </span>
                </Button>
              </label>
              <input
                id="cv-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileInput}
                disabled={isAnalyzing}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score Overview */}
              <div className="text-center space-y-2">
                <div className={`text-5xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}/100
                </div>
                <p className="text-sm text-muted-foreground">Punteggio ATS</p>
                <Progress value={analysis.score} className="h-2" />
              </div>

              {/* Compatibility Badge */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-medium">Compatibilità ATS:</span>
                <Badge variant={getCompatibilityBadge(analysis.atsCompatibility).variant}>
                  {getCompatibilityBadge(analysis.atsCompatibility).label}
                </Badge>
              </div>

              {/* Strengths */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Punti di forza
                </h4>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-success mt-1">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  Suggerimenti per migliorare
                </h4>
                <ul className="space-y-2">
                  {analysis.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-warning mt-1">→</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Keywords */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Parole chiave rilevate
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAnalysis(null);
                    setFileName("");
                  }}
                >
                  Analizza altro CV
                </Button>
                <Button>Ottimizza CV con AI</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
