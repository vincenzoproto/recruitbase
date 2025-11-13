import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationBellProps {
  userId: string;
  onMeetingNotificationClick?: () => void;
  onMessageNotificationClick?: (senderId: string) => void;
  onApplicationNotificationClick?: (candidateId: string) => void;
  onMatchNotificationClick?: (matchId: string) => void;
}

export const NotificationBell = ({ 
  userId, 
  onMeetingNotificationClick, 
  onMessageNotificationClick, 
  onApplicationNotificationClick,
  onMatchNotificationClick 
}: NotificationBellProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    getTimeAgo
  } = useNotifications(userId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="border-b p-4 flex items-center justify-between">
          <h3 className="font-semibold">Notifiche</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Segna tutte come lette
            </Button>
          )}
        </div>
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nessuna notifica
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={async () => {
                    await markAsRead(notification.id);
                    
                    // Deep-linking completo basato sul tipo di notifica
                    if (notification.type === 'meeting_request' || notification.type === 'meeting_confirmed') {
                      onMeetingNotificationClick?.();
                    } else if (notification.type === 'new_message') {
                      if (notification.link) {
                        onMessageNotificationClick?.(notification.link);
                      }
                    } else if (notification.type === 'new_application') {
                      if (notification.link) {
                        onApplicationNotificationClick?.(notification.link);
                      }
                    } else if (notification.type === 'match' || notification.type === 'match_found') {
                      if (notification.link) {
                        onMatchNotificationClick?.(notification.link);
                      }
                    } else if (notification.type === 'post_comment' || notification.type === 'post_reaction') {
                      if (notification.link) {
                        navigate(`/social?post=${notification.link}`);
                      }
                    } else if (notification.type === 'profile_view') {
                      navigate('/dashboard');
                    } else if (notification.type === 'application_status') {
                      navigate('/dashboard');
                    } else {
                      // Fallback generico
                      if (notification.link) {
                        navigate(`/dashboard?ref=${notification.link}`);
                      } else {
                        toast.info("Contenuto non disponibile");
                      }
                    }
                    
                    setOpen(false);
                  }}
                  className={`w-full p-4 text-left hover:bg-accent transition-colors ${
                    !notification.read ? 'bg-accent/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getTimeAgo(notification.created_at)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
