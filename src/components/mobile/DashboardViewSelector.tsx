import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LayoutList, LayoutGrid, Calendar } from "lucide-react";

type ViewType = "list" | "card" | "timeline";

interface DashboardViewSelectorProps {
  onViewChange: (view: ViewType) => void;
}

export const DashboardViewSelector = ({ onViewChange }: DashboardViewSelectorProps) => {
  const [view, setView] = useState<ViewType>(() => {
    const saved = localStorage.getItem("dashboard-view");
    return (saved as ViewType) || "card";
  });

  useEffect(() => {
    localStorage.setItem("dashboard-view", view);
    onViewChange(view);
  }, [view, onViewChange]);

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      <Button
        variant={view === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => setView("list")}
        className="flex-1"
      >
        <LayoutList className="h-4 w-4" />
      </Button>
      <Button
        variant={view === "card" ? "default" : "ghost"}
        size="sm"
        onClick={() => setView("card")}
        className="flex-1"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={view === "timeline" ? "default" : "ghost"}
        size="sm"
        onClick={() => setView("timeline")}
        className="flex-1"
      >
        <Calendar className="h-4 w-4" />
      </Button>
    </div>
  );
};
