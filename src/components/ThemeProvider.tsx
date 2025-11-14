import * as React from "react";

// FIXED: Removed all hooks - simple wrapper only
interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}

export default ThemeProvider;
