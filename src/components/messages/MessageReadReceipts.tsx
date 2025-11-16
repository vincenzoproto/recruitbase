import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageReadReceiptsProps {
  read: boolean;
  isSent: boolean;
  className?: string;
}

export const MessageReadReceipts = ({ read, isSent, className }: MessageReadReceiptsProps) => {
  if (!isSent) return null;

  return (
    <div className={cn("flex items-center gap-1 text-xs", className)}>
      {read ? (
        <CheckCheck className="h-3 w-3 text-primary" />
      ) : (
        <Check className="h-3 w-3 text-muted-foreground" />
      )}
    </div>
  );
};
