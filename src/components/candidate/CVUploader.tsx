import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, FileCheck, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CVUploaderProps {
  userId: string;
  currentCvUrl?: string;
  onUploadComplete: (url: string) => void;
}

export const CVUploader = ({ userId, currentCvUrl, onUploadComplete }: CVUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const uploadFile = async (file: File) => {

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

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ cv_url: fileName })
        .eq("id", userId);

      if (updateError) throw updateError;

      onUploadComplete(fileName);
      toast.success("CV caricato con successo!");
    } catch (error) {
      console.error("Error uploading CV:", error);
      toast.error("Errore nel caricamento del CV");
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await uploadFile(file);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
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
      <div
        ref={dropZoneRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        {currentCvUrl ? (
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href={currentCvUrl} target="_blank" rel="noopener noreferrer">
                <FileCheck className="h-4 w-4" />
                Visualizza CV
              </a>
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("cv-upload")?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Aggiorna
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              {isDragging
                ? "Rilascia il file qui"
                : "Trascina il CV qui o clicca per selezionare"}
            </p>
            <p className="text-xs text-muted-foreground mb-3">PDF, max 5MB</p>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={uploading}
              onClick={() => document.getElementById("cv-upload")?.click()}
            >
              <FileUp className="h-4 w-4" />
              {uploading ? "Caricamento..." : "Seleziona file"}
            </Button>
          </div>
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
