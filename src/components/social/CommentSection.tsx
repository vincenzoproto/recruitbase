import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import type { Comment } from "@/types";

interface CommentSectionProps {
  postId: string;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
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
        (payload) => {
          const newCommentData = payload.new as Comment;
          setComments(prev => [...prev, newCommentData]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, loadComments]);

  const handleSubmitComment = useCallback(async () => {
    if (!newComment.trim()) return;

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
          content: newComment
        });

      if (error) throw error;
      
      setNewComment("");
      toast.success("Commento aggiunto!");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Errore nell'aggiungere il commento");
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
    <div className="space-y-4 mt-4 pt-4 border-t">
      {hasComments ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(comment.profiles?.full_name || 'Utente')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-muted rounded-lg p-3">
                  <p className="font-semibold text-sm">{comment.profiles?.full_name || 'Utente'}</p>
                  <p className="text-sm">{comment.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-1">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: it })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Ancora nessun commento. Sii il primo!
        </p>
      )}

      <div className="flex gap-2">
        <Textarea
          placeholder="Scrivi un commento..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="resize-none"
          rows={2}
          disabled={sending}
        />
        <Button 
          onClick={handleSubmitComment}
          disabled={sending || !newComment.trim()}
        >
          {sending ? 'Invio...' : 'Invia'}
        </Button>
      </div>
    </div>
  );
};
