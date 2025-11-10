import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Image, Mic, Video, Send, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface CreatePostProps {
  onPostCreated: () => void;
}

export const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "audio" | "video" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[\w\u00C0-\u017F]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.toLowerCase()) : [];
  };

  const handleMediaSelect = (file: File, type: "image" | "audio" | "video") => {
    if (!file) return;

    // Validate file size
    const maxSize = type === "image" ? 10 : 50;
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File troppo grande. Massimo ${maxSize}MB`);
      return;
    }

    setMediaFile(file);
    setMediaType(type);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setUploadProgress(0);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile) {
      toast.error("Scrivi qualcosa o aggiungi un media");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let mediaUrl = null;

      // Upload media if present
      if (mediaFile && mediaType) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        setUploadProgress(30);

        const { error: uploadError } = await supabase.storage
          .from('chat-media')
          .upload(fileName, mediaFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        setUploadProgress(60);

        const { data: urlData } = supabase.storage
          .from('chat-media')
          .getPublicUrl(fileName);

        mediaUrl = urlData.publicUrl;
      }

      setUploadProgress(80);

      // Extract hashtags
      const hashtags = extractHashtags(content);

      // Create post
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim() || null,
          media_url: mediaUrl,
          media_type: mediaType,
          hashtags: hashtags.length > 0 ? hashtags : null,
        });

      if (postError) throw postError;

      setUploadProgress(100);

      // Clear form
      setContent("");
      clearMedia();
      
      toast.success("Post pubblicato con successo! ✅", {
        duration: 3000,
      });

      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error("Errore nella pubblicazione del post");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-6 space-y-4">
        <Textarea
          placeholder="Cosa vuoi condividere con la community?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none"
          disabled={uploading}
        />

        {/* Media Preview */}
        {mediaPreview && (
          <div className="relative rounded-lg overflow-hidden border">
            {mediaType === "image" && (
              <img src={mediaPreview} alt="Preview" className="w-full h-48 object-cover" />
            )}
            {mediaType === "video" && (
              <video src={mediaPreview} className="w-full h-48 object-cover" controls />
            )}
            {mediaType === "audio" && (
              <div className="flex items-center gap-3 p-4 bg-accent">
                <Mic className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Audio selezionato</span>
              </div>
            )}
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={clearMedia}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Caricamento in corso...</span>
              <span className="font-medium text-primary">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleMediaSelect(e.target.files[0], "image")}
              disabled={uploading || !!mediaFile}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading || !!mediaFile}
              title="Aggiungi immagine"
            >
              <Image className="h-5 w-5" />
            </Button>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleMediaSelect(e.target.files[0], "video")}
              disabled={uploading || !!mediaFile}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading || !!mediaFile}
              title="Aggiungi video"
            >
              <Video className="h-5 w-5" />
            </Button>

            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleMediaSelect(e.target.files[0], "audio")}
              disabled={uploading || !!mediaFile}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => audioInputRef.current?.click()}
              disabled={uploading || !!mediaFile}
              title="Aggiungi audio"
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={uploading || (!content.trim() && !mediaFile)}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Pubblicazione...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Pubblica
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Usa #hashtag per categorizzare il tuo post
        </p>
      </CardContent>
    </Card>
  );
};
