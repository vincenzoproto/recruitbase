import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatSearchProps {
  currentUserId: string;
  onSelectUser: (userId: string, userName: string, userAvatar?: string) => void;
}

interface SearchResult {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
}

export const ChatSearch = ({ currentUserId, onSelectUser }: ChatSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.length >= 2) {
        searchUsers();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role")
        .neq("id", currentUserId)
        .ilike("full_name", `%${query}%`)
        .limit(10);

      if (!error && data) {
        setResults(data);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = useCallback((user: SearchResult) => {
    onSelectUser(user.id, user.full_name, user.avatar_url);
    setQuery("");
    setResults([]);
    setShowResults(false);
  }, [onSelectUser]);

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca utenti..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50">
          <ScrollArea className="max-h-80">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Ricerca in corso...
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nessun risultato
              </div>
            ) : (
              <div className="py-2">
                {results.map((user) => {
                  const initials = user.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <button
                      key={user.id}
                      onClick={() => handleSelect(user)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url} alt={user.full_name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-sm">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {user.role === "recruiter" ? "Recruiter" : "Candidato"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
