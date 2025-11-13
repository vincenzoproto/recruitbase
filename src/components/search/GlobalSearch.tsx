import { useState, useEffect, useCallback } from "react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Search, User, Briefcase, MessageCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { hapticFeedback } from "@/lib/haptics";

interface SearchResult {
  id: string;
  type: "candidate" | "offer" | "message" | "application";
  title: string;
  subtitle?: string;
  icon: any;
}

interface GlobalSearchProps {
  userRole: "recruiter" | "candidate";
  userId: string;
}

export const GlobalSearch = ({ userRole, userId }: GlobalSearchProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      if (userRole === "recruiter") {
        // Search candidates
        const { data: candidates } = await supabase
          .from("profiles")
          .select("id, full_name, job_title, city")
          .eq("role", "candidate")
          .or(`full_name.ilike.%${query}%,job_title.ilike.%${query}%,city.ilike.%${query}%`)
          .limit(5);

        candidates?.forEach((c) => {
          searchResults.push({
            id: c.id,
            type: "candidate",
            title: c.full_name,
            subtitle: `${c.job_title || "Candidato"} • ${c.city || ""}`,
            icon: User,
          });
        });

        // Search offers
        const { data: offers } = await supabase
          .from("job_offers")
          .select("id, title, city, sector")
          .eq("recruiter_id", userId)
          .or(`title.ilike.%${query}%,city.ilike.%${query}%,sector.ilike.%${query}%`)
          .limit(5);

        offers?.forEach((o) => {
          searchResults.push({
            id: o.id,
            type: "offer",
            title: o.title,
            subtitle: `${o.sector} • ${o.city}`,
            icon: Briefcase,
          });
        });
      } else {
        // Candidate: search offers
        const { data: offers } = await supabase
          .from("job_offers")
          .select("id, title, city, sector")
          .eq("is_active", true)
          .or(`title.ilike.%${query}%,city.ilike.%${query}%,sector.ilike.%${query}%`)
          .limit(8);

        offers?.forEach((o) => {
          searchResults.push({
            id: o.id,
            type: "offer",
            title: o.title,
            subtitle: `${o.sector} • ${o.city}`,
            icon: Briefcase,
          });
        });

        // Search applications
        const { data: applications } = await supabase
          .from("applications")
          .select(`
            id, 
            status,
            job_offers (title, city)
          `)
          .eq("candidate_id", userId)
          .limit(5);

        applications?.forEach((app: any) => {
          const offer = app.job_offers;
          if (offer && offer.title.toLowerCase().includes(query.toLowerCase())) {
            searchResults.push({
              id: app.id,
              type: "application",
              title: offer.title,
              subtitle: `Candidatura • ${app.status}`,
              icon: FileText,
            });
          }
        });
      }

      // Search messages for both roles
      const { data: messages } = await supabase
        .from("messages")
        .select(`
          id,
          content,
          sender_id,
          receiver_id,
          profiles!messages_sender_id_fkey(full_name)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .ilike("content", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(5);

      messages?.forEach((msg: any) => {
        const otherUser = msg.sender_id === userId 
          ? "Tu"
          : msg.profiles?.full_name || "Utente";
        searchResults.push({
          id: msg.sender_id === userId ? msg.receiver_id : msg.sender_id,
          type: "message",
          title: `Chat con ${otherUser}`,
          subtitle: msg.content.slice(0, 50) + "...",
          icon: MessageCircle,
        });
      });

      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Errore nella ricerca");
    } finally {
      setLoading(false);
    }
  }, [userRole, userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, performSearch]);

  const handleSelect = (result: SearchResult) => {
    hapticFeedback.light();
    setOpen(false);
    setSearch("");

    switch (result.type) {
      case "candidate":
        navigate(`/profile/${result.id}`);
        break;
      case "offer":
        // Navigate to offer details or dashboard
        toast.success(`Apertura offerta: ${result.title}`);
        break;
      case "message":
        // Open chat with user
        toast.success(`Apertura chat`);
        break;
      case "application":
        toast.success(`Apertura candidatura`);
        break;
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative w-full max-w-sm flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted rounded-lg smooth-transition text-left"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground flex-1">
          Cerca candidati, offerte, messaggi...
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-background border rounded">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Cerca candidati, offerte, messaggi..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          {loading && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Ricerca in corso...
            </div>
          )}
          {!loading && results.length === 0 && search.length > 0 && (
            <CommandEmpty>Nessun risultato trovato.</CommandEmpty>
          )}
          {!loading && results.length > 0 && (
            <CommandGroup heading="Risultati">
              {results.map((result) => {
                const Icon = result.icon;
                return (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{result.title}</span>
                      {result.subtitle && (
                        <span className="text-xs text-muted-foreground">
                          {result.subtitle}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};
