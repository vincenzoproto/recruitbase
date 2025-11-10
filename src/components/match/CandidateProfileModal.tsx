import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Award, Calendar } from "lucide-react";
import TRSBadge from "@/components/trm/TRSBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface CandidateProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: any;
}

export const CandidateProfileModal = ({ open, onOpenChange, candidate }: CandidateProfileModalProps) => {
  if (!candidate) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="sr-only">
          <SheetTitle>Profilo Candidato</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-full pb-6">
          <div className="space-y-6">
            {/* Header con Avatar */}
            <div className="text-center pt-4">
              <Avatar className="h-32 w-32 mx-auto border-4 border-primary/20">
                <AvatarImage src={candidate.avatar_url} />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-primary/70 text-white">
                  {candidate.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-3xl font-bold mt-4">{candidate.full_name}</h2>
              {candidate.job_title && (
                <p className="text-lg text-muted-foreground mt-1">{candidate.job_title}</p>
              )}
              
              <div className="flex items-center justify-center gap-2 mt-3 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{candidate.city || "Località non specificata"}</span>
              </div>

              <div className="flex justify-center mt-4">
                <TRSBadge score={candidate.talent_relationship_score || 0} size="lg" />
              </div>
            </div>

            <Separator />

            {/* Bio */}
            {candidate.bio && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">BIO</h3>
                <p className="text-foreground leading-relaxed">{candidate.bio}</p>
              </div>
            )}

            {/* Competenze */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  COMPETENZE
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Disponibilità */}
            {candidate.availability && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  DISPONIBILITÀ
                </h3>
                <p className="text-foreground">{candidate.availability}</p>
              </div>
            )}

            {/* Esperienza (placeholder per futuri dati) */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                ESPERIENZA
              </h3>
              <div className="space-y-3">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    Informazioni sull'esperienza lavorativa del candidato disponibili a breve
                  </p>
                </div>
              </div>
            </div>

            {/* Valori culturali (placeholder) */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                VALORI CULTURALI
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Teamwork</Badge>
                <Badge variant="outline">Innovation</Badge>
                <Badge variant="outline">Growth Mindset</Badge>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
