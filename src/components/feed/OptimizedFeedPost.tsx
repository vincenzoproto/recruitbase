import { memo, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";

interface OptimizedFeedPostProps {
  post: any;
  currentUserId: string;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
}

export const OptimizedFeedPost = memo(({ 
  post, 
  currentUserId, 
  onLike, 
  onComment, 
  onShare 
}: OptimizedFeedPostProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleVideoPlay = useCallback(() => {
    setVideoPlaying(true);
  }, []);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiato negli appunti");
    onShare(post.id);
  }, [post.id, onShare]);

  const initials = post.profiles?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.profiles?.avatar_url} alt={post.profiles?.full_name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{post.profiles?.full_name}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
              locale: it,
            })}
          </p>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
      )}

      {/* Media */}
      {post.media_url && post.media_type === "image" && (
        <div className="relative bg-muted rounded-lg overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}
          <img
            src={post.media_url}
            alt="Post media"
            className="w-full h-auto"
            onLoad={handleImageLoad}
            loading="lazy"
          />
        </div>
      )}

      {post.media_url && post.media_type === "video" && (
        <video
          src={post.media_url}
          controls
          muted
          autoPlay={videoPlaying}
          onPlay={handleVideoPlay}
          className="w-full rounded-lg"
          preload="metadata"
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLike(post.id)}
          className="gap-2"
        >
          <Heart className={`h-5 w-5 ${post.user_has_liked ? "fill-destructive text-destructive" : ""}`} />
          <span className="text-sm">{post.like_count || 0}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onComment(post.id)}
          className="gap-2"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">{post.comment_count || 0}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="gap-2"
        >
          <Share2 className="h-5 w-5" />
          <span className="text-sm">Condividi</span>
        </Button>
      </div>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.like_count === nextProps.post.like_count &&
    prevProps.post.comment_count === nextProps.post.comment_count &&
    prevProps.post.user_has_liked === nextProps.post.user_has_liked
  );
});

OptimizedFeedPost.displayName = "OptimizedFeedPost";
