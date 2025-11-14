import { ReactNode, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedTopBar } from "@/components/navigation/UnifiedTopBar";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { SidebarMenu } from "@/components/navigation/SidebarMenu";
import { useNotifications } from "@/hooks/useNotifications";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { useSwipe } from "@/hooks/use-swipe";
import { hapticFeedback } from "@/lib/haptics";
import { toast } from "sonner";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  // Tab order for swipe navigation
  const tabOrder = ["home", "offers", "feed", "messages", "profile"];

  const { unreadCount: notificationCount } = useNotifications(profile?.id || "");
  const { unreadCount: messageCount } = useMessageNotifications(profile?.id || "");

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    // Sync activeTab with current route
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") setActiveTab("home");
    else if (path === "/offers") setActiveTab("offers");
    else if (path === "/social") setActiveTab("feed");
    else if (path === "/messages") setActiveTab("messages");
    else if (path.startsWith("/profile")) setActiveTab("profile");
  }, [location.pathname]);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    hapticFeedback.light();
    
    switch (tab) {
      case "home":
        navigate("/dashboard");
        break;
      case "offers":
        navigate("/offers");
        break;
      case "feed":
        navigate("/social");
        break;
      case "messages":
        navigate("/messages");
        break;
      case "profile":
        navigate("/profile");
        break;
    }
  };

  // Swipe navigation between tabs
  const swipeHandlers = useSwipe({
    onSwipedLeft: () => {
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex < tabOrder.length - 1) {
        handleTabChange(tabOrder[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex > 0) {
        handleTabChange(tabOrder[currentIndex - 1]);
      }
    },
    minSwipeDistance: 80,
  });

  const handleSidebarNavigate = (id: string) => {
    setSidebarOpen(false);
    
    switch (id) {
      case "profile":
        navigate("/profile");
        break;
      case "copilot":
        navigate("/copilot");
        break;
      case "offers":
        navigate("/offers");
        break;
      case "feed":
        navigate("/social");
        break;
      case "privacy":
        navigate("/privacy");
        break;
      case "terms":
        navigate("/terms");
        break;
      case "contact":
        navigate("/contact");
        break;
      default:
        toast.info("Funzionalità in arrivo");
        break;
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Logout effettuato");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Errore nel logout");
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <UnifiedTopBar
        unreadNotifications={notificationCount}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* Main Content with swipe support */}
      <main 
        className="pt-16 pb-20 md:pb-4 min-h-screen"
        {...swipeHandlers}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userRole={profile.role}
        unreadCount={messageCount}
        notificationCount={notificationCount}
      />

      {/* Sidebar Menu */}
      <SidebarMenu
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        fullName={profile.full_name}
        avatarUrl={profile.avatar_url}
        role={profile.role}
        planType={profile.is_premium ? "pro" : "free"}
        trsScore={profile.talent_relationship_score}
        cultureFit={profile.engagement_score}
        onNavigate={handleSidebarNavigate}
        onLogout={handleLogout}
      />
    </>
  );
};
