import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      expand
      duration={4000}
      toastOptions={{
        classNames: {
          toast: "rounded-xl shadow-lg backdrop-blur-sm border-2",
          title: "font-semibold text-base",
          description: "text-sm",
          success: "border-success/20 bg-success/10",
          error: "border-destructive/20 bg-destructive/10",
          warning: "border-warning/20 bg-warning/10",
          info: "border-primary/20 bg-primary/10",
        },
      }}
    />
  );
}

export default Toaster;
