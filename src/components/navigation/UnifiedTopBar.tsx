import { Button } from "@/components/ui/button";
import { Menu, Search, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UnifiedTopBarProps {
  unreadNotifications?: number;
  onMenuClick?: () => void;
}

export const UnifiedTopBar = ({
  unreadNotifications = 0,
  onMenuClick,
}: UnifiedTopBarProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50 h-16">
      <div className="flex items-center justify-between h-full px-4 max-w-7xl mx-auto">
        {/* Left: Menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-10 w-10"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Center: Logo */}
        <div className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          RecruitBase
        </div>

        {/* Right: Search and Notifications */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
          >
            <Search className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-white text-[10px]">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
