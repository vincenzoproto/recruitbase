import { useUserRole } from "@/hooks/useUserRole";
import { Bell, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const UnifiedTopBar = () => {
  const navigate = useNavigate();
  const role = useUserRole();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 px-4 bg-background border-b border-border flex items-center justify-between z-50">
      
      <h1 className="font-semibold text-lg">
        {role === "candidate" ? "Pausilio" : "Pausilio HR"}
      </h1>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/search")}
        >
          <Search className="w-5 h-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/notifications")}
        >
          <Bell className="w-5 h-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/profile")}
        >
          <User className="w-5 h-5" />
        </Button>
      </div>

    </header>
  );
};

export default UnifiedTopBar;
