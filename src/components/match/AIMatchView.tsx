import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  MapPin, 
  Briefcase, 
  TrendingUp, 
  MessageCircle, 
  User, 
  Star,
  CheckCircle,
  Clock,
  DollarSign,
  Languages,
  Search,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getInitials } from "@/lib/utils/profileHelper";

interface Match {
  candidate_id: string;
  full_name: string;
  job_title: string;
  seniority_level: string;
  match_score: number;
  pipeline_stage_id: string | null;
  avatar_url: string | null;
  city: string | null;
  years_experience: number | null;
  skills: string[] | null;
  availability_days: number | null;
  salary_min: number | null;
  salary_max: number | null;
  talent_relationship_score: number | null;
}

interface AIMatchViewProps {
  jobOfferId: string;
  onClose?: () => void;
}

export const AIMatchView = ({ jobOfferId, onClose }: AIMatchViewProps) => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [jobOffer, setJobOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterScore, setFilterScore] = useState("all");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("score");

  useEffect(() => {
    loadJobAndMatches();
  }, [jobOfferId]);

  useEffect(() => {
    applyFilters();
  }, [matches, filterScore, filterAvailability, searchQuery, sortBy]);

  const loadJobAndMatches = async () => {
    try {
      setLoading(true);

      // Load job offer
      const { data: job, error: jobError } = await supabase
        .from("job_offers")
        .select("*")
        .eq("id", jobOfferId)
        .single();

      if (jobError) throw jobError;
      setJobOffer(job);

      // Calculate matches for all candidates
      await recalculateMatches();

      // Load matches
      const { data: matchesData, error: matchesError } = await supabase
        .rpc("get_matches_for_job", { 
          p_job_offer_id: jobOfferId,
          p_min_completion: 40
        });

      if (matchesError) throw matchesError;
      setMatches(matchesData || []);
    } catch (error) {
      console.error("Error loading matches:", error);
      toast.error("Errore nel caricamento dei match");
    } finally {
      setLoading(false);
    }
  };

  const recalculateMatches = async () => {
    try {
      // Get all candidates with profile completion >= 40%
      const { data: candidates } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "candidate")
        .gte("profile_completion_percentage", 40);

      if (candidates) {
        // Calculate match score for each candidate
        for (const candidate of candidates) {
          await supabase.rpc("calculate_smart_match_score", {
            p_job_offer_id: jobOfferId,
            p_candidate_id: candidate.id
          });
        }
      }
    } catch (error) {
      console.error("Error recalculating matches:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...matches];

    // Filter by score
    if (filterScore === "high") {
      filtered = filtered.filter(m => m.match_score >= 80);
    } else if (filterScore === "medium") {
      filtered = filtered.filter(m => m.match_score >= 60 && m.match_score < 80);
    }

    // Filter by availability
    if (filterAvailability === "immediate") {
      filtered = filtered.filter(m => m.availability_days === 0);
    } else if (filterAvailability === "30days") {
      filtered = filtered.filter(m => m.availability_days !== null && m.availability_days <= 30);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.full_name.toLowerCase().includes(query) ||
        m.job_title?.toLowerCase().includes(query) ||
        m.city?.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === "score") {
      filtered.sort((a, b) => b.match_score - a.match_score);
    } else if (sortBy === "trs") {
      filtered.sort((a, b) => (b.talent_relationship_score || 0) - (a.talent_relationship_score || 0));
    } else if (sortBy === "experience") {
      filtered.sort((a, b) => (b.years_experience || 0) - (a.years_experience || 0));
    }

    setFilteredMatches(filtered);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  };

  const handleSendMessage = (candidateId: string, candidateName: string) => {
    navigate(`/messages?userId=${candidateId}`);
  };

  const handleViewProfile = (candidateId: string) => {
    navigate(`/profile/${candidateId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!jobOffer) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Offerta non trovata</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold">AI Match: {jobOffer.title}</h2>
          <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {jobOffer.city}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {jobOffer.experience_level}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {jobOffer.sector}
            </span>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {filteredMatches.length} candidati
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca candidato..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterScore} onValueChange={setFilterScore}>
              <SelectTrigger>
                <SelectValue placeholder="Filtra per score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i match</SelectItem>
                <SelectItem value="high">&gt;80% (Alto)</SelectItem>
                <SelectItem value="medium">60-79% (Medio)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAvailability} onValueChange={setFilterAvailability}>
              <SelectTrigger>
                <SelectValue placeholder="Disponibilità" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                <SelectItem value="immediate">Immediata</SelectItem>
                <SelectItem value="30days">Entro 30 giorni</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordina per" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Match %</SelectItem>
                <SelectItem value="trs">TRS Score</SelectItem>
                <SelectItem value="experience">Esperienza</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Matches List */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nessun candidato trovato con i filtri selezionati
            </CardContent>
          </Card>
        ) : (
          filteredMatches.map((match) => (
            <Card key={match.candidate_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={match.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(match.full_name)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{match.full_name}</h3>
                          <Badge className={getScoreBadgeColor(match.match_score)}>
                            {match.match_score}% Match
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          {match.job_title || "Non specificato"} · {match.seniority_level || "N/A"}
                        </p>
                        {match.years_experience && (
                          <p className="text-sm text-muted-foreground">
                            {match.years_experience} anni di esperienza
                          </p>
                        )}
                      </div>
                      <div className={`w-16 h-16 rounded-full ${getScoreColor(match.match_score)} flex items-center justify-center text-white font-bold text-xl`}>
                        {match.match_score}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {match.city && (
                        <Badge variant="outline" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          {match.city}
                        </Badge>
                      )}
                      {match.availability_days !== null && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {match.availability_days === 0 ? "Immediata" : `${match.availability_days} giorni`}
                        </Badge>
                      )}
                      {match.salary_min && (
                        <Badge variant="outline" className="gap-1">
                          <DollarSign className="h-3 w-3" />
                          €{match.salary_min.toLocaleString()}{match.salary_max ? `-${match.salary_max.toLocaleString()}` : "+"}
                        </Badge>
                      )}
                      {match.talent_relationship_score && match.talent_relationship_score > 0 && (
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3" />
                          TRS {match.talent_relationship_score}
                        </Badge>
                      )}
                    </div>

                    {/* Skills */}
                    {match.skills && match.skills.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {match.skills.slice(0, 5).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {match.skills.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{match.skills.length - 5}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewProfile(match.candidate_id)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Apri profilo
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSendMessage(match.candidate_id, match.full_name)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Invia messaggio
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
