import { AlertCircle, X } from "lucide-react";
import { Button } from "./button";

interface ErrorBannerProps {
  message: string;
  onClose?: () => void;
  onRetry?: () => void;
}

export const ErrorBanner = ({ message, onClose, onRetry }: ErrorBannerProps) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-in-top max-w-md w-full mx-4">
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive">{message}</p>
            {onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="mt-2 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                Riprova
              </Button>
            )}
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-destructive/10"
            >
              <X className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
