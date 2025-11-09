import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import { toast } from "sonner";

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
      
      // Load likes
      const { data: likesData, error: likesError } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId);
      
      if (likesError) throw likesError;
      setLikes(likesData?.length || 0);
      
      if (user) {
        const userLiked = likesData?.some(r => r.user_id === user.id);
        setHasLiked(userLiked || false);
      }

      // Load reposts
      const { data: repostsData, error: repostsError } = await supabase
        .from('post_reposts')
        .select('*')
        .eq('post_id', postId);
      
      if (repostsError) throw repostsError;
      setReposts(repostsData?.length || 0);
      
      if (user) {
        const userReposted = repostsData?.some(r => r.user_id === user.id);
        setHasReposted(userReposted || false);
      }

      // Load comments count
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId);
      
      if (commentsError) throw commentsError;
      setComments(commentsData?.length || 0);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const toggleLike = async () => {
    if (!userId) {
      toast.error("Devi effettuare l'accesso per mettere mi piace");
      return;
    }

    try {
      if (hasLiked) {
        await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
        setHasLiked(false);
        setLikes(likes - 1);
      } else {
        await supabase
          .from('post_reactions')
          .insert({ post_id: postId, user_id: userId, reaction_type: 'like' });
        setHasLiked(true);
        setLikes(likes + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error("Errore nell'aggiornare la reazione");
    }
  };

  const toggleRepost = async () => {
    if (!userId) {
      toast.error("Devi effettuare l'accesso per repostare");
      return;
    }

    try {
      if (hasReposted) {
        await supabase
          .from('post_reposts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
        setHasReposted(false);
        setReposts(reposts - 1);
        toast.success("Repost rimosso");
      } else {
        await supabase
          .from('post_reposts')
          .insert({ post_id: postId, user_id: userId });
        setHasReposted(true);
        setReposts(reposts + 1);
        toast.success("Post repostato!");
      }
    } catch (error) {
      console.error('Error toggling repost:', error);
      toast.error("Errore nel repost");
    }
  };

  return (
    <div className="flex items-center gap-4 pt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLike}
        className={hasLiked ? "text-red-500" : ""}
      >
        <Heart className={`h-4 w-4 mr-1 ${hasLiked ? "fill-current" : ""}`} />
        {likes}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onCommentClick}
      >
        <MessageCircle className="h-4 w-4 mr-1" />
        {comments}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={toggleRepost}
        className={hasReposted ? "text-green-500" : ""}
      >
        <Repeat2 className="h-4 w-4 mr-1" />
        {reposts}
      </Button>
    </div>
  );
};
