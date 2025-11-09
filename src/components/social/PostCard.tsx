import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Repeat2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PostCardProps {
  post: {
    id: string;
    content: string | null;
    media_url: string | null;
    media_type: string | null;
    hashtags: string[] | null;
    created_at: string;
    user_id: string;
    profiles: {
      id: string;
      full_name: string;
      avatar_url: string | null;
      job_title: string | null;
    };
  };
  onDelete?: () => void;
}

export const PostCard = ({ post, onDelete }: PostCardProps) => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [reactions, setReactions] = useState<any[]>([]);
  const [reposts, setReposts] = useState<any[]>([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasReposted, setHasReposted] = useState(false);

  useEffect(() => {
    loadCurrentUser();
    loadComments();
    loadReactions();
    loadReposts();
  }, [post.id]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const loadComments = async () => {
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
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setComments(data);
    }
  };

  const loadReactions = async () => {
    const { data, error } = await supabase
      .from('post_reactions')
      .select('*')
      .eq('post_id', post.id);

    if (!error && data) {
      setReactions(data);
      if (currentUserId) {
        setHasLiked(data.some(r => r.user_id === currentUserId));
      }
    }
  };

  const loadReposts = async () => {
    const { data, error } = await supabase
      .from('post_reposts')
      .select('*')
      .eq('post_id', post.id);

    if (!error && data) {
      setReposts(data);
      if (currentUserId) {
        setHasReposted(data.some(r => r.user_id === currentUserId));
      }
    }
  };

  const handleLike = async () => {
    if (!currentUserId) return;

    if (hasLiked) {
      await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', currentUserId);
    } else {
      await supabase
        .from('post_reactions')
        .insert({ post_id: post.id, user_id: currentUserId });
    }
    loadReactions();
  };

  const handleRepost = async () => {
    if (!currentUserId) return;

    if (hasReposted) {
      await supabase
        .from('post_reposts')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', currentUserId);
      toast.success("Repost rimosso");
    } else {
      await supabase
        .from('post_reposts')
        .insert({ post_id: post.id, user_id: currentUserId });
      toast.success("Post repostato!");
    }
    loadReposts();
  };

  const handleComment = async () => {
    if (!currentUserId || !newComment.trim()) return;

    const { error } = await supabase
      .from('post_comments')
      .insert({ post_id: post.id, user_id: currentUserId, content: newComment });

    if (!error) {
      setNewComment("");
      loadComments();
      toast.success("Commento pubblicato!");
    }
  };

  const handleDelete = async () => {
    if (!currentUserId || currentUserId !== post.user_id) return;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id);

    if (!error) {
      toast.success("Post eliminato");
      onDelete?.();
    } else {
      toast.error("Errore nell'eliminazione del post");
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const formatContent = (content: string | null) => {
    if (!content) return null;
    
    // Replace hashtags with clickable badges (for visual only)
    const parts = content.split(/(#[\w\u00C0-\u017F]+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('#')) {
        return (
          <span key={idx} className="text-primary font-semibold">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar 
            className="cursor-pointer" 
            onClick={() => navigate(`/profile/${post.profiles.id}`)}
          >
            <AvatarImage src={post.profiles.avatar_url || undefined} />
            <AvatarFallback>{getInitials(post.profiles.full_name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 
              className="font-semibold cursor-pointer hover:underline"
              onClick={() => navigate(`/profile/${post.profiles.id}`)}
            >
              {post.profiles.full_name}
            </h4>
            {post.profiles.job_title && (
              <p className="text-sm text-muted-foreground">{post.profiles.job_title}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: it })}
            </p>
          </div>
          {currentUserId === post.user_id && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {post.content && (
          <p className="whitespace-pre-wrap">{formatContent(post.content)}</p>
        )}

        {post.media_url && post.media_type === 'image' && (
          <img 
            src={post.media_url} 
            alt="Post media" 
            className="rounded-lg max-h-96 w-full object-cover"
          />
        )}

        {post.media_url && post.media_type === 'audio' && (
          <audio controls className="w-full">
            <source src={post.media_url} />
            Il tuo browser non supporta l'elemento audio.
          </audio>
        )}

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {post.hashtags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={hasLiked ? "text-red-500" : ""}
          >
            <Heart className={`h-4 w-4 mr-1 ${hasLiked ? "fill-current" : ""}`} />
            {reactions.length}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {comments.length}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRepost}
            className={hasReposted ? "text-green-500" : ""}
          >
            <Repeat2 className="h-4 w-4 mr-1" />
            {reposts.length}
          </Button>
        </div>

        {showComments && (
          <div className="space-y-3 pt-3 border-t">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                  <AvatarFallback>{getInitials(comment.profiles?.full_name || "U")}</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted rounded-lg p-2">
                  <p className="text-sm font-semibold">{comment.profiles?.full_name}</p>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Scrivi un commento..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              />
              <Button onClick={handleComment}>Invia</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
