import { useUserRole } from "@/hooks/useUserRole";
import { Bell, MessageCircle, Menu, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { SidebarMenu } from "@/components/navigation/SidebarMenu";

const GlobalTopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = useUserRole();
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { unreadCount } = useMessageNotifications(userId || "");
  const [notificationCount, setNotificationCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadNotificationCount();
      subscribeToNotifications();
    }
  }, [userId]);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
    
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profile) setUserProfile(profile);
    }
  };

  const loadNotificationCount = async () => {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);
    
    setNotificationCount(count || 0);
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadNotificationCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Home";
    if (path === "/feed") return "Feed";
    if (path === "/offers") return "Offerte";
    if (path === "/messages" || path.startsWith("/messages/")) return "Messaggi";
    if (path === "/copilot") return "Copilot";
    if (path === "/profile") return "Profilo";
    if (path === "/notifications") return "Notifiche";
    return role === "candidate" ? "Pausilio" : "Pausilio HR";
  };

  const handleNavigate = (section: string) => {
    setSidebarOpen(false);
    // Handle routes with or without leading slash
    const route = section.startsWith('/') ? section : `/${section}`;
    navigate(route);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-14 px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border flex items-center justify-between z-50">
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <h1 className="font-semibold text-lg truncate">
            {getPageTitle()}
          </h1>
        </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/search-people")}
        >
          <Search className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate("/messages")}
        >
          <MessageCircle className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate("/notifications")}
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {notificationCount}
            </Badge>
          )}
        </Button>
      </div>

      </header>

      {userProfile && (
        <SidebarMenu
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          fullName={userProfile.full_name || "Utente"}
          avatarUrl={userProfile.avatar_url}
          role={role || "candidate"}
          planType={userProfile.is_premium ? "pro" : "free"}
          trsScore={userProfile.talent_relationship_score}
          cultureFit={85}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default GlobalTopBar;
