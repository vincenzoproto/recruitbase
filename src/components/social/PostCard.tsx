import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { toast } from "sonner";
import { PostActions } from "./PostActions";
import { CommentSection } from "./CommentSection";

interface PostCardProps {
  post: {
    id: string;
    content: string | null;
    media_url: string | null;
    media_type: string | null;
    hashtags: string[] | null;
    created_at: string;
    profiles: {
      id: string;
      full_name: string;
      avatar_url: string | null;
      job_title: string | null;
      role?: string | null;
      talent_relationship_score?: number | null;
      core_values?: string[] | null;
    };
  };
}

export const PostCard = ({ post }: PostCardProps) => {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Sei sicuro di voler eliminare questo post?")) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;
      toast.success("Post eliminato");
      window.location.reload();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error("Errore nell'eliminare il post");
    }
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
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 md:pb-3">
        <div className="flex items-start gap-2 md:gap-3">
          <Avatar 
            className="cursor-pointer h-8 w-8 md:h-10 md:w-10" 
            onClick={() => navigate(`/profile/${post.profiles.id}`)}
          >
            <AvatarImage src={post.profiles.avatar_url || undefined} />
            <AvatarFallback className="text-xs">{getInitials(post.profiles.full_name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
              <h4 
                className="font-semibold text-sm md:text-base cursor-pointer hover:underline truncate"
                onClick={() => navigate(`/profile/${post.profiles.id}`)}
              >
                {post.profiles.full_name}
              </h4>
              {post.profiles.role && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  {post.profiles.role === 'recruiter' ? '👔' : '👤'}
                  <span className="hidden sm:inline ml-1">
                    {post.profiles.role === 'recruiter' ? 'Recruiter' : 'Candidato'}
                  </span>
                </Badge>
              )}
              {post.profiles.talent_relationship_score && post.profiles.talent_relationship_score > 70 && (
                <Badge variant="outline" className="text-xs text-primary border-primary shrink-0">
                  TRS {post.profiles.talent_relationship_score}
                </Badge>
              )}
            </div>
            {post.profiles.job_title && (
              <p className="text-xs md:text-sm text-muted-foreground truncate">{post.profiles.job_title}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: it })}
            </p>
          </div>
          {currentUserId === post.profiles.id && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeletePost}
              className="h-7 w-7 md:h-8 md:w-8 shrink-0"
            >
              <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 md:space-y-3 pb-3 md:pb-4">
        {post.content && (
          <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{formatContent(post.content)}</p>
        )}

        {post.media_url && post.media_type === 'image' && (
          <img 
            src={post.media_url} 
            alt="Post media" 
            className="rounded-lg max-h-80 md:max-h-96 w-full object-cover"
            loading="lazy"
          />
        )}

        {post.media_url && post.media_type === 'video' && (
          <video 
            controls 
            className="rounded-lg max-h-80 md:max-h-96 w-full"
            preload="metadata"
          >
            <source src={post.media_url} />
            Il tuo browser non supporta l'elemento video.
          </video>
        )}

        {post.media_url && post.media_type === 'audio' && (
          <div className="bg-accent/50 rounded-lg p-3 md:p-4">
            <audio controls className="w-full">
              <source src={post.media_url} />
              Il tuo browser non supporta l'elemento audio.
            </audio>
          </div>
        )}

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 md:gap-2 pt-1 md:pt-2">
            {post.hashtags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <PostActions 
          postId={post.id} 
          onCommentClick={() => setShowComments(!showComments)}
        />

        {showComments && <CommentSection postId={post.id} />}
      </CardContent>
    </Card>
  );
};
