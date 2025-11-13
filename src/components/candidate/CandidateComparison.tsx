import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, GitCompare, TrendingUp, MapPin, Briefcase } from "lucide-react";
import { hapticFeedback } from "@/lib/haptics";

interface Candidate {
  id: string;
  full_name: string;
  avatar_url?: string;
  job_title?: string;
  city?: string;
  talent_relationship_score: number;
  skills?: string[];
  core_values?: string[];
  years_experience?: number;
}

interface CandidateComparisonProps {
  candidates: Candidate[];
  maxSelection?: number;
}

export const CandidateComparison = ({ 
  candidates, 
  maxSelection = 3 
}: CandidateComparisonProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const toggleSelect = (id: string) => {
    hapticFeedback.light();
    setSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(cId => cId !== id);
      }
      if (prev.length >= maxSelection) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    if (selected.length < 2) return;
    hapticFeedback.medium();
    setOpen(true);
  };

  const selectedCandidates = candidates.filter(c => selected.includes(c.id));

  return (
    <>
      {/* Selection UI */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            <span className="font-semibold">
              Seleziona candidati da comparare ({selected.length}/{maxSelection})
            </span>
          </div>
          {selected.length >= 2 && (
            <Button onClick={handleCompare} size="sm" className="gap-2">
              <GitCompare className="h-4 w-4" />
              Confronta
            </Button>
          )}
        </div>

        <div className="grid gap-2">
          {candidates.slice(0, 10).map((candidate) => (
            <label
              key={candidate.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent smooth-transition cursor-pointer"
            >
              <Checkbox
                checked={selected.includes(candidate.id)}
                onCheckedChange={() => toggleSelect(candidate.id)}
                disabled={!selected.includes(candidate.id) && selected.length >= maxSelection}
              />
              <Avatar className="h-10 w-10">
                <AvatarImage src={candidate.avatar_url} />
                <AvatarFallback>{candidate.full_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{candidate.full_name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {candidate.job_title || "Candidato"} • {candidate.city || "N/A"}
                </p>
              </div>
              <Badge variant="outline">TRS {candidate.talent_relationship_score}</Badge>
            </label>
          ))}
        </div>
      </div>

      {/* Comparison Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Confronto Candidati
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="border border-border rounded-lg p-4 space-y-4"
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={candidate.avatar_url} />
                    <AvatarFallback>{candidate.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{candidate.full_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {candidate.job_title || "Candidato"}
                    </p>
                  </div>
                </div>

                {/* TRS Score */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      TRS Score
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {candidate.talent_relationship_score}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary smooth-transition"
                      style={{ width: `${candidate.talent_relationship_score}%` }}
                    />
                  </div>
                </div>

                {/* Location & Experience */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{candidate.city || "Non specificata"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{candidate.years_experience || 0} anni esperienza</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <h5 className="text-sm font-semibold">Competenze</h5>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills && candidate.skills.length > 0 ? (
                      candidate.skills.slice(0, 5).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Nessuna competenza inserita
                      </span>
                    )}
                  </div>
                </div>

                {/* Core Values */}
                <div className="space-y-2">
                  <h5 className="text-sm font-semibold">Valori</h5>
                  <div className="flex flex-wrap gap-1">
                    {candidate.core_values && candidate.core_values.length > 0 ? (
                      candidate.core_values.slice(0, 3).map((value, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {value}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Nessun valore inserito
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
