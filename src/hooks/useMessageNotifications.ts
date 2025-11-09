import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pushNotifications } from "@/lib/push-notifications";

interface UnreadMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export const useMessageNotifications = (userId: string) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Load initial unread count
    loadUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel('global-messages-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          const message = payload.new as UnreadMessage;
          
          // Update unread count
          setUnreadCount(prev => prev + 1);

          // Get sender info
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', message.sender_id)
            .single();

          const senderName = senderProfile?.full_name || 'Qualcuno';

          // Show in-app notification
          toast.info(`Nuovo messaggio da ${senderName}`, {
            description: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
            duration: 5000,
          });

          // Show push notification if app is not visible
          if (pushNotifications.isSupported() && document.hidden) {
            await pushNotifications.showNotification(
              `Nuovo messaggio da ${senderName}`,
              {
                body: message.content,
                tag: 'new-message',
                requireInteraction: true,
                icon: '/logo.png',
              }
            );
          }

          // Create database notification
          await supabase.from('notifications').insert({
            user_id: userId,
            type: 'message',
            title: `Nuovo messaggio da ${senderName}`,
            message: message.content,
            read: false,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          // Recalculate unread count when messages are marked as read
          if (payload.new && (payload.new as any).read) {
            loadUnreadCount();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadUnreadCount = async () => {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false);

    if (!error && count !== null) {
      setUnreadCount(count);
    }
  };

  const requestNotificationPermission = async () => {
    if (pushNotifications.isSupported()) {
      const granted = await pushNotifications.requestPermission();
      if (granted) {
        toast.success('Notifiche attivate!');
      } else {
        toast.error('Permesso notifiche negato');
      }
      return granted;
    }
    return false;
  };

  return {
    unreadCount,
    requestNotificationPermission,
  };
};
