import { ReactNode, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedTopBar } from "@/components/navigation/UnifiedTopBar";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { SidebarMenu } from "@/components/navigation/SidebarMenu";
import { useXPSystem } from "@/hooks/useXPSystem";
import { useNotifications } from "@/hooks/useNotifications";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const { level, xp, xpToNextLevel } = useXPSystem(profile?.id);
  const { unreadCount: notificationCount } = useNotifications(profile?.id || "");
  const { unreadCount: messageCount } = useMessageNotifications(profile?.id || "");

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    // Sync activeTab with current route
    const path = location.pathname;
    if (path === "/dashboard") setActiveTab("home");
    else if (path === "/offers") setActiveTab("offers");
    else if (path === "/social") setActiveTab("feed");
    else if (path === "/messages") setActiveTab("messages");
    else if (path === "/profile") setActiveTab("profile");
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
      case "analytics":
        // Add analytics route when ready
        break;
      case "team":
        // Add team route when ready
        break;
      case "settings":
        // Add settings route when ready
        break;
      case "billing":
        // Add billing route when ready
        break;
      case "support":
        // Add support route when ready
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
      case "notifications-archive":
        // Add notifications archive when ready
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar - Always visible */}
      <UnifiedTopBar
        fullName={profile.full_name}
        avatarUrl={profile.avatar_url}
        level={level}
        xp={xp}
        xpToNextLevel={xpToNextLevel}
        unreadMessages={messageCount}
        unreadNotifications={notificationCount}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* Main Content - with proper spacing for fixed bars */}
      <main className="pt-16 pb-20 md:pb-4">
        {children}
      </main>

      {/* Bottom Navigation - Mobile only */}
      {isMobile && (
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          userRole={profile.role}
          unreadCount={messageCount}
          notificationCount={notificationCount}
        />
      )}

      {/* Sidebar Menu - Accessible via hamburger */}
      <SidebarMenu
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        fullName={profile.full_name}
        avatarUrl={profile.avatar_url}
        role={profile.role}
        planType="free"
        trsScore={profile.talent_relationship_score || 0}
        cultureFit={0}
        onNavigate={handleSidebarNavigate}
        onLogout={handleLogout}
      />
    </div>
  );
};
