import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, FileText, Image as ImageIcon, FileAudio, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FileAttachmentProps {
  onFileSelected: (url: string, type: string) => void;
  userId: string;
}

export const FileAttachment = ({ onFileSelected, userId }: FileAttachmentProps) => {
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Il file è troppo grande (max 10MB)");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `chat-attachments/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("chat-files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("chat-files")
        .getPublicUrl(filePath);

      // Determine file type
      let fileType = "file";
      if (file.type.startsWith("image/")) fileType = "image";
      else if (file.type.startsWith("audio/")) fileType = "audio";
      else if (file.type.includes("pdf")) fileType = "pdf";
      else if (file.type.includes("document") || file.type.includes("word")) fileType = "document";

      onFileSelected(publicUrl, fileType);
      toast.success("File caricato!");
      setOpen(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Errore nel caricamento del file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,application/pdf,.doc,.docx,audio/*"
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={uploading}
            className="h-9 w-9"
          >
            {uploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2">
          <div className="space-y-1">
            <button
              onClick={() => {
                fileInputRef.current?.setAttribute("accept", "image/*");
                fileInputRef.current?.click();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent smooth-transition"
            >
              <ImageIcon className="h-4 w-4 text-blue-500" />
              <span>Immagine</span>
            </button>
            <button
              onClick={() => {
                fileInputRef.current?.setAttribute("accept", "application/pdf,.doc,.docx");
                fileInputRef.current?.click();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent smooth-transition"
            >
              <FileText className="h-4 w-4 text-red-500" />
              <span>Documento (PDF, DOC)</span>
            </button>
            <button
              onClick={() => {
                fileInputRef.current?.setAttribute("accept", "audio/*");
                fileInputRef.current?.click();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent smooth-transition"
            >
              <FileAudio className="h-4 w-4 text-purple-500" />
              <span>Audio</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
