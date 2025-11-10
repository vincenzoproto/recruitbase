import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, X } from "lucide-react";
import TRSBadge from "@/components/trm/TRSBadge";

interface DailyMatchSuggestionProps {
  candidate: any;
  onView: () => void;
  onDismiss: () => void;
}

export const DailyMatchSuggestion = ({ candidate, onView, onDismiss }: DailyMatchSuggestionProps) => {
  const [visible, setVisible] = useState(true);

  if (!visible || !candidate) return null;

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30 animate-slide-up mb-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-bounce-soft" />
            <h3 className="font-bold text-lg">Match del Giorno</h3>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => {
              setVisible(false);
              onDismiss();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/30">
            <AvatarImage src={candidate.avatar_url} />
            <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-primary/70 text-white">
              {candidate.full_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h4 className="font-bold text-lg">{candidate.full_name}</h4>
            {candidate.job_title && (
              <p className="text-sm text-muted-foreground">{candidate.job_title}</p>
            )}
            <div className="mt-2">
              <TRSBadge score={candidate.talent_relationship_score || 0} size="sm" />
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4 mb-4">
          Oggi potresti voler conoscere {candidate.full_name.split(' ')[0]} - un profilo che corrisponde ai tuoi criteri di ricerca! 🔥
        </p>

        <Button 
          onClick={onView}
          className="w-full bg-gradient-to-r from-primary to-primary/80"
        >
          Visualizza Profilo
        </Button>
      </CardContent>
    </Card>
  );
};
