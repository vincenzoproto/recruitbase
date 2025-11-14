import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import type { Comment } from "@/types";
import { useAdvancedXPSystem } from "@/hooks/useAdvancedXPSystem";

interface CommentSectionProps {
  postId: string;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { trackAction } = useAdvancedXPSystem(userId || undefined);

  useEffect(() => {
    loadUserId();
  }, []);

  const loadUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setComments(data as Comment[]);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Errore nel caricamento dei commenti');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
    
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, loadComments]);

  const handleSubmitComment = useCallback(async () => {
    if (!newComment.trim()) {
      toast.error("Il commento non può essere vuoto");
      return;
    }

    if (newComment.length > 800) {
      toast.error("Il commento non può superare gli 800 caratteri");
      return;
    }

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Devi effettuare l'accesso per commentare");
        return;
      }

      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;
      
      setNewComment("");
      toast.success("Commento aggiunto!");
      
      // Award XP for commenting
      trackAction('comments', 3, 'Commento su un post');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      
      if (error?.message?.includes('troppo velocemente')) {
        toast.error("⚠️ Stai commentando troppo velocemente. Attendi qualche minuto.");
      } else if (error?.message?.includes('800 caratteri')) {
        toast.error("Il commento non può superare gli 800 caratteri");
      } else if (error?.message?.includes('script')) {
        toast.error("Contenuto non valido: script o codice non consentito");
      } else {
        toast.error("Errore nell'aggiungere il commento");
      }
    } finally {
      setSending(false);
    }
  }, [postId, newComment]);

  const getInitials = useCallback((name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  }, []);

  const hasComments = comments.length > 0;

  if (loading && !hasComments) {
    return (
      <div className="space-y-4 mt-4 pt-4 border-t">
        <p className="text-sm text-muted-foreground text-center">Caricamento commenti...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4 mt-3 md:mt-4 pt-3 md:pt-4 border-t">
      {hasComments ? (
        <div className="space-y-2 md:space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 md:gap-3">
              <Avatar className="h-7 w-7 md:h-8 md:w-8 shrink-0">
                <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(comment.profiles?.full_name || 'Utente')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="bg-accent/50 rounded-lg p-2 md:p-3">
                  <p className="font-semibold text-xs md:text-sm">
                    {comment.profiles?.full_name || 'Utente'}
                  </p>
                  <p className="text-xs md:text-sm text-foreground mt-0.5 md:mt-1 break-words">
                    {comment.content}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-2 md:ml-3">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: it })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs md:text-sm text-muted-foreground text-center py-2 md:py-4">
          Nessun commento ancora. Sii il primo!
        </p>
      )}

      <div className="flex gap-2 md:gap-3">
        <div className="relative flex-1">
          <Textarea
            placeholder="Scrivi un commento..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[60px] md:min-h-[80px] resize-none text-sm pr-12 md:pr-14"
            disabled={sending}
            maxLength={800}
          />
          <div className="absolute bottom-1.5 right-1.5 md:bottom-2 md:right-2 text-xs text-muted-foreground">
            {newComment.length}/800
          </div>
        </div>
        <Button
          onClick={handleSubmitComment}
          disabled={sending || !newComment.trim()}
          size="sm"
          className="self-end h-[60px] md:h-[80px] w-12 md:w-14"
        >
          {sending ? (
            <div className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <span className="text-base md:text-lg">💬</span>
          )}
        </Button>
      </div>
    </div>
  );
};
