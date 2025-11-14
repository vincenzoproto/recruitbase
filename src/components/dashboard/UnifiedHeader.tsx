import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { GlobalSearchBar } from "@/components/search/GlobalSearchBar";

interface UnifiedHeaderProps {
  fullName?: string;
  avatarUrl?: string;
  role: "recruiter" | "candidate";
}

export const UnifiedHeader = ({ fullName, avatarUrl, role }: UnifiedHeaderProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buongiorno";
    if (hour < 18) return "Buon pomeriggio";
    return "Buonasera";
  };

  const initials = fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="space-y-4 mb-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarImage src={avatarUrl} alt={fullName} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {avatarUrl ? initials : <User className="h-6 w-6" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">
            {getGreeting()} 👋
          </p>
          <h1 className="text-xl font-bold text-foreground">
            {fullName || "Utente"}
          </h1>
        </div>
      </div>
      <GlobalSearchBar />
    </div>
  );
};
