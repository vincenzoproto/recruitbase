import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Image, Mic, Video, Send, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { useAdvancedXPSystem } from "@/hooks/useAdvancedXPSystem";

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
  const [userId, setUserId] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const { trackAction } = useAdvancedXPSystem(userId || undefined);

  useEffect(() => {
    loadUserId();
  }, []);

  const loadUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[\w\u00C0-\u017F]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.toLowerCase()) : [];
  };

  const handleMediaSelect = (file: File, type: "image" | "audio" | "video") => {
    if (!file) return;

    const maxSize = type === "image" ? 10 : 50;
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File troppo grande. Massimo ${maxSize}MB`);
      return;
    }

    setMediaFile(file);
    setMediaType(type);

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

    if (content.length > 2000) {
      toast.error("Il contenuto non può superare i 2000 caratteri");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Devi effettuare l'accesso per pubblicare");
        return;
      }

      let mediaUrl = null;

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

      const hashtags = extractHashtags(content);

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

      setContent("");
      clearMedia();
      
      toast.success("Post pubblicato con successo! ✅", {
        duration: 3000,
      });

      // Award XP for creating a post
      trackAction('posts', 5, 'Post pubblicato sul feed');

      onPostCreated();
    } catch (error: any) {
      console.error('Error creating post:', error);
      
      if (error?.message?.includes('troppo velocemente')) {
        toast.error("⚠️ Stai pubblicando troppo velocemente. Attendi qualche minuto.");
      } else if (error?.message?.includes('2000 caratteri')) {
        toast.error("Il contenuto non può superare i 2000 caratteri");
      } else if (error?.message?.includes('script')) {
        toast.error("Contenuto non valido: script o codice non consentito");
      } else {
        toast.error("Errore nella pubblicazione del post");
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-4 md:pt-6">
        <div className="space-y-3 md:space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Cosa vuoi condividere con la community? #hiring #opportunità"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px] md:min-h-[100px] resize-none text-sm md:text-base pr-16"
              disabled={uploading}
              maxLength={2000}
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {content.length}/2000
            </div>
          </div>

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
                className="absolute top-2 right-2 h-7 w-7"
                onClick={clearMedia}
                disabled={uploading}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {uploading && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Caricamento in corso...</span>
                <span className="font-medium text-primary">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-1 md:gap-2">
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
                size="sm"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploading || !!mediaFile}
                title="Aggiungi immagine"
                className="h-8 md:h-9 px-2 md:px-3"
              >
                <Image className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
                size="sm"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploading || !!mediaFile}
                title="Aggiungi video"
                className="h-8 md:h-9 px-2 md:px-3"
              >
                <Video className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
                size="sm"
                onClick={() => audioInputRef.current?.click()}
                disabled={uploading || !!mediaFile}
                title="Aggiungi audio"
                className="h-8 md:h-9 px-2 md:px-3"
              >
                <Mic className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={uploading || (!content.trim() && !mediaFile)}
              className="gap-2 h-8 md:h-9 text-sm"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />
                  <span className="hidden sm:inline">Caricamento...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Pubblica
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
