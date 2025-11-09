import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

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
    };
  };
}

export const PostCard = ({ post }: PostCardProps) => {
  const navigate = useNavigate();

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
      </CardContent>
    </Card>
  );
};
