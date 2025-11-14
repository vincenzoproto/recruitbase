import { toast } from "sonner";

type ToastVariant = "default" | "success" | "error" | "warning";

interface ShowToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

export function showToast({
  title,
  description,
  variant = "default",
}: ShowToastOptions) {
  if (variant === "success") {
    return toast.success(title || "Operazione completata", {
      description,
    });
  }
  if (variant === "error") {
    return toast.error(title || "Si è verificato un errore", {
      description,
    });
  }
  if (variant === "warning") {
    return toast.warning(title || "Attenzione", {
      description,
    });
  }
  return toast(title || "", { description });
}

// Per retro-compatibilità, esporta anche `toast` diretto di sonner
export { toast };
