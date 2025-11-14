import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCheck, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
  senderName: string;
  senderAvatar?: string;
  showAvatar?: boolean;
}

export const MessageBubble = memo(({
  message,
  isOwn,
  senderName,
  senderAvatar,
  showAvatar = true,
}: MessageBubbleProps) => {
  const initials = senderName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`flex gap-2 mb-4 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={senderAvatar} alt={senderName} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          }`}
        >
          {/* Media attachments */}
          {message.media_url && message.message_type === "image" && (
            <img
              src={message.media_url}
              alt="Attachment"
              className="max-w-full rounded-lg mb-2"
              loading="lazy"
            />
          )}

          {message.media_url && message.message_type === "pdf" && (
            <a
              href={message.media_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm underline mb-2"
            >
              📄 Documento PDF
            </a>
          )}

          {message.media_url && message.message_type === "audio" && (
            <audio controls className="max-w-full mb-2">
              <source src={message.media_url} />
            </audio>
          )}

          {/* Message text */}
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        {/* Timestamp and read status */}
        <div className={`flex items-center gap-1 mt-1 px-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
              locale: it,
            })}
          </span>
          {isOwn && (
            <span className="text-muted-foreground">
              {message.read ? (
                <CheckCheck className="h-3 w-3 text-primary" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";
