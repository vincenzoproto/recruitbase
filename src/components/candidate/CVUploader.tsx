import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, FileCheck, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CVUploaderProps {
  userId: string;
  currentCvUrl?: string;
  onUploadComplete: (url: string) => void;
}

export const CVUploader = ({ userId, currentCvUrl, onUploadComplete }: CVUploaderProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Il file è troppo grande. Max 5MB");
      return;
    }

    if (!file.type.includes("pdf")) {
      toast.error("Solo file PDF sono supportati");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/cv.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("cvs")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ cv_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      onUploadComplete(publicUrl);
      toast.success("CV caricato con successo!");
    } catch (error) {
      console.error("Error uploading CV:", error);
      toast.error("Errore nel caricamento del CV");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const fileName = `${userId}/cv.pdf`;
      await supabase.storage.from("cvs").remove([fileName]);

      await supabase
        .from("profiles")
        .update({ cv_url: null })
        .eq("id", userId);

      onUploadComplete("");
      toast.success("CV eliminato");
    } catch (error) {
      console.error("Error deleting CV:", error);
      toast.error("Errore nell'eliminazione");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {currentCvUrl ? (
          <>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href={currentCvUrl} target="_blank" rel="noopener noreferrer">
                <FileCheck className="h-4 w-4" />
                Visualizza CV
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={uploading}
            onClick={() => document.getElementById("cv-upload")?.click()}
          >
            <FileUp className="h-4 w-4" />
            {uploading ? "Caricamento..." : "Carica CV"}
          </Button>
        )}
      </div>
      <input
        id="cv-upload"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
};
