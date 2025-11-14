import { useState, useEffect } from "react";
import { toast } from "sonner";

export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        toast.success("Connessione ripristinata", {
          description: "Sei di nuovo online",
        });
        setWasOffline(false);
        // Trigger data refresh
        window.dispatchEvent(new CustomEvent("online-restored"));
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      toast.error("Connessione persa", {
        description: "Lavorerai in modalità offline",
        duration: Infinity,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
};
