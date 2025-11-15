import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import OptimizedAvatar from './OptimizedAvatar';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface OptimizedFeedPostProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    media_url?: string;
    profiles: {
      full_name: string;
      avatar_url?: string;
      job_title?: string;
    };
    reactions_count?: number;
    comments_count?: number;
    user_has_reacted?: boolean;
  };
  onReact: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
}

const OptimizedFeedPost: React.FC<OptimizedFeedPostProps> = ({ 
  post, 
  onReact, 
  onComment, 
  onShare 
}) => {
  const [showComments, setShowComments] = useState(false);

  const getInitials = useCallback((name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }, []);

  const handleReact = useCallback(() => {
    onReact(post.id);
  }, [post.id, onReact]);

  const handleComment = useCallback(() => {
    setShowComments(true);
    onComment(post.id);
  }, [post.id, onComment]);

  const handleShare = useCallback(() => {
    onShare(post.id);
  }, [post.id, onShare]);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <OptimizedAvatar
            src={post.profiles.avatar_url}
            alt={post.profiles.full_name}
            fallback={getInitials(post.profiles.full_name)}
            className="h-10 w-10"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{post.profiles.full_name}</p>
            {post.profiles.job_title && (
              <p className="text-sm text-muted-foreground truncate">
                {post.profiles.job_title}
              </p>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(post.created_at), { 
              addSuffix: true, 
              locale: it 
            })}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
        
        {post.media_url && (
          <img 
            src={post.media_url} 
            alt="Post media" 
            className="rounded-lg w-full object-cover max-h-96"
            loading="lazy"
          />
        )}
        
        <div className="flex items-center gap-1 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReact}
            className="flex-1"
          >
            <Heart className={`h-4 w-4 mr-1 ${post.user_has_reacted ? 'fill-red-500 text-red-500' : ''}`} />
            {post.reactions_count || 0}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleComment}
            className="flex-1"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {post.comments_count || 0}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex-1"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Condividi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(OptimizedFeedPost);
