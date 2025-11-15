import { useCallback, useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const MESSAGES_PER_PAGE = 20;

export const useOptimizedMessages = (currentUserId: string, otherUserId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const offsetRef = useRef(0);
  const channelRef = useRef<any>(null);

  const loadMessages = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const offset = reset ? 0 : offsetRef.current;

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: false })
        .range(offset, offset + MESSAGES_PER_PAGE - 1);

      if (fetchError) throw fetchError;

      const newMessages = (data || []).reverse();

      if (reset) {
        setMessages(newMessages);
        offsetRef.current = MESSAGES_PER_PAGE;
      } else {
        setMessages(prev => [...newMessages, ...prev]);
        offsetRef.current += MESSAGES_PER_PAGE;
      }

      setHasMore((data || []).length === MESSAGES_PER_PAGE);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, otherUserId]);

  useEffect(() => {
    loadMessages(true);

    // Setup realtime subscription
    channelRef.current = supabase
      .channel(`messages_${currentUserId}_${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${otherUserId},receiver_id=eq.${currentUserId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentUserId, otherUserId, loadMessages]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadMessages(false);
    }
  }, [loading, hasMore, loadMessages]);

  const sendMessage = useCallback(async (content: string, mediaUrl?: string) => {
    try {
      const { data, error: sendError } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: otherUserId,
          content,
          media_url: mediaUrl
        })
        .select()
        .single();

      if (sendError) throw sendError;

      setMessages(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [currentUserId, otherUserId]);

  return { messages, loading, hasMore, error, loadMore, sendMessage, refetch: () => loadMessages(true) };
};
