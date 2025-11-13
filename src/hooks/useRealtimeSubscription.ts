import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSubscriptionOptions {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onPayload: (payload: any) => void;
  enabled?: boolean;
}

export const useRealtimeSubscription = ({
  table,
  event,
  filter,
  onPayload,
  enabled = true,
}: UseRealtimeSubscriptionOptions) => {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const channelName = `realtime-${table}-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          ...(filter && { filter }),
        },
        (payload) => {
          onPayload(payload);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [table, event, filter, onPayload, enabled]);

  return null;
};
