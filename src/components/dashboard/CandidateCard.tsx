import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, ExternalLink, Star, FileText } from "lucide-react";
import { ContactButtons } from "@/components/candidate/ContactButtons";
import { MeetingScheduler } from "@/components/mobile/MeetingScheduler";
import { supabase } from "@/integrations/supabase/client";

interface CandidateCardProps {
  candidate: any;
  currentUserId: string;
  onToggleFavorite: (candidateId: string) => void;
  isFavorite: boolean;
}

const CandidateCard = ({ candidate, currentUserId, onToggleFavorite, isFavorite }: CandidateCardProps) => {
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

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {candidate.cv_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const path = candidate.cv_url.includes("/cvs/")
                    ? candidate.cv_url.split("/cvs/")[1]
                    : candidate.cv_url;
                  const { data, error } = await supabase.storage.from("cvs").createSignedUrl(path, 60);
                  if (!error && data) window.open(data.signedUrl, "_blank");
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                CV
              </Button>
            )}
            {candidate.linkedin_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(candidate.linkedin_url, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                LinkedIn
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <ContactButtons
              currentUserId={currentUserId}
              targetUserId={candidate.id}
              phone={candidate.phone_number}
              name={candidate.full_name}
            />
            <MeetingScheduler
              candidateId={candidate.id}
              candidateName={candidate.full_name}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;
