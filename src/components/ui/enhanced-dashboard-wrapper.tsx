import { useState, useEffect } from "react";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { InteractiveTutorial } from "@/components/onboarding/InteractiveTutorial";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { QuickActionFAB } from "@/components/ui/quick-action-fab";

interface EnhancedDashboardWrapperProps {
  children: React.ReactNode;
  userRole: "recruiter" | "candidate";
  userId: string;
  userName: string;
  breadcrumbs?: Array<{ label: string; href?: string; current?: boolean }>;
  onQuickAction?: (action: string) => void;
}

export const EnhancedDashboardWrapper = ({
  children,
  userRole,
  userId,
  userName,
  breadcrumbs,
  onQuickAction,
}: EnhancedDashboardWrapperProps) => {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial
    const tutorialKey = `${userRole}_tutorial_seen_${userId}`;
    const hasSeenTutorial = localStorage.getItem(tutorialKey);
    
    if (!hasSeenTutorial) {
      // Delay tutorial to let dashboard load first
      setTimeout(() => setShowTutorial(true), 1000);
    }
  }, [userRole, userId]);

  const handleTutorialComplete = () => {
    const tutorialKey = `${userRole}_tutorial_seen_${userId}`;
    localStorage.setItem(tutorialKey, "true");
    setShowTutorial(false);
  };

  return (
    <>
      {/* Interactive Tutorial */}
      <InteractiveTutorial
        open={showTutorial}
        onComplete={handleTutorialComplete}
        userRole={userRole}
      />

      <div className="min-h-screen bg-background">
        {/* Top Navigation Bar with Search */}
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Breadcrumbs */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <BreadcrumbNav items={breadcrumbs} className="hidden md:flex" />
              )}
              
              {/* Global Search */}
              <div className="flex-1 max-w-md ml-auto">
                <GlobalSearch userRole={userRole} userId={userId} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="relative">
          {children}
        </main>

        {/* Quick Actions FAB */}
        {onQuickAction && (
          <QuickActionFAB
            onAddCandidate={() => onQuickAction("add_candidate")}
            onAddPipeline={() => onQuickAction("add_pipeline")}
            onAIFollowup={() => onQuickAction("ai_followup")}
          />
        )}
      </div>
    </>
  );
};
