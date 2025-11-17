import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, User, CalendarDays, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { CandidateRanking } from "@/hooks/useCandidateRanking";

interface TopCandidateCardProps {
  ranking: CandidateRanking;
  onGenerateReasons?: (candidateId: string) => Promise<void>;
}

export const TopCandidateCard = ({ ranking, onGenerateReasons }: TopCandidateCardProps) => {
  const navigate = useNavigate();
  const { candidate, smart_match_score, match_reasons } = ranking;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 60) return "bg-blue-100 dark:bg-blue-900/20";
    if (score >= 40) return "bg-orange-100 dark:bg-orange-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  const handleGenerateReasons = async () => {
    if (onGenerateReasons) {
      await onGenerateReasons(candidate.id);
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        {/* Avatar */}
        <Avatar className="h-16 w-16">
          <AvatarImage src={candidate.avatar_url} alt={candidate.full_name} />
          <AvatarFallback>
            {candidate.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{candidate.full_name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {candidate.job_title || 'No job title'}
              </p>
            </div>

            {/* Score Badge */}
            <div className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg ${getScoreBgColor(smart_match_score)}`}>
              <span className={`text-2xl font-bold ${getScoreColor(smart_match_score)}`}>
                {smart_match_score}
              </span>
              <span className="text-xs text-muted-foreground">Match</span>
            </div>
          </div>

          {/* Location & Experience */}
          <div className="flex flex-wrap gap-2 mb-3">
            {candidate.city && (
              <Badge variant="secondary" className="text-xs">
                📍 {candidate.city}
              </Badge>
            )}
            {candidate.years_experience !== undefined && (
              <Badge variant="secondary" className="text-xs">
                💼 {candidate.years_experience} anni exp
              </Badge>
            )}
          </div>

          {/* Match Reasons */}
          {match_reasons && match_reasons.length > 0 ? (
            <div className="space-y-1 mb-3">
              <p className="text-xs font-medium text-muted-foreground">Perché è un buon fit:</p>
              {match_reasons.slice(0, 3).map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <p className="text-sm">{reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateReasons}
              className="mb-3"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Genera motivazioni AI
            </Button>
          )}

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {candidate.skills.slice(0, 4).map((skill, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{candidate.skills.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => navigate(`/profile/${candidate.id}`)}
            >
              <User className="h-4 w-4 mr-2" />
              Profilo
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/messages?userId=${candidate.id}`)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Messaggio
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // TODO: Implement meeting invitation
                navigate(`/calendar`);
              }}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Colloquio
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};