import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Trophy, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useSwipe } from "@/hooks/use-swipe";
import { hapticFeedback } from "@/lib/haptics";

interface TinderMatchProps {
  userId: string;
  userRole: "candidate" | "recruiter";
}

export const TinderMatch = ({ userId, userRole }: TinderMatchProps) => {
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, [userId, userRole]);

  const loadCards = async () => {
    setLoading(true);
    try {
      if (userRole === "candidate") {
        // Load job offers
        const { data: jobs, error } = await supabase
          .from("job_offers")
          .select(`
            *,
            profiles:recruiter_id (
              id,
              full_name,
              avatar_url,
              job_title
            )
          `)
          .eq("is_active", true)
          .limit(20);

        if (error) throw error;
        
        // Filter out already matched
        const { data: existingMatches } = await supabase
          .from("matches")
          .select("job_offer_id")
          .eq("candidate_id", userId);
        
        const matchedIds = new Set(existingMatches?.map(m => m.job_offer_id) || []);
        const filtered = jobs?.filter(j => !matchedIds.has(j.id)) || [];
        
        setQueue(filtered);
        setCurrentCard(filtered[0]);
      } else {
        // Load candidates for recruiter
        const { data: candidates, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "candidate")
          .limit(20);

        if (error) throw error;
        setQueue(candidates || []);
        setCurrentCard(candidates?.[0]);
      }
    } catch (error) {
      console.error("Error loading cards:", error);
      toast.error("Errore nel caricamento");
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async () => {
    await hapticFeedback.success();
    
    try {
      if (userRole === "candidate" && currentCard) {
        // Create match for candidate
        const { error } = await supabase
          .from("matches")
          .insert({
            candidate_id: userId,
            job_offer_id: currentCard.id,
            match_score: 85 // Default high score for manual match
          });

        if (error) throw error;
        toast.success("Match creato! 💼");
      }
      
      nextCard();
    } catch (error) {
      console.error("Error creating match:", error);
      toast.error("Errore nel creare il match");
    }
  };

  const handleSkip = async () => {
    await hapticFeedback.light();
    nextCard();
  };

  const nextCard = () => {
    const newQueue = queue.slice(1);
    setQueue(newQueue);
    setCurrentCard(newQueue[0] || null);
  };

  const swipeHandlers = useSwipe({
    onSwipedRight: handleMatch,
    onSwipedLeft: handleSkip,
    minSwipeDistance: 100
  });

  // Stop propagation to prevent page swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    swipeHandlers.onTouchStart(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    swipeHandlers.onTouchMove(e);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    swipeHandlers.onTouchEnd();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded-lg" />
            <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentCard) {
    return (
      <Card>
        <CardContent className="p-12 text-center space-y-4">
          <Trophy className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-xl font-bold mb-2">Nessuna card disponibile</h3>
            <p className="text-muted-foreground">
              {userRole === "candidate" 
                ? "Hai visto tutte le offerte disponibili!"
                : "Hai visto tutti i candidati disponibili!"}
            </p>
          </div>
          <Button onClick={loadCards}>Ricarica</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold mb-1">Trova il Match Perfetto</h3>
        <p className="text-sm text-muted-foreground">
          👈 Swipe a sinistra per saltare · Swipe a destra per match 👉
        </p>
      </div>

      <Card 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="overflow-hidden touch-none cursor-grab active:cursor-grabbing transition-transform hover:scale-[1.02]"
      >
        <CardContent className="p-0">
          {/* Image/Header */}
          <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
            {userRole === "candidate" ? (
              <Sparkles className="h-20 w-20 text-primary/40" />
            ) : (
              <div className="text-6xl">👤</div>
            )}
            <Badge className="absolute top-4 right-4 bg-background/90">
              {queue.length} card
            </Badge>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {userRole === "candidate" ? (
              // Job Offer Card
              <>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{currentCard.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    {currentCard.city}
                  </div>
                  <Badge variant="secondary">{currentCard.sector}</Badge>
                  <Badge variant="outline" className="ml-2">
                    {currentCard.experience_level}
                  </Badge>
                </div>

                {currentCard.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {currentCard.description}
                  </p>
                )}

                {currentCard.profiles && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Pubblicata da:</p>
                    <p className="font-medium">{currentCard.profiles.full_name}</p>
                    {currentCard.profiles.job_title && (
                      <p className="text-sm text-muted-foreground">
                        {currentCard.profiles.job_title}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              // Candidate Card
              <>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{currentCard.full_name}</h3>
                  {currentCard.job_title && (
                    <p className="text-lg text-muted-foreground mb-2">
                      {currentCard.job_title}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    {currentCard.city || "Città non specificata"}
                  </div>
                </div>

                {currentCard.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {currentCard.bio}
                  </p>
                )}

                {currentCard.skills && currentCard.skills.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Competenze:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentCard.skills.slice(0, 5).map((skill: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          size="lg"
          variant="outline"
          onClick={handleSkip}
          className="w-24 h-24 rounded-full"
        >
          <X className="h-10 w-10 text-destructive" />
        </Button>
        <Button
          size="lg"
          onClick={handleMatch}
          className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-primary/80"
        >
          <Heart className="h-10 w-10 fill-current" />
        </Button>
      </div>
    </div>
  );
};
