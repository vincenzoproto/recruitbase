import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const BreadcrumbNav = ({ items, className }: BreadcrumbNavProps) => {
  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)}>
      <Link
        to="/dashboard"
        className="text-muted-foreground hover:text-foreground smooth-transition"
      >
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {item.href && !item.current ? (
            <Link
              to={item.href}
              className="text-muted-foreground hover:text-foreground smooth-transition"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                item.current
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};
