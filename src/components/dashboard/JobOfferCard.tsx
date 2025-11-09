import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";
import { CVCopilot } from "@/components/candidate/CVCopilot";

interface JobOfferCardProps {
  job: any;
  onUpdate?: () => void;
  onApply?: () => void;
  hasApplied?: boolean;
  isCandidate?: boolean;
}

const experienceLevelLabels: Record<string, string> = {
  entry: "Entry Level",
  junior: "Junior",
  mid: "Mid Level",
  senior: "Senior",
  lead: "Lead/Manager",
};

const JobOfferCard = ({ job, onApply, hasApplied, isCandidate }: JobOfferCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Card className="hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.city}
            </CardDescription>
          </div>
          {job.is_active && <Badge variant="default">Attiva</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {job.sector}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {experienceLevelLabels[job.experience_level] || job.experience_level}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>

        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Pubblicata il {formatDate(job.created_at)}
          </div>

          {isCandidate && onApply && (
            <div className="flex gap-2">
              <Button onClick={onApply} disabled={hasApplied} size="sm" className="flex-1">
                {hasApplied ? (
                  <>
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Candidato
                  </>
                ) : (
                  "Candidati Ora"
                )}
              </Button>
              <CVCopilot
                jobTitle={job.title}
                jobDescription={job.description}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobOfferCard;
