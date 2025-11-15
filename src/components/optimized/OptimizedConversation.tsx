import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOptimizedMessages } from '@/hooks/useOptimizedMessages';
import { useOptimizedProfile } from '@/hooks/useOptimizedProfile';
import { supabase } from '@/integrations/supabase/client';
import OptimizedChatMessage from './OptimizedChatMessage';
import { toast } from 'sonner';

const OptimizedConversation = () => {
  const navigate = useNavigate();
  const { userId: otherUserId } = useParams();
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { profile: otherUserProfile } = useOptimizedProfile(otherUserId);
  const { messages, loading, hasMore, loadMore, sendMessage } = useOptimizedMessages(
    currentUserId,
    otherUserId || ''
  );

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    loadCurrentUser();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = useCallback(async () => {
    if (!messageInput.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(messageInput.trim());
      setMessageInput('');
    } catch (error) {
      toast.error('Errore nell\'invio del messaggio');
    } finally {
      setSending(false);
    }
  }, [messageInput, sending, sendMessage]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop === 0 && hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  if (!otherUserId || !currentUserId) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/messages')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle>
                {otherUserProfile?.full_name || 'Caricamento...'}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-2"
          >
            {loading && (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </div>
            )}

            {messages.map((message) => (
              <OptimizedChatMessage
                key={message.id}
                message={message}
                isCurrentUser={message.sender_id === currentUserId}
                senderName={
                  message.sender_id === currentUserId
                    ? 'Tu'
                    : otherUserProfile?.full_name || 'Utente'
                }
                senderAvatar={
                  message.sender_id === currentUserId
                    ? undefined
                    : otherUserProfile?.avatar_url
                }
              />
            ))}

            <div ref={messagesEndRef} />
          </CardContent>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Scrivi un messaggio..."
                disabled={sending}
              />
              <Button onClick={handleSend} disabled={sending || !messageInput.trim()}>
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default React.memo(OptimizedConversation);
