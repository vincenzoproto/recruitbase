import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeChannelOptions {
  table: string;
  event: PostgresChangeEvent;
  filter?: string;
  onPayload: (payload: any) => void;
  enabled?: boolean;
}

/**
 * Hook per gestire sottoscrizioni Realtime Supabase in modo sicuro
 * @example
 * useRealtimeChannel({
 *   table: 'messages',
 *   event: 'INSERT',
 *   filter: `receiver_id=eq.${userId}`,
 *   onPayload: (payload) => console.log('New message:', payload.new),
 *   enabled: true
 * });
 */
export const useRealtimeChannel = ({
  table,
  event,
  filter,
  onPayload,
  enabled = true,
}: UseRealtimeChannelOptions) => {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;

    const channelName = `rt-${table}-${Date.now()}`;
    
    try {
      let channelBuilder = supabase.channel(channelName);
      
      // Build the configuration object
      const config: any = {
        event,
        schema: 'public',
        table,
      };
      
      if (filter) {
        config.filter = filter;
      }

      // Subscribe to postgres changes
      channelBuilder = channelBuilder.on(
        'postgres_changes' as any,
        config,
        onPayload
      );

      const channel = channelBuilder.subscribe();
      channelRef.current = channel;
      
    } catch (error) {
      console.error(`[useRealtimeChannel] Error subscribing to ${table}:`, error);
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, event, filter, enabled]);

  return null;
};