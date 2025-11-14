import { PropsWithChildren } from "react";

// ThemeProvider molto semplice e senza hook:
export function ThemeProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export default ThemeProvider;
