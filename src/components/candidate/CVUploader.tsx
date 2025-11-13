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
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { uploadCV, openCV, deleteCV, uploading } = useCVManager(userId);

  const uploadFile = async (file: File) => {
    const cvPath = await uploadCV(file);
    if (cvPath) {
      await supabase
        .from("profiles")
        .update({ cv_url: cvPath })
        .eq("id", userId);
      
      onUploadComplete();
    }
  };

  const openCV = async () => {
    if (!currentCvUrl) return;
    
    try {
      // If it's already a full URL, open directly
      if (currentCvUrl.startsWith('http')) {
        window.open(currentCvUrl, '_blank');
        return;
      }

      // Otherwise, create signed URL from path
      const path = currentCvUrl.replace(/^cvs\//, '');
      const { data, error } = await supabase.storage
        .from('cvs')
        .createSignedUrl(path, 60);

      if (error) throw error;
      if (data) window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error opening CV:', error);
      toast.error('Errore nell\'apertura del CV');
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
    if (!currentCvUrl) return;

    const success = await deleteCV(currentCvUrl);
    if (success) {
      await supabase
        .from("profiles")
        .update({ cv_url: null })
        .eq("id", userId);
      
      onUploadComplete();
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
            <Button variant="outline" size="sm" className="gap-2" onClick={openCV}>
              <FileCheck className="h-4 w-4" />
              Visualizza CV
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
