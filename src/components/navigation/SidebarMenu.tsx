import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Brain, 
  Briefcase, 
  Bell, 
  Users, 
  TrendingUp, 
  UserCog, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  Lock,
  Crown,
  Heart,
  Globe,
  Gift,
  Award,
  Calendar,
  Columns,
  UserPlus,
  Compass,
  Search
} from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { PremiumUpgradePopup } from "@/components/premium/PremiumUpgradePopup";
import { hapticFeedback } from "@/lib/haptics";
import { FEATURES, canAccessFeature, STRIPE_PRO_LINK } from "@/lib/constants/features";
import type { PlanType } from "@/types";

interface SidebarMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fullName: string;
  avatarUrl?: string;
  role: "recruiter" | "candidate";
  planType: PlanType;
  trsScore?: number;
  cultureFit?: number;
  onNavigate: (section: string) => void;
  onLogout: () => void;
}

const planBadgeConfig: Record<PlanType, { label: string; color: string }> = {
  free: { label: "Free", color: "bg-muted text-muted-foreground" },
  pro: { label: "Pro", color: "bg-gradient-to-r from-blue-500 to-blue-600 text-white" },
  business: { label: "Business", color: "bg-gradient-to-r from-purple-500 to-purple-600 text-white" },
  enterprise: { label: "Enterprise", color: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" }
};

export const SidebarMenu = ({
  open,
  onOpenChange,
  fullName,
  avatarUrl,
  role,
  planType,
  trsScore = 0,
  cultureFit = 0,
  onNavigate,
  onLogout
}: SidebarMenuProps) => {
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [lockedFeature, setLockedFeature] = useState<{ name: string; plan: string } | null>(null);

  const initials = useMemo(() => 
    fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    [fullName]
  );

  const planBadge = planBadgeConfig[planType];

  const handleLockedFeatureClick = useCallback((featureName: string, requiredPlan: string) => {
    hapticFeedback.light();
    setLockedFeature({ name: featureName, plan: requiredPlan });
    setShowUpgradePopup(true);
  }, []);

  const handleUpgrade = useCallback(() => {
    hapticFeedback.medium();
    window.open(STRIPE_PRO_LINK, "_blank");
    setShowUpgradePopup(false);
  }, []);

  interface MenuItem {
    id: string;
    icon: any;
    label: string;
    locked: boolean;
    requiredPlan?: string;
  }

  const menuSections: {
    main: MenuItem[];
    premium: MenuItem[];
    enterprise: MenuItem[];
    settings: MenuItem[];
    gamification: MenuItem[];
  } = role === "recruiter" ? {
    main: [
      { 
        id: "profile", 
        icon: User, 
        label: "Profilo personale", 
        locked: false 
      },
      { 
        id: "matches", 
        icon: Users, 
        label: "Match Candidati", 
        locked: false 
      },
      { 
        id: "pipeline", 
        icon: Columns, 
        label: "Pipeline", 
        locked: false 
      },
      { 
        id: "offers", 
        icon: Briefcase, 
        label: "Gestione offerte", 
        locked: false 
      },
      { 
        id: "analytics", 
        icon: TrendingUp, 
        label: "Analytics", 
        locked: false 
      },
      { 
        id: "calendar", 
        icon: Calendar, 
        label: "Calendario", 
        locked: false 
      },
      { 
        id: "search-people", 
        icon: Search, 
        label: "Cerca Persone", 
        locked: false 
      },
      { 
        id: "notifications-archive", 
        icon: Bell, 
        label: "Archivio notifiche", 
        locked: false 
      },
      { 
        id: "copilot", 
        icon: Brain, 
        label: "Copilot AI", 
        locked: !canAccessFeature(planType, 'pro'),
        requiredPlan: "Pro"
      },
    ],
    premium: [
      { 
        id: "feed", 
        icon: Users, 
        label: "Feed sociale", 
        locked: !canAccessFeature(planType, 'business'),
        requiredPlan: "Business"
      },
    ],
    enterprise: [
      { 
        id: "team", 
        icon: UserCog, 
        label: "Gestione Team", 
        locked: !canAccessFeature(planType, 'enterprise'),
        requiredPlan: "Enterprise"
      },
    ],
    gamification: [
      { 
        id: "badges", 
        icon: Award, 
        label: "Badge", 
        locked: false 
      },
      { 
        id: "connections", 
        icon: UserPlus, 
        label: "Connessioni", 
        locked: false 
      },
    ],
    settings: [
      { 
        id: "ambassador", 
        icon: Gift, 
        label: "Programma Ambassador", 
        locked: false 
      },
      { 
        id: "settings", 
        icon: Settings, 
        label: "Impostazioni e Privacy", 
        locked: false 
      },
      { 
        id: "help", 
        icon: HelpCircle, 
        label: "Centro assistenza", 
        locked: false 
      },
      { 
        id: "language", 
        icon: Globe, 
        label: "Lingua", 
        locked: false 
      },
    ]
  } : {
    main: [
      { id: "profile", icon: User, label: "Profilo personale", locked: false },
      { id: "offers", icon: Briefcase, label: "Offerte", locked: false },
      { id: "career", icon: Compass, label: "Carriera", locked: false },
      { id: "cv", icon: Briefcase, label: "CV & Portfolio", locked: false },
      { id: "create-group", icon: UserPlus, label: "Crea Gruppo", locked: false },
      { id: "search-people", icon: Search, label: "Cerca Persone", locked: false },
      { id: "saved-offers", icon: Heart, label: "Offerte salvate", locked: false },
      { id: "feed", icon: Users, label: "Feed sociale", locked: false },
    ],
    premium: [
      { 
        id: "ai-suggestions", 
        icon: Brain, 
        label: "Suggerimenti AI", 
        locked: planType === "free",
        requiredPlan: "Business"
      },
    ],
    enterprise: [],
    gamification: [
      { 
        id: "badges", 
        icon: Award, 
        label: "Badge", 
        locked: false 
      },
      { 
        id: "connections", 
        icon: UserPlus, 
        label: "Connessioni", 
        locked: false 
      },
    ],
    settings: [
      { 
        id: "ambassador", 
        icon: Gift, 
        label: "Programma Ambassador", 
        locked: false 
      },
      { 
        id: "settings", 
        icon: Settings, 
        label: "Impostazioni e Privacy", 
        locked: false 
      },
      { 
        id: "help", 
        icon: HelpCircle, 
        label: "Centro assistenza", 
        locked: false 
      },
      { 
        id: "language", 
        icon: Globe, 
        label: "Lingua", 
        locked: false 
      },
    ]
  };

  const allItems = [
    ...menuSections.main,
    ...menuSections.premium,
    ...menuSections.enterprise,
    ...menuSections.gamification,
    ...menuSections.settings
  ];

  const handleItemClick = (item: typeof allItems[0]) => {
    if (item.locked) {
      handleLockedFeatureClick(item.label, item.requiredPlan || "Pro");
    } else {
      hapticFeedback.light();
      
      const routeMap: Record<string, string> = {
        profile: "/profile",
        matches: "/offers",
        pipeline: "/pipeline",
        offers: "/offers",
        analytics: "/analytics",
        calendar: "/calendar",
        "search-people": "/search-people",
        "notifications-archive": "/notifications",
        copilot: "/copilot",
        feed: "/feed",
        badges: "/badges",
        connections: "/connections",
        ambassador: "/ambassador",
        settings: "/settings",
        help: "/help",
        language: "/language",
        cv: "/profile",
        "saved-offers": "/offers",
        career: "/career",
        "create-group": "/messages",
        "ai-suggestions": "/copilot",
      };
      
      const route = routeMap[item.id];
      if (route) {
        onNavigate(route);
      }
      onOpenChange(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[85vw] max-w-sm p-0 bg-background">
          <SheetHeader className="border-b border-border p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={avatarUrl} alt={fullName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-foreground truncate">
                  {fullName}
                </h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {role === "recruiter" ? "Recruiter" : "Candidato"}
                </p>
                <Badge className={`mt-2 ${planBadge.color} border-none`}>
                  {planType === "pro" && <Crown className="h-3 w-3 mr-1" />}
                  {planType === "business" && <Crown className="h-3 w-3 mr-1" />}
                  {planType === "enterprise" && <Crown className="h-3 w-3 mr-1" />}
                  {planBadge.label}
                </Badge>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">TRS Score</span>
                  <span className="font-semibold text-foreground">{trsScore}/100</span>
                </div>
                <Progress value={trsScore} className="h-2" />
              </div>
              {role === "candidate" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Culture Fit</span>
                    <span className="font-semibold text-foreground">{cultureFit}%</span>
                  </div>
                  <Progress value={cultureFit} className="h-2" />
                </div>
              )}
            </div>
          </SheetHeader>

          <div className="overflow-y-auto h-[calc(100vh-240px)]">
            {/* Main Section */}
            <div className="py-2">
              {menuSections.main.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center gap-3 px-6 py-3 hover:bg-accent transition-colors smooth-transition"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="flex-1 text-left text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                    {item.locked && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Premium Section */}
            <div className="border-t border-border py-2">
              {menuSections.premium.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center gap-3 px-6 py-3 hover:bg-accent transition-colors smooth-transition"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="flex-1 text-left text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                    {item.locked && (
                      <Badge variant="outline" className="text-xs gap-1 border-primary/30">
                        <Lock className="h-3 w-3" />
                        {item.requiredPlan}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Enterprise Section */}
            {menuSections.enterprise.length > 0 && (
              <div className="border-t border-border py-2">
                {menuSections.enterprise.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="w-full flex items-center gap-3 px-6 py-3 hover:bg-accent transition-colors smooth-transition"
                    >
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="flex-1 text-left text-sm font-medium text-foreground">
                        {item.label}
                      </span>
                      {item.locked && (
                        <Badge variant="outline" className="text-xs gap-1 border-primary/30">
                          <Lock className="h-3 w-3" />
                          Enterprise
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Gamification Section */}
            <div className="border-t border-border py-2">
              {menuSections.gamification.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center gap-3 px-6 py-3 hover:bg-accent transition-colors smooth-transition"
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="flex-1 text-left text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Settings Section */}
            <div className="border-t border-border py-2">
              {menuSections.settings.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center gap-3 px-6 py-3 hover:bg-accent transition-colors smooth-transition"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="flex-1 text-left text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Logout */}
            <div className="border-t border-border py-2">
              <button
                onClick={() => {
                  hapticFeedback.medium();
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-6 py-3 hover:bg-destructive/10 text-destructive transition-colors smooth-transition"
              >
                <LogOut className="h-5 w-5" />
                <span className="flex-1 text-left text-sm font-medium">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <PremiumUpgradePopup
        open={showUpgradePopup}
        onOpenChange={setShowUpgradePopup}
        onUpgrade={handleUpgrade}
      />
    </>
  );
};