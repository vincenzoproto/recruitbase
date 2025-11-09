import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Building, ExternalLink } from "lucide-react";
import { ContactButtons } from "@/components/candidate/ContactButtons";

interface RecruiterCardProps {
  recruiter: any;
  currentUserId: string;
}

const RecruiterCard = ({ recruiter, currentUserId }: RecruiterCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{recruiter.full_name}</CardTitle>
            {recruiter.job_title && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                {recruiter.job_title}
              </div>
            )}
          </div>
          {recruiter.is_premium && (
            <Badge variant="default" className="ml-2">Premium</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recruiter.city && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {recruiter.city}
          </div>
        )}

        {recruiter.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">{recruiter.bio}</p>
        )}

        <div className="space-y-2">
          {recruiter.linkedin_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(recruiter.linkedin_url, "_blank")}
              className="w-full"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Vedi profilo LinkedIn
            </Button>
          )}

          <ContactButtons
            currentUserId={currentUserId}
            targetUserId={recruiter.id}
            phone={recruiter.phone_number}
            name={recruiter.full_name}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default RecruiterCard;
