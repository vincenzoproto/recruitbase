import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { awardGamificationPoints } from "@/lib/gamification";

interface CommentInputProps {
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  onCommentAdded: () => void;
}

export const CommentInput = ({ 
  postId, 
  userId, 
  userName, 
  userAvatar,
  onCommentAdded 
}: CommentInputProps) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content: comment.trim(),
        });

      if (error) throw error;

      // Award XP for commenting
      await awardGamificationPoints(userId, 'feed_comment_created', { postId });

      toast.success("Commento pubblicato!");
      setComment("");
      onCommentAdded();
    } catch (error: any) {
      console.error('Error posting comment:', error);
      if (error.message?.includes('troppo velocemente')) {
        toast.error(error.message);
      } else {
        toast.error("Errore nella pubblicazione del commento");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <div className="flex gap-3 p-4 border-t">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={userAvatar || undefined} />
        <AvatarFallback className="text-xs">{getInitials(userName)}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 flex gap-2">
        <Textarea
          placeholder="Scrivi un commento..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[40px] max-h-[120px] resize-none"
          maxLength={800}
          disabled={isSubmitting}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!comment.trim() || isSubmitting}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
