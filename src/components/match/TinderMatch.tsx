import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Trophy, Heart, Sparkles, Info } from "lucide-react";
import { toast } from "sonner";
import { useSwipe } from "@/hooks/use-swipe";
import { hapticFeedback } from "@/lib/haptics";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TRSBadge from "@/components/trm/TRSBadge";
import { Progress } from "@/components/ui/progress";
import { SmartFilters, FilterState } from "./SmartFilters";
import { MatchPopup } from "./MatchPopup";
import { CandidateProfileModal } from "./CandidateProfileModal";
import { DailyMatchSuggestion } from "./DailyMatchSuggestion";
import { calculateCultureFit, getCultureFitLevel } from "@/lib/culture-fit";

interface TinderMatchProps {
  userId: string;
  userRole: "candidate" | "recruiter";
}

export const TinderMatch = ({ userId, userRole }: TinderMatchProps) => {
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewedToday, setViewedToday] = useState(0);
  const [dailyGoal] = useState(20);
  const [filters, setFilters] = useState<FilterState>({});
  const [matchPopupOpen, setMatchPopupOpen] = useState(false);
  const [matchedCandidate, setMatchedCandidate] = useState<any>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [dailyMatch, setDailyMatch] = useState<any>(null);
  const [showDailyMatch, setShowDailyMatch] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'pass', message: string } | null>(null);
  const [skippedCount, setSkippedCount] = useState(0);
  const [recruiterValues, setRecruiterValues] = useState<string[]>([]);

  useEffect(() => {
    loadCards();
    loadDailyMatch();
    loadViewedCount();
    loadRecruiterValues();
  }, [userId, userRole, filters]);

  const loadRecruiterValues = async () => {
    if (userRole !== 'recruiter') return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('core_values')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setRecruiterValues(data?.core_values || []);
    } catch (error) {
      console.error("Error loading recruiter values:", error);
    }
  };

  const loadViewedCount = () => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`viewed_${today}`);
    setViewedToday(stored ? parseInt(stored) : 0);
  };

  const incrementViewedCount = () => {
    const today = new Date().toDateString();
    const newCount = viewedToday + 1;
    setViewedToday(newCount);
    localStorage.setItem(`viewed_${today}`, newCount.toString());
  };

  const loadDailyMatch = async () => {
    if (userRole !== "recruiter") return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "candidate")
        .order("talent_relationship_score", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setDailyMatch(data);
    } catch (error) {
      console.error("Error loading daily match:", error);
    }
  };

  const loadCards = async () => {
    setLoading(true);
    try {
      if (userRole === "candidate") {
        let query = supabase
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
          .eq("is_active", true);

        if (filters.city) {
          query = query.ilike("city", `%${filters.city}%`);
        }
        if (filters.sector) {
          query = query.ilike("sector", `%${filters.sector}%`);
        }

        const { data: jobs, error } = await query.limit(20);
        if (error) throw error;
        
        const { data: existingMatches } = await supabase
          .from("matches")
          .select("job_offer_id")
          .eq("candidate_id", userId);
        
        const matchedIds = new Set(existingMatches?.map(m => m.job_offer_id) || []);
        const filtered = jobs?.filter(j => !matchedIds.has(j.id)) || [];
        
        setQueue(filtered);
        setCurrentCard(filtered[0]);
      } else {
        let query = supabase
          .from("profiles")
          .select("*")
          .eq("role", "candidate");

        if (filters.city) {
          query = query.ilike("city", `%${filters.city}%`);
        }
        if (filters.minTRS && filters.minTRS > 0) {
          query = query.gte("talent_relationship_score", filters.minTRS);
        }

        const { data: candidates, error } = await query.limit(20);
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
    
    setFeedbackMessage({ type: 'success', message: 'Match trovato!' });
    setTimeout(() => setFeedbackMessage(null), 1500);
    
    try {
      if (userRole === "candidate" && currentCard) {
        const { error } = await supabase
          .from("matches")
          .insert({
            candidate_id: userId,
            job_offer_id: currentCard.id,
            match_score: 85
          });

        if (error) throw error;
        
        setMatchedCandidate(currentCard);
        setMatchPopupOpen(true);
      } else if (userRole === "recruiter" && currentCard) {
        // Salva il match del recruiter
        await supabase
          .from("favorites")
          .insert({
            recruiter_id: userId,
            candidate_id: currentCard.id
          });
        
        setMatchedCandidate(currentCard);
        setMatchPopupOpen(true);
      }
      
      incrementViewedCount();
      setSkippedCount(0);
      nextCard();
    } catch (error) {
      console.error("Error creating match:", error);
      toast.error("Errore nel creare il match");
    }
  };

  const handleSkip = async () => {
    await hapticFeedback.light();
    
    setFeedbackMessage({ type: 'pass', message: 'Passato' });
    setTimeout(() => setFeedbackMessage(null), 1000);
    
    incrementViewedCount();
    setSkippedCount(prev => prev + 1);
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

  const cultureFitScore = userRole === 'recruiter' && currentCard?.core_values
    ? calculateCultureFit(recruiterValues, currentCard.core_values)
    : null;
  
  const cultureFitLevel = cultureFitScore !== null ? getCultureFitLevel(cultureFitScore) : null;

  if (loading) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-80 bg-muted rounded-2xl" />
            <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentCard) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-12 text-center space-y-4">
          <Trophy className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-xl font-bold mb-2">Ottimo lavoro!</h3>
            <p className="text-muted-foreground">
              {userRole === "candidate" 
                ? "Hai visto tutte le offerte disponibili"
                : "Hai visto tutti i candidati disponibili"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Hai visualizzato {viewedToday} profili oggi
            </p>
          </div>
          <Button onClick={loadCards} className="mt-4">
            Ricarica
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <MatchPopup
        open={matchPopupOpen}
        onOpenChange={setMatchPopupOpen}
        candidateName={matchedCandidate?.full_name || matchedCandidate?.title || ""}
        candidateAvatar={matchedCandidate?.avatar_url}
        onOpenChat={() => {
          setMatchPopupOpen(false);
          toast.success("Chat aperta!");
        }}
      />

      <CandidateProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        candidate={selectedProfile}
        recruiterValues={recruiterValues}
      />

      <div className="max-w-md mx-auto space-y-4">
        {/* Daily Match Suggestion - solo per recruiter */}
        {userRole === "recruiter" && showDailyMatch && dailyMatch && (
          <DailyMatchSuggestion
            candidate={dailyMatch}
            onView={() => {
              setSelectedProfile(dailyMatch);
              setProfileModalOpen(true);
            }}
            onDismiss={() => setShowDailyMatch(false)}
          />
        )}

        {/* Header con filtri */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Recruit Match™
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Trova il match perfetto
            </p>
          </div>
          <SmartFilters onFiltersChange={setFilters} />
        </div>

        {/* Progress bar */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Oggi</span>
              <span className="text-sm text-muted-foreground">
                {viewedToday}/{dailyGoal} visualizzati
              </span>
            </div>
            <Progress value={(viewedToday / dailyGoal) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* AI Suggestion - mostra dopo 5+ skip consecutivi */}
        {skippedCount >= 5 && (
          <Card className="bg-gradient-to-r from-accent to-accent/50 border-primary/30 animate-slide-up">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-2">💡 Suggerimento AI</p>
              <p className="text-sm text-muted-foreground mb-3">
                Noto che hai saltato diversi profili. Vuoi esplorare candidati con competenze diverse?
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setFilters({});
                  setSkippedCount(0);
                  toast.success("Mostrando nuovi profili");
                }}
              >
                Mostra Suggeriti
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Feedback Message */}
        {feedbackMessage && (
          <div 
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full animate-slide-up ${
              feedbackMessage.type === 'success' 
                ? 'bg-success text-white' 
                : 'bg-secondary text-foreground'
            }`}
          >
            {feedbackMessage.message}
          </div>
        )}

        {/* Main Card */}
        <div className="relative">
          <Card 
            {...swipeHandlers}
            className="overflow-hidden touch-none cursor-grab active:cursor-grabbing transition-all duration-300 hover:shadow-strong relative"
            style={{ touchAction: 'none' }}
          >
            <div 
              className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-10 pointer-events-none"
            />

            {/* Avatar/Image Section */}
            <div className="relative h-96 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary overflow-hidden">
              {userRole === "recruiter" && currentCard ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Avatar className="h-48 w-48 border-8 border-white/20 shadow-strong">
                    <AvatarImage src={currentCard.avatar_url} />
                    <AvatarFallback className="text-6xl bg-gradient-to-br from-primary to-primary/70 text-white">
                      {currentCard.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-9xl opacity-20">💼</div>
                </div>
              )}

              {/* Card counter badge */}
              <Badge className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm z-20 shadow-medium">
                {queue.length} rimasti
              </Badge>

              {/* Info button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 left-4 z-20 bg-background/95 backdrop-blur-sm hover:bg-background"
                onClick={() => {
                  setSelectedProfile(currentCard);
                  setProfileModalOpen(true);
                }}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>

            {/* Content overlay */}
            <CardContent className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
              {userRole === "candidate" ? (
                <>
                  <h3 className="text-3xl font-bold mb-2">{currentCard.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-5 w-5" />
                    <span className="text-lg">{currentCard.city}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-white/20 backdrop-blur-sm border-white/30">
                      {currentCard.sector}
                    </Badge>
                    <Badge variant="outline" className="border-white/30 text-white">
                      {currentCard.experience_level}
                    </Badge>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-3xl font-bold">{currentCard.full_name}</h3>
                      {currentCard.job_title && (
                        <p className="text-lg text-white/90 mt-1">
                          {currentCard.job_title}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{currentCard.city || "Non specificata"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TRSBadge score={currentCard.talent_relationship_score || 0} size="sm" />
                    </div>
                  </div>

                  {cultureFitScore !== null && cultureFitLevel && (
                    <div className={`flex items-center gap-2 backdrop-blur-sm rounded-full px-4 py-2 w-fit ${cultureFitLevel.bgColor} border border-white/20`}>
                      <Sparkles className={`h-4 w-4 ${cultureFitLevel.textColor}`} />
                      <span className={`text-sm font-medium ${cultureFitLevel.textColor}`}>
                        Culture Fit: {cultureFitScore}%
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-6 justify-center items-center">
          <Button
            size="lg"
            variant="outline"
            onClick={handleSkip}
            className="h-20 w-20 rounded-full border-2 hover:border-destructive hover:bg-destructive/10 transition-all shadow-medium hover:shadow-strong"
          >
            <X className="h-10 w-10 text-destructive" />
          </Button>
          
          <Button
            size="lg"
            onClick={handleMatch}
            className="h-24 w-24 rounded-full bg-gradient-to-r from-success to-success/80 hover:shadow-glow-green transition-all shadow-medium hover:scale-110"
          >
            <Heart className="h-12 w-12 fill-white text-white" />
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          👈 Swipe per saltare · Swipe per match 👉
        </p>
      </div>
    </>
  );
};
