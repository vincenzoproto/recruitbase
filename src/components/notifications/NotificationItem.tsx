import { memo, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageCircle, Heart, Briefcase, Users, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "message":
      return <MessageCircle className="h-5 w-5 text-primary" />;
    case "meeting":
      return <Calendar className="h-5 w-5 text-success" />;
    case "match":
      return <Heart className="h-5 w-5 text-destructive" />;
    case "application":
      return <Briefcase className="h-5 w-5 text-warning" />;
    case "comment":
      return <Users className="h-5 w-5 text-info" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "message":
      return "bg-primary/10";
    case "meeting":
      return "bg-success/10";
    case "match":
      return "bg-destructive/10";
    case "application":
      return "bg-warning/10";
    case "comment":
      return "bg-info/10";
    default:
      return "bg-muted";
  }
};

export const NotificationItem = memo(({
  notification,
  onMarkAsRead,
  onDismiss,
}: NotificationItemProps) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    // Navigate based on link
    if (notification.link) {
      navigate(notification.link);
    }
  }, [notification, onMarkAsRead, navigate]);

  const handleSwipeLeft = useCallback((e: React.TouchEvent) => {
    // Simple swipe detection
    const touch = e.changedTouches[0];
    const startX = touch.clientX;
    
    const handleTouchEnd = (endEvent: TouchEvent) => {
      const endX = endEvent.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (diff > 100) {
        onDismiss(notification.id);
      }
    };

    document.addEventListener("touchend", handleTouchEnd, { once: true });
  }, [notification.id, onDismiss]);

  return (
    <div
      onClick={handleClick}
      onTouchStart={handleSwipeLeft}
      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 animate-fade-in ${
        notification.read ? "bg-background" : "bg-muted/50 border border-primary/10"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-sm">{notification.title}</p>
            {!notification.read && (
              <Badge className="bg-primary text-white text-[10px] px-1.5 py-0.5">
                Nuovo
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {notification.message}
          </p>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {notification.type}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
                locale: it,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = "NotificationItem";
