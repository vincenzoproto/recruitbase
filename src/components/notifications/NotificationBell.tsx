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
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/types";

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

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    setOpen(false);
    
    // Deep-linking completo basato sul tipo di notifica
    switch (notification.type) {
      case 'meeting_request':
      case 'meeting_confirmed':
        onMeetingNotificationClick?.();
        break;
        
      case 'new_message':
        if (notification.link) {
          onMessageNotificationClick?.(notification.link);
        }
        break;
        
      case 'new_application':
        if (notification.link) {
          onApplicationNotificationClick?.(notification.link);
        }
        break;
        
      case 'match':
      case 'match_found':
        if (notification.link) {
          onMatchNotificationClick?.(notification.link);
        } else {
          navigate('/dashboard?view=match');
        }
        break;
        
      case 'post_comment':
      case 'post_reaction':
        if (notification.link) {
          navigate(`/social?post=${notification.link}`);
        } else {
          navigate('/social');
        }
        break;
        
      case 'application_status':
        navigate('/dashboard?view=career');
        break;
        
      case 'profile_view':
        navigate('/dashboard?view=insights');
        break;
        
      default:
        if (notification.link) {
          navigate(`/dashboard?view=${notification.link}`);
        }
    }
  };

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
        <div className="border-b p-4 flex items-center justify-between bg-muted/30">
          <div>
            <h3 className="font-semibold">Notifiche</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {unreadCount} {unreadCount === 1 ? 'non letta' : 'non lette'}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-8"
            >
              Segna tutte
            </Button>
          )}
        </div>
        <ScrollArea className="h-96">
          {loading ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-muted-foreground">Caricamento notifiche...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Nessuna notifica</p>
                <p className="text-sm text-muted-foreground">
                  Ti avviseremo quando ci saranno novità
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  navigate('/dashboard');
                }}
                className="mt-4"
              >
                Torna alla Dashboard
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-1">{notification.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {getTimeAgo(notification.created_at)}
                      </span>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
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