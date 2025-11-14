import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import { toast } from "sonner";
import { hapticFeedback } from "@/lib/haptics";
import { useAdvancedXPSystem } from "@/hooks/useAdvancedXPSystem";

interface PostActionsProps {
  postId: string;
  onCommentClick: () => void;
}

export const PostActions = ({ postId, onCommentClick }: PostActionsProps) => {
  const [likes, setLikes] = useState(0);
  const [reposts, setReposts] = useState(0);
  const [comments, setComments] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasReposted, setHasReposted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { trackAction } = useAdvancedXPSystem(userId || undefined);

  useEffect(() => {
    loadStats();
    getCurrentUser();
  }, [postId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: likesData, error: likesError } = await supabase
        .from('post_reactions')
        .select('user_id')
        .eq('post_id', postId);
      
      if (likesError) throw likesError;
      setLikes(likesData?.length || 0);
      
      if (user) {
        setHasLiked(likesData?.some(r => r.user_id === user.id) || false);
      }

      const { data: repostsData, error: repostsError } = await supabase
        .from('post_reposts')
        .select('user_id')
        .eq('post_id', postId);
      
      if (repostsError) throw repostsError;
      setReposts(repostsData?.length || 0);
      
      if (user) {
        setHasReposted(repostsData?.some(r => r.user_id === user.id) || false);
      }

      const { count, error: commentsError } = await supabase
        .from('post_comments')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);
      
      if (commentsError) throw commentsError;
      setComments(count || 0);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const toggleLike = async () => {
    if (!userId) {
      toast.error("Devi effettuare l'accesso per mettere mi piace");
      return;
    }

    if (loading) return;
    setLoading(true);

    await hapticFeedback.light();

    const previousLikes = likes;
    const previousHasLiked = hasLiked;
    
    setHasLiked(!hasLiked);
    setLikes(hasLiked ? likes - 1 : likes + 1);

    try {
      if (hasLiked) {
        const { error } = await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_reactions')
          .insert({ post_id: postId, user_id: userId, reaction_type: 'like' });
        
        if (error) throw error;
        toast.success("❤️ Like aggiunto", { duration: 1500 });
        
        // Award XP for like
        trackAction('posts', 1, 'Like su un post');
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      
      setHasLiked(previousHasLiked);
      setLikes(previousLikes);
      
      if (error?.message?.includes('unique')) {
        toast.error("Hai già messo like a questo post");
      } else {
        toast.error("Errore nell'aggiornare la reazione");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleRepost = async () => {
    if (!userId) {
      toast.error("Devi effettuare l'accesso per repostare");
      return;
    }

    if (loading) return;
    setLoading(true);

    await hapticFeedback.medium();

    const previousReposts = reposts;
    const previousHasReposted = hasReposted;
    
    setHasReposted(!hasReposted);
    setReposts(hasReposted ? reposts - 1 : reposts + 1);

    try {
      if (hasReposted) {
        const { error } = await supabase
          .from('post_reposts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
        
        if (error) throw error;
        toast.success("Repost rimosso");
      } else {
        const { error } = await supabase
          .from('post_reposts')
          .insert({ post_id: postId, user_id: userId });
        
        if (error) throw error;
        toast.success("🔄 Post condiviso!", { duration: 1500 });
        
        // Award XP for repost
        trackAction('shares', 10, 'Repost di un contenuto');
      }
    } catch (error: any) {
      console.error('Error toggling repost:', error);
      
      setHasReposted(previousHasReposted);
      setReposts(previousReposts);
      
      toast.error("Errore nel repostare");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 md:gap-6 pt-2 md:pt-3 border-t">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLike}
        disabled={loading}
        className={`gap-1.5 md:gap-2 h-8 md:h-9 px-2 md:px-3 ${
          hasLiked ? 'text-red-500 hover:text-red-600' : ''
        }`}
      >
        <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
        <span className="text-xs md:text-sm font-medium">{likes}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onCommentClick}
        className="gap-1.5 md:gap-2 h-8 md:h-9 px-2 md:px-3"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-xs md:text-sm font-medium">{comments}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={toggleRepost}
        disabled={loading}
        className={`gap-1.5 md:gap-2 h-8 md:h-9 px-2 md:px-3 ${
          hasReposted ? 'text-green-500 hover:text-green-600' : ''
        }`}
      >
        <Repeat2 className="h-4 w-4" />
        <span className="text-xs md:text-sm font-medium">{reposts}</span>
      </Button>
    </div>
  );
};
