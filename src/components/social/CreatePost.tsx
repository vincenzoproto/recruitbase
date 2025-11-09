import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Image, Mic, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface CreatePostProps {
  onPostCreated: () => void;
}

export const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[\w\u00C0-\u017F]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.toLowerCase()) : [];
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("Il file è troppo grande (max 10MB)");
      return;
    }

    setMediaFile(file);
    
    if (type === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setMediaPreview('audio');
    }
  };

  const uploadMedia = async (file: File, mediaType: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile) {
      toast.error("Scrivi qualcosa o aggiungi un media");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let mediaUrl = null;
      let mediaType = null;

      if (mediaFile) {
        const type = mediaFile.type.startsWith('image/') ? 'image' : 'audio';
        mediaUrl = await uploadMedia(mediaFile, type);
        mediaType = type;
        
        if (!mediaUrl) {
          throw new Error("Failed to upload media");
        }
      }

      const hashtags = extractHashtags(content);

      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim() || null,
          media_url: mediaUrl,
          media_type: mediaType,
          hashtags: hashtags.length > 0 ? hashtags : null,
        });

      if (error) throw error;

      toast.success("Post pubblicato!");
      setContent("");
      setMediaFile(null);
      setMediaPreview(null);
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error("Errore nella pubblicazione del post");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <Textarea
          placeholder="Cosa stai pensando? Usa #hashtag per taggare..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none"
        />

        {mediaPreview && (
          <div className="relative inline-block">
            {mediaPreview === 'audio' ? (
              <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                <Mic className="h-5 w-5" />
                <span className="text-sm">Audio selezionato</span>
              </div>
            ) : (
              <img 
                src={mediaPreview} 
                alt="Preview" 
                className="max-h-40 rounded-lg"
              />
            )}
            <Button
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={() => {
                setMediaFile(null);
                setMediaPreview(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('post-image-input')?.click()}
              disabled={uploading}
            >
              <Image className="h-4 w-4 mr-2" />
              Immagine
            </Button>
            <input
              id="post-image-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleMediaSelect(e, 'image')}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('post-audio-input')?.click()}
              disabled={uploading}
            >
              <Mic className="h-4 w-4 mr-2" />
              Audio
            </Button>
            <input
              id="post-audio-input"
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => handleMediaSelect(e, 'audio')}
            />
          </div>

          <Button onClick={handleSubmit} disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Pubblicazione...
              </>
            ) : (
              "Pubblica"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
