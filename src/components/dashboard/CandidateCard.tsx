import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, ExternalLink, Star } from "lucide-react";

interface CandidateCardProps {
  candidate: any;
  onToggleFavorite: (candidateId: string) => void;
  isFavorite: boolean;
}

const CandidateCard = ({ candidate, onToggleFavorite, isFavorite }: CandidateCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{candidate.full_name}</CardTitle>
            {candidate.job_title && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                {candidate.job_title}
              </div>
            )}
          </div>
          <Button
            variant={isFavorite ? "default" : "outline"}
            size="icon"
            onClick={() => onToggleFavorite(candidate.id)}
          >
            <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {candidate.city && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {candidate.city}
          </div>
        )}

        {candidate.skills && candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {candidate.skills.map((skill: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        {candidate.bio && <p className="text-sm text-muted-foreground line-clamp-2">{candidate.bio}</p>}

        <div className="flex gap-2">
          {candidate.linkedin_url && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(candidate.linkedin_url, "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              LinkedIn
            </Button>
          )}
          <Button
            size="sm"
            className="flex-1"
            onClick={() => {
              const subject = encodeURIComponent(`Opportunità di lavoro - Recruit Base`);
              const body = encodeURIComponent(`Ciao ${candidate.full_name},\n\nSono interessato al tuo profilo su Recruit Base.\n\nCordiali saluti`);
              window.location.href = `mailto:?subject=${subject}&body=${body}`;
            }}
          >
            Contatta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;
