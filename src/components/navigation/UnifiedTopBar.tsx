import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, MessageCircle, Users, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface UnifiedTopBarProps {
  fullName: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  unreadMessages?: number;
  unreadNotifications?: number;
  onMenuClick: () => void;
}

export const UnifiedTopBar = ({
  fullName,
  avatarUrl,
  level,
  xp,
  xpToNextLevel,
  unreadMessages = 0,
  unreadNotifications = 0,
  onMenuClick,
}: UnifiedTopBarProps) => {
  const navigate = useNavigate();
  const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const xpProgress = (xp / xpToNextLevel) * 100;

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50 h-16">
      <div className="flex items-center justify-between h-full px-4 max-w-7xl mx-auto">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              RecruitBoost
            </div>
          </div>
        </div>

        {/* Center: XP Bar (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-xs mx-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
            <span className="text-xs font-bold text-primary">Lv {level}</span>
            <Progress value={xpProgress} className="h-1.5 w-24" />
            <span className="text-xs text-muted-foreground">{xp}/{xpToNextLevel}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/social")}
            className="relative"
          >
            <Users className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/messages")}
            className="relative"
          >
            <MessageCircle className="h-5 w-5" />
            {unreadMessages > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-white text-[10px]">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </Badge>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/notifications")}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-white text-[10px]">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </Badge>
            )}
          </Button>

          <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate("/profile")}>
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Mobile XP Bar */}
      <div className="md:hidden px-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary">Lv {level}</span>
          <Progress value={xpProgress} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground">{xp}/{xpToNextLevel}</span>
        </div>
      </div>
    </header>
  );
};
