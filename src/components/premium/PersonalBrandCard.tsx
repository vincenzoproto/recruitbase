import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, CheckCircle, Heart } from "lucide-react";
import TRSBadge from "@/components/trm/TRSBadge";
import { hapticFeedback } from "@/lib/haptics";
import { toast } from "@/hooks/use-toast";

interface PersonalBrandCardProps {
  profile: {
    full_name: string;
    job_title?: string;
    talent_relationship_score?: number;
    avatar_url?: string;
    id: string;
    core_values?: string[];
  };
}

export const PersonalBrandCard = ({ profile }: PersonalBrandCardProps) => {
  const [copied, setCopied] = useState(false);
  

  const profileUrl = `${window.location.origin}/profile/${profile.id}`;

  const handleCopyLink = async () => {
    await hapticFeedback.success();
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success("Link copiato!", {
      description: "Il link al tuo profilo è stato copiato negli appunti",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    await hapticFeedback.medium();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.full_name} - Recruit Base`,
          text: `Scopri il mio profilo su Recruit Base TRM`,
          url: profileUrl,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 via-background to-background">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Share2 className="h-5 w-5 text-primary" />
        Personal Brand Card™
      </h3>

      <div className="bg-card rounded-xl p-6 border-2 border-primary/20 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold">
            {profile.full_name.charAt(0)}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-lg">{profile.full_name}</h4>
            <p className="text-sm text-muted-foreground">
              {profile.job_title || 'Recruiter'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <span className="text-sm font-medium">TRS Score</span>
          <TRSBadge 
            score={profile.talent_relationship_score || 0} 
            size="md"
          />
        </div>

        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1">Link profilo</p>
          <p className="text-sm font-mono text-primary truncate">{profileUrl}</p>
        </div>

        {profile.core_values && profile.core_values.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground">I miei valori</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.core_values.map((value, index) => (
                <Badge key={index} variant="outline" className="text-xs border-primary/30">
                  {value}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="flex-1 gap-2"
          disabled={copied}
        >
          {copied ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Copiato!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copia link
            </>
          )}
        </Button>
        <Button
          onClick={handleShare}
          className="flex-1 gap-2"
        >
          <Share2 className="h-4 w-4" />
          Condividi
        </Button>
      </div>
    </Card>
  );
};
